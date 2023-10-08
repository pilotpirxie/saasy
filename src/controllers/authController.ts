import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import Joi from "joi";
import crypto, { pbkdf2Sync } from "crypto";
import totp from "totp-generator";
import jwt from "jsonwebtoken";
import dayjs from "dayjs";
import ms from "ms";
import validation from "../middlewares/validation";
import { TypedRequest } from "../types/express";
import { getIp } from "../utils/getIp";
import { EmailService } from "../services/emailService";
import { EmailTemplates } from "../services/emailTemplates";

export type JwtInfo = {
  secret: string;
  timeout: string;
  refreshTokenTimeout: string;
};

export function getTokens({
  userId,
  jwtInfo,
  session,
}: {
  userId: string;
  session: {
    id: string;
    refreshTokenSecretKey: string;
  };
  jwtInfo: JwtInfo;
}) {
  const jwtToken = jwt.sign(
    {
      sub: userId,
    },
    jwtInfo.secret,
    {
      expiresIn: jwtInfo.timeout,
    },
  );

  const jwtRefreshToken = jwt.sign(
    {
      sub: userId,
      jti: session.id,
    },
    session.refreshTokenSecretKey,
    {
      expiresIn: jwtInfo.refreshTokenTimeout,
    },
  );

  return { jwtToken, jwtRefreshToken };
}

export async function createSession({
  prisma,
  userId,
  ip,
  jwtInfo,
  userAgent,
  authProviderType,
}: {
  prisma: PrismaClient;
  userId: string;
  ip: string;
  userAgent: string;
  authProviderType:
    | "twitter"
    | "github"
    | "facebook"
    | "google"
    | "gitlab"
    | "bitbucket"
    | "email"
    | "apple";
  jwtInfo: JwtInfo;
}): Promise<{ jwtToken: string; jwtRefreshToken: string }> {
  const session = await prisma.session.create({
    data: {
      userId,
      ipAddress: ip,
      refreshTokenSecretKey: crypto.randomBytes(32).toString("hex"),
      userAgent,
      expiresAt: dayjs().add(ms(jwtInfo.timeout), "millisecond").toDate(),
      authProviderType,
    },
  });

  return getTokens({
    userId,
    session,
    jwtInfo,
  });
}

