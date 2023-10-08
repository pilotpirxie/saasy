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
    refresh_token: string;
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
    session.refresh_token,
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
  const session = await prisma.sessions.create({
    data: {
      user_id: userId,
      ip_address: ip,
      refresh_token: crypto.randomBytes(32).toString("hex"),
      user_agent: userAgent,
      expires_at: dayjs().add(ms(jwtInfo.timeout), "millisecond").toDate(),
      auth_provider_type: authProviderType,
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

  router.get(
    "/login",
    validation(loginSchema),
    async (req: TypedRequest<typeof loginSchema>, res, next) => {
      try {
        const { email, password, totpCode } = req.body;

        const user = await prisma.users.findFirst({
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

        if (user.totp_added_at && user.totp_token) {
          if (!totpCode) {
            return res.sendStatus(401);
          }

          const expectedTotpCode = totp(user.totp_token);

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
          access_token: jwtToken,
          refresh_token: jwtRefreshToken,
        });
      } catch (error) {
        return next(error);
      }
    },
  );

  const refreshSchema = {
    body: {
      refresh_token: Joi.string().required(),
    },
  };

  router.post(
    "/refresh",
    validation(refreshSchema),
    async (req: TypedRequest<typeof refreshSchema>, res, next) => {
      try {
        const { refresh_token } = req.body;

        const decoded = jwt.decode(refresh_token) as {
          sub: string;
          jti: string;
        };

        const session = await prisma.sessions.findFirst({
          where: {
            id: decoded.jti,
            user_id: decoded.sub,
          },
        });

        if (!session) {
          return res.sendStatus(401);
        }

        if (session.revoked_at) {
          return res.sendStatus(401);
        }

        try {
          jwt.verify(refresh_token, session.refresh_token);
        } catch (error) {
          return res.sendStatus(401);
        }

        const user = await prisma.users.findFirst({
          where: {
            id: session.user_id,
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
          access_token: jwtToken,
          refresh_token: jwtRefreshToken,
        });
      } catch (error) {
        return next(error);
      }
    },
  );

  const logoutSchema = {
    body: {
      refresh_token: Joi.string().required(),
    },
  };

  router.post(
    "/logout",
    validation(logoutSchema),
    async (req: TypedRequest<typeof logoutSchema>, res, next) => {
      try {
        const { refresh_token } = req.body;

        const decoded = jwt.decode(refresh_token) as {
          sub: string;
          jti: string;
        };

        const session = await prisma.sessions.findFirst({
          where: {
            id: decoded.jti,
            user_id: decoded.sub,
          },
        });

        if (!session) {
          return res.sendStatus(401);
        }

        await prisma.sessions.update({
          data: {
            revoked_at: dayjs().toDate(),
          },
          where: {
            id: session.id,
            user_id: session.user_id,
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

        const possibleUser = await prisma.users.findFirst({
          where: {
            email,
          },
        });

        if (possibleUser) {
          return res.sendStatus(409);
        }

        const salt = crypto.randomBytes(16).toString("hex");
        const iterations = 600_000;
        const hashedPassword = pbkdf2Sync(
          password,
          salt,
          iterations,
          64,
          "sha512",
        ).toString("hex");

        const user = await prisma.users.create({
          data: {
            email,
            password: hashedPassword,
            salt,
            iterations,
            display_name: email.split("@")[0],
            role: "user",
            register_ip: getIp(req),
            auth_provider_type: "email",
          },
        });

        const emailVerification = await prisma.email_verification.create({
          data: {
            user_id: user.id,
            code: crypto.randomBytes(32).toString("hex"),
          },
        });

        emailService.sendEmail({
          to: email,
          subject: "Verify your email",
          html: emailTemplatesService.getVerifyEmailTemplate({
            code: emailVerification.code,
            username: user.display_name,
            userId: user.id,
          }),
        });

        return res.sendStatus(201);
      } catch (error) {
        return next(error);
      }
    },
  );

  return router;
}
