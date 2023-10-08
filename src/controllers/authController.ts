import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import Joi from "joi";
import crypto, { pbkdf2Sync } from "crypto";
import totp from "totp-generator";
import jwt from "jsonwebtoken";
import dayjs from "dayjs";
import ms from "ms";
import url from "url";
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

function getHashedPassword({
  password,
  salt,
  iterations,
}: {
  password: string;
  salt: string;
  iterations: number;
}) {
  return pbkdf2Sync(
    password,
    salt,
    iterations,
    64,
    "sha512",
  ).toString("hex");
}

export default function getAuthController({
  jwtInfo,
  prisma,
  emailService,
  emailTemplatesService,
  socialAuthProviders,
  baseUrl,
  callbackUrl,
}: {
  jwtInfo: JwtInfo;
  prisma: PrismaClient;
  emailService: EmailService;
  emailTemplatesService: EmailTemplates;
  socialAuthProviders: {
    google: {
      clientId: string;
      clientSecret: string;
    }
  };
  baseUrl: string;
  callbackUrl: string;
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
            authProviderType: true,
          },
          where: {
            email,
          },
        });

        if (!user) {
          return res.sendStatus(404);
        }

        if (user.authProviderType !== "email") {
          return res.sendStatus(401);
        }

        const hashedPassword = getHashedPassword({
          password,
          salt: user.salt,
          iterations: user.iterations,
        });

        if (hashedPassword !== user.password) {
          return res.sendStatus(401);
        }

        if (user.totpAddedAt !== null && user.totpToken) {
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
        const hashedPassword = getHashedPassword({
          password,
          salt,
          iterations,
        });

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

        await prisma.emailVerification.delete({
          where: {
            id: verificationCode.id,
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

        await prisma.emailVerification.deleteMany({
          where: {
            userId: user.id,
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

        return res.sendStatus(200);
      } catch (error) {
        return next(error);
      }
    },
  );

  const forgotPasswordSchema = {
    body: {
      email: Joi.string().email().required(),
    },
  };

  router.post(
    "/forgot-password",
    validation(forgotPasswordSchema),
    async (req: TypedRequest<typeof forgotPasswordSchema>, res, next) => {
      try {
        const { email } = req.body;

        const user = await prisma.user.findFirst({
          select: {
            id: true,
            displayName: true,
          },
          where: {
            email,
          },
        });

        if (!user) {
          return res.sendStatus(400);
        }

        await prisma.passwordRecovery.deleteMany({
          where: {
            userId: user.id,
          },
        });

        const passwordReset = await prisma.passwordRecovery.create({
          data: {
            userId: user.id,
            code: crypto.randomBytes(32).toString("hex"),
            expiresAt: dayjs().add(1, "hour").toDate(),
          },
        });

        emailService.sendEmail({
          to: email,
          subject: "Reset your password",
          html: emailTemplatesService.getPasswordResetTemplate({
            code: passwordReset.code,
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

  const passwordResetSchema = {
    body: {
      userId: Joi.string().required(),
      code: Joi.string().required(),
      password: Joi.string().required(),
    },
  };

  router.post(
    "/reset-password",
    validation(passwordResetSchema),
    async (req: TypedRequest<typeof passwordResetSchema>, res, next) => {
      try {
        const { code, userId, password } = req.body;

        const passwordReset = await prisma.passwordRecovery.findFirst({
          select: {
            id: true,
            userId: true,
            expiresAt: true,
          },
          where: {
            code,
            userId,
          },
        });

        if (!passwordReset) {
          return res.sendStatus(404);
        }

        if (dayjs(passwordReset.expiresAt).isBefore(dayjs())) {
          return res.sendStatus(400);
        }

        const salt = crypto.randomBytes(16).toString("hex");
        const iterations = 600000;
        const hashedPassword = getHashedPassword({
          password,
          salt,
          iterations,
        });

        await prisma.user.update({
          data: {
            password: hashedPassword,
            salt,
            iterations,
          },
          where: {
            id: passwordReset.userId,
          },
        });

        await prisma.passwordRecovery.delete({
          where: {
            id: passwordReset.id,
          },
        });

        return res.sendStatus(200);
      } catch (error) {
        return next(error);
      }
    },
  );

  router.get(
    "/login-with-google",
    async (req, res, next) => {
      try {
        const urlToRedirect = url.format({
          protocol: "https",
          host: "accounts.google.com",
          pathname: "/o/oauth2/v2/auth",
          query: {
            client_id: socialAuthProviders.google.clientId,
            redirect_uri: `${baseUrl}/api/auth/google/callback`,
            response_type: "code",
            scope: "email",
            access_type: "offline",
            prompt: "consent",
            include_granted_scopes: "true",
          },
        });

        return res.redirect(urlToRedirect);
      } catch (error) {
        return next(error);
      }
    },
  );

  const googleCallbackSchema = {
    query: {
      code: Joi.string().required(),
      scope: Joi.string().required(),
      authuser: Joi.string().required(),
      prompt: Joi.string().required(),
    },
  };

  router.get(
    "/google/callback",
    validation(googleCallbackSchema, "/login"),
    async (req: TypedRequest<typeof googleCallbackSchema>, res, next) => {
      try {
        const { code } = req.query;

        const authorizationToken = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            code,
            client_id: socialAuthProviders.google.clientId,
            client_secret: socialAuthProviders.google.clientSecret,
            redirect_uri: `${baseUrl}/api/auth/google/callback`,
            grant_type: "authorization_code",
          }),
        });

        const data = await authorizationToken.json() as {
          access_token: string;
          expires_in: number;
          refresh_token: string;
          scope: string;
          token_type: string;
          id_token: string;
        };

        const userInfo = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: {
            Authorization: `Bearer ${data.access_token}`,
          },
        });

        const userData = await userInfo.json() as {
          sub: string;
          picture: string;
          email: string;
          email_verified: boolean;
        };

        const searchForUser = await prisma.user.findFirst({
          select: {
            id: true,
          },
          where: {
            email: userData.email,
          },
        });

        if (!searchForUser) {
          await prisma.user.create({
            data: {
              email: userData.email,
              displayName: userData.email.split("@")[0],
              role: "user",
              authProviderType: "google",
              authProviderExternalId: userData.sub,
              password: crypto.randomBytes(32).toString("hex"),
              iterations: 600000,
              salt: crypto.randomBytes(16).toString("hex"),
              registerIp: getIp(req),
              avatarUrl: userData.picture,
            },
          });
        }

        const user = await prisma.user.findFirst({
          select: {
            id: true,
            authProviderType: true,
          },
          where: {
            email: userData.email,
          },
        });

        if (!user) {
          return res.sendStatus(404);
        }

        if (user.authProviderType !== "google") {
          return res.sendStatus(401);
        }

        const authorizationCode = await prisma.authorizationCode.create({
          data: {
            userId: user.id,
            authProviderType: "google",
            expiresAt: dayjs().add(5, "minutes").toDate(),
          },
        });

        const urlToRedirect = new URL(callbackUrl);
        urlToRedirect.searchParams.append("code", authorizationCode.id);

        return res.redirect(urlToRedirect.toString());
      } catch (error) {
        return next(error);
      }
    },
  );

  router.get(
    "/login-with-github",
    async (req, res, next) => {
      try {
        const urlToRedirect = url.format({
          protocol: "https",
          host: "accounts.google.com",
          pathname: "/o/oauth2/v2/auth",
          query: {
            client_id: socialAuthProviders.google.clientId,
            redirect_uri: `${baseUrl}/api/auth/google/callback`,
            response_type: "code",
            scope: "email",
            access_type: "offline",
            prompt: "consent",
            include_granted_scopes: "true",
          },
        });

        return res.redirect(urlToRedirect);
      } catch (error) {
        return next(error);
      }
    },
  );

  const exchangeCodeSchema = {
    body: {
      code: Joi.string().required(),
    },
  };

  router.post(
    "/exchange-code",
    validation(exchangeCodeSchema),
    async (req: TypedRequest<typeof exchangeCodeSchema>, res, next) => {
      try {
        const { code } = req.body;

        const authorizationCode = await prisma.authorizationCode.findFirst({
          select: {
            id: true,
            userId: true,
            authProviderType: true,
            expiresAt: true,
          },
          where: {
            id: code,
          },
        });

        if (!authorizationCode) {
          return res.sendStatus(404);
        }

        if (dayjs(authorizationCode.expiresAt).isBefore(dayjs())) {
          return res.sendStatus(400);
        }

        const user = await prisma.user.findFirst({
          select: {
            id: true,
            authProviderType: true,
          },
          where: {
            id: authorizationCode.userId,
          },
        });

        if (!user) {
          return res.sendStatus(404);
        }

        if (user.authProviderType !== authorizationCode.authProviderType) {
          return res.sendStatus(401);
        }

        const ip = getIp(req);

        await prisma.authorizationCode.delete({
          where: {
            id: authorizationCode.id,
          },
        });

        const { jwtToken, jwtRefreshToken } = await createSession({
          prisma,
          userId: user.id,
          ip,
          jwtInfo,
          userAgent: req.headers["user-agent"] || "",
          authProviderType: user.authProviderType,
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

  return router;
}