export default function getAuthController({
  jwtInfo,
  prisma,
  emailService,
  emailTemplatesService,
}: {
  jwtInfo: JwtInfo;
  prisma: PrismaClient;
  emailService: EmailService;
  emailTemplatesService: EmailTemplates;
}): Router {
  const router = Router();

  const loginSchema = {
    body: {
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      totpCode: Joi.string().optional(),
    },
  };

  router.post(
    "/login",
    validation(loginSchema),
    async (req: TypedRequest<typeof loginSchema>, res, next) => {
      try {
        const { email, password, totpCode } = req.body;

        const user = await prisma.user.findFirst({
          select: {
            id: true,
            password: true,
            salt: true,
            iterations: true,
            totpAddedAt: true,
            totpToken: true,
          },
          where: {
            email,
          },
        });

        if (!user) {
          return res.sendStatus(404);
        }

        const hashedPassword = pbkdf2Sync(
          user.password,
          user.salt,
          user.iterations,
          64,
          "sha512",
        ).toString("hex");

        if (hashedPassword !== password) {
          return res.sendStatus(401);
        }

        if (user.totpAddedAt && user.totpToken) {
          if (!totpCode) {
            return res.sendStatus(401);
          }

          const expectedTotpCode = totp(user.totpToken);

          if (expectedTotpCode !== totpCode) {
            return res.sendStatus(401);
          }
        }

        const ip = getIp(req);

        const { jwtToken, jwtRefreshToken } = await createSession({
          prisma,
          userId: user.id,
          ip,
          jwtInfo,
          userAgent: req.headers["user-agent"] || "",
          authProviderType: "email",
        });

        return res.json({
          accessToken: jwtToken,
          refreshToken: jwtRefreshToken,
        });
      } catch (error) {
        return next(error);
      }
    },
  );

  const totpStatusSchema = {
    body: {
      email: Joi.string().email().required(),
    },
  };

  router.post(
    "/totp-status",
    validation(totpStatusSchema),
    async (req: TypedRequest<typeof totpStatusSchema>, res, next) => {
      try {
        const { email } = req.body;

        const user = await prisma.user.findFirst({
          select: {
            id: true,
            totpAddedAt: true,
          },
          where: {
            email,
          },
        });

        if (!user) {
          return res.sendStatus(404);
        }

        return res.json({
          enabled: !!user.totpAddedAt,
        });
      } catch (error) {
        return next(error);
      }
    },
  );

  const refreshSchema = {
    body: {
      refreshToken: Joi.string().required(),
    },
  };

  router.post(
    "/refresh",
    validation(refreshSchema),
    async (req: TypedRequest<typeof refreshSchema>, res, next) => {
      try {
        const { refreshToken } = req.body;

        const decoded = jwt.decode(refreshToken) as {
          sub: string;
          jti: string;
        };

        const session = await prisma.session.findFirst({
          select: {
            id: true,
            refreshTokenSecretKey: true,
            revokedAt: true,
          },
          where: {
            id: decoded.jti,
            userId: decoded.sub,
          },
        });

        if (!session) {
          return res.sendStatus(401);
        }

        if (session.revokedAt) {
          return res.sendStatus(401);
        }

        try {
          jwt.verify(refreshToken, session.refreshTokenSecretKey);
        } catch (error) {
          return res.sendStatus(401);
        }

        const user = await prisma.user.findFirst({
          select: {
            id: true,
          },
          where: {
            id: decoded.sub,
          },
        });

        if (!user) {
          return res.sendStatus(401);
        }

        const ip = getIp(req);

        const { jwtToken, jwtRefreshToken } = await createSession({
          prisma,
          userId: user.id,
          ip,
          jwtInfo,
          userAgent: req.headers["user-agent"] || "",
          authProviderType: "email",
        });

        return res.json({
          accessToken: jwtToken,
          refreshToken: jwtRefreshToken,
        });
      } catch (error) {
        return next(error);
      }
    },
  );

  const logoutSchema = {
    body: {
      refreshToken: Joi.string().required(),
    },
  };

  router.post(
    "/logout",
    validation(logoutSchema),
    async (req: TypedRequest<typeof logoutSchema>, res, next) => {
      try {
        const { refreshToken } = req.body;

        const decoded = jwt.decode(refreshToken) as {
          sub: string;
          jti: string;
        };

        const session = await prisma.session.findFirst({
          select: {
            id: true,
            refreshTokenSecretKey: true,
            revokedAt: true,
          },
          where: {
            id: decoded.jti,
            userId: decoded.sub,
          },
        });

        if (!session) {
          return res.sendStatus(401);
        }

        await prisma.session.update({
          data: {
            revokedAt: dayjs().toDate(),
          },
          where: {
            id: session.id,
            userId: decoded.sub,
          },
        });

        return res.sendStatus(204);
      } catch (error) {
        return next(error);
      }
    },
  );

  const registerSchema = {
    body: {
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    },
  };

  router.post(
    "/register",
    validation(registerSchema),
    async (req: TypedRequest<typeof registerSchema>, res, next) => {
      try {
        const { email, password } = req.body;

        const possibleUser = await prisma.user.findFirst({
          select: {
            id: true,
          },
          where: {
            email,
          },
        });

        if (possibleUser) {
          return res.sendStatus(409);
        }

        const salt = crypto.randomBytes(16).toString("hex");
        const iterations = 600000;
        const hashedPassword = pbkdf2Sync(
          password,
          salt,
          iterations,
          64,
          "sha512",
        ).toString("hex");

        const user = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            salt,
            iterations,
            displayName: email.split("@")[0],
            role: "user",
            registerIp: getIp(req),
            authProviderType: "email",
          },
        });

        const emailVerification = await prisma.emailVerification.create({
          data: {
            userId: user.id,
            code: crypto.randomBytes(32).toString("hex"),
            email,
          },
        });

        emailService.sendEmail({
          to: email,
          subject: "Verify your email",
          html: emailTemplatesService.getVerifyEmailTemplate({
            code: emailVerification.code,
            username: user.displayName,
            userId: user.id,
          }),
        });

        return res.sendStatus(201);
      } catch (error) {
        return next(error);
      }
    },
  );

  const verifyEmailSchema = {
    body: {
      userId: Joi.string().required(),
      code: Joi.string().required(),
    },
  };

  router.post(
    "/verify",
    validation(verifyEmailSchema),
    async (req: TypedRequest<typeof verifyEmailSchema>, res, next) => {
      try {
        const { code, userId } = req.body;

        const verificationCode = await prisma.emailVerification.findFirst({
          select: {
            id: true,
            userId: true,
          },
          where: {
            code,
            userId,
          },
        });

        if (!verificationCode) {
          return res.sendStatus(404);
        }

        await prisma.user.update({
          data: {
            verifiedAt: dayjs().toDate(),
          },
          where: {
            id: verificationCode.userId,
          },
        });

        return res.sendStatus(200);
      } catch (error) {
        return next(error);
      }
    },
  );

  const resendVerification = {
    body: {
      email: Joi.string().email().required(),
    },
  };

  router.post(
    "/resend-verify",
    validation(resendVerification),
    async (req: TypedRequest<typeof resendVerification>, res, next) => {
      try {
        const { email } = req.body;

        const user = await prisma.user.findFirst({
          select: {
            id: true,
            displayName: true,
          },
          where: {
            email,
            verifiedAt: null,
          },
        });

        if (!user) {
          return res.sendStatus(400);
        }

        const emailVerification = await prisma.emailVerification.create({
          data: {
            userId: user.id,
            code: crypto.randomBytes(32).toString("hex"),
            email,
          },
        });

        emailService.sendEmail({
          to: email,
          subject: "Verify your email",
          html: emailTemplatesService.getVerifyEmailTemplate({
            code: emailVerification.code,
            username: user.displayName,
            userId: user.id,
          }),
        });

        return res.sendStatus(200);
      } catch (error) {
        return next(error);
      }
    },
  );

  return router;
}
