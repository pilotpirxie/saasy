import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import Joi from "joi";
import totp from "totp-generator";
import dayjs from "dayjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import url from "url";
import { EmailService } from "../services/emailService";
import { EmailTemplates } from "../services/emailTemplates";
import { JwtInfo } from "../utils/jwtInfo";
import validation from "../middlewares/validation";
import { TypedRequest } from "../express";
import errorResponse from "../utils/errorResponse";
import { getHashedPassword } from "../utils/passwordManager";
import { redirectWithCode, redirectWithError } from "../utils/redirectManager";
import { getIp } from "../utils/getIp";
import { createSession } from "../utils/sessionManager";
import { generateCode } from "../utils/generateCode";

export async function authenticate({
  prisma,
  email,
  authProviderType,
  authProviderExternalId,
  displayName,
  registerIp,
  avatarUrl,
}: {
  prisma: PrismaClient;
  authProviderExternalId: string,
  authProviderType: "google" | "github",
  registerIp: string,
  displayName: string,
  email?: string,
  avatarUrl?: string,
}): Promise<string> {
  let user = await prisma.user.findFirst({
    select: {
      id: true,
      authProviderType: true,
    },
    where: {
      authProviderType,
      authProviderExternalId,
    },
  });

  if (!user) {
    let useEmail = false;

    const emailAlreadyExists = await prisma.user.findFirst({
      select: {
        id: true,
      },
      where: {
        email,
      },
    });

    if (!emailAlreadyExists) {
      useEmail = true;
    }

    user = await prisma.user.create({
      data: {
        email: useEmail ? email : null,
        emailVerifiedAt: useEmail ? dayjs().toDate() : null,
        displayName,
        role: "user",
        authProviderType,
        authProviderExternalId,
        registerIp,
        avatarUrl,
      },
      select: {
        id: true,
        authProviderType: true,
      },
    });
  }

  const authorizationCode = await prisma.authorizationCode.create({
    data: {
      userId: user.id,
      authProviderType,
      expiresAt: dayjs().add(5, "minutes").toDate(),
    },
  });

  return authorizationCode.id;
}

type AuthControllersConfig = {
  jwtInfo: JwtInfo;
  prisma: PrismaClient;
  emailService: EmailService;
  emailTemplatesService: EmailTemplates;
  socialAuthProviders: {
    google: {
      clientId: string;
      clientSecret: string;
    },
    github: {
      clientId: string;
      clientSecret: string;
    }
  };
  baseUrl: string;
  callbackUrl: string;
}

export default function initializeAuthController({
  jwtInfo,
  prisma,
  emailService,
  emailTemplatesService,
  socialAuthProviders,
  baseUrl,
  callbackUrl,
}: AuthControllersConfig): Router {
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
            emailVerifiedAt: true,
          },
          where: {
            email,
            authProviderType: "email",
          },
        });

        if (!user || !user.password || !user.salt || !user.iterations) {
          return errorResponse({
            response: res,
            message: "User not found",
            status: 404,
            error: "UserNotFound",
          });
        }

        if (user.authProviderType !== "email") {
          return errorResponse({
            response: res,
            message: "Invalid auth provider",
            status: 400,
            error: "InvalidAuthProvider",
          });
        }

        if (!user.emailVerifiedAt) {
          return errorResponse({
            response: res,
            message: "Email not verified",
            status: 400,
            error: "EmailNotVerified",
          });
        }

        const hashedPassword = getHashedPassword({
          password,
          salt: user.salt,
          iterations: user.iterations,
        });

        if (hashedPassword !== user.password) {
          return errorResponse({
            response: res,
            message: "Invalid credentials",
            status: 401,
            error: "InvalidCredentials",
          });
        }

        if (user.totpAddedAt !== null && user.totpToken) {
          if (!totpCode) {
            return errorResponse({
              response: res,
              message: "TOTP code is required",
              status: 400,
              error: "TotpCodeRequired",
            });
          }

          const expectedTotpCode = totp(user.totpToken);

          if (expectedTotpCode !== totpCode) {
            return errorResponse({
              response: res,
              message: "Invalid TOTP code",
              status: 401,
              error: "InvalidTotpCode",
            });
          }
        }

        const authorizationCode = await prisma.authorizationCode.create({
          data: {
            userId: user.id,
            authProviderType: "email",
            expiresAt: dayjs().add(5, "minutes").toDate(),
          },
        });

        return res.json({
          redirectUrl: redirectWithCode({
            callbackUrl,
            code: authorizationCode.id,
          }),
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
            authProviderType: "email",
          },
        });

        if (!user) {
          return errorResponse({
            response: res,
            message: "User not found",
            status: 404,
            error: "UserNotFound",
          });
        }

        return res.json({
          enabled: !!user.totpAddedAt,
        });
      } catch (error) {
        return next(error);
      }
    },
  );

  const emailStatusSchema = {
    body: {
      email: Joi.string().email().required(),
    },
  };

  // 404 - not exist at all so show register form
  // 406 - exist but not as email so cannot login
  // 202 - exist as email but not verified so first must verify
  // 200 - exist as email and verified so can login
  router.post(
    "/email-status",
    validation(emailStatusSchema),
    async (req: TypedRequest<typeof emailStatusSchema>, res, next) => {
      try {
        const { email } = req.body;

        const user = await prisma.user.findFirst({
          select: {
            id: true,
            emailVerifiedAt: true,
            authProviderType: true,
            displayName: true,
          },
          where: {
            email,
          },
        });

        if (!user) {
          return errorResponse({
            response: res,
            message: "User not found",
            status: 404,
            error: "UserNotFound",
          });
        }

        if (user.authProviderType !== "email") {
          return res.sendStatus(406);
        }

        if (!user.emailVerifiedAt) {
          const code = generateCode();

          await prisma.emailVerification.deleteMany({
            where: {
              userId: user.id,
            },
          });

          await prisma.emailVerification.create({
            data: {
              userId: user.id,
              email,
              code,
              expiresAt: dayjs().add(15, "minutes").toDate(),
            },
          });

          emailService.sendEmail({
            to: email,
            subject: `${code} is your verification code`,
            html: emailTemplatesService.getVerifyEmailTemplate({
              code,
              username: user.displayName,
            }),
          });

          return res.sendStatus(202);
        }

        return res.sendStatus(200);
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
          return errorResponse({
            response: res,
            message: "User already exists",
            status: 409,
            error: "UserAlreadyExists",
          });
        }

        const salt = crypto.randomBytes(16).toString("hex");
        const iterations = 600000;
        const hashedPassword = getHashedPassword({
          password,
          salt,
          iterations,
        });

        await prisma.user.create({
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

        return res.sendStatus(201);
      } catch (error) {
        return next(error);
      }
    },
  );

  const verifyEmailSchema = {
    body: {
      email: Joi.string().required(),
      code: Joi.number().required(),
    },
  };

  router.post(
    "/verify-email",
    validation(verifyEmailSchema),
    async (req: TypedRequest<typeof verifyEmailSchema>, res, next) => {
      try {
        const { code, email } = req.body;

        const verificationCode = await prisma.emailVerification.findFirst({
          select: {
            id: true,
            userId: true,
            email: true,
            expiresAt: true,
          },
          where: {
            email,
            code: code.toString(),
          },
        });

        if (!verificationCode) {
          return errorResponse({
            response: res,
            message: "Verification code not found",
            status: 404,
            error: "VerificationCodeNotFound",
          });
        }

        if (dayjs(verificationCode.expiresAt).isBefore(dayjs())) {
          return errorResponse({
            response: res,
            message: "Verification code expired",
            status: 400,
            error: "VerificationCodeExpired",
          });
        }

        const possibleUser = await prisma.user.findFirst({
          select: {
            id: true,
          },
          where: {
            email: verificationCode.email,
          },
        });

        if (possibleUser && possibleUser.id !== verificationCode.userId) {
          return errorResponse({
            response: res,
            message: "Email already in use",
            status: 409,
            error: "EmailAlreadyInUse",
          });
        }

        await prisma.user.update({
          data: {
            emailVerifiedAt: dayjs().toDate(),
            email: verificationCode.email,
          },
          where: {
            id: verificationCode.userId,
          },
        });

        await prisma.emailVerification.deleteMany({
          where: {
            userId: verificationCode.userId,
          },
        });

        return res.sendStatus(200);
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

        if (!decoded || !decoded.sub || !decoded.jti) {
          return errorResponse({
            response: res,
            message: "Refresh token is invalid",
            status: 401,
            error: "InvalidRefreshToken",
          });
        }

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
          return errorResponse({
            response: res,
            message: "Session to refresh not found",
            status: 404,
            error: "SessionNotFound",
          });
        }

        if (session.revokedAt) {
          return errorResponse({
            response: res,
            message: "Session to refresh is revoked",
            status: 401,
            error: "SessionRevoked",
          });
        }

        try {
          jwt.verify(refreshToken, session.refreshTokenSecretKey);
        } catch (error) {
          return errorResponse({
            response: res,
            message: "Refresh token is invalid",
            status: 401,
            error: "InvalidRefreshToken",
          });
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
          return errorResponse({
            response: res,
            message: "User not found",
            status: 404,
            error: "UserNotFound",
          });
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

        if (!decoded || !decoded.sub || !decoded.jti) {
          return errorResponse({
            response: res,
            message: "Refresh token is invalid",
            status: 401,
            error: "InvalidRefreshToken",
          });
        }

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
          return errorResponse({
            response: res,
            message: "Session to revoke not found",
            status: 404,
            error: "SessionNotFound",
          });
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

  const exchangeCodeSchema = {
    body: {
      code: Joi.string().required(),
    },
  };

  router.post(
    "/exchange",
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
          return errorResponse({
            response: res,
            message: "Authorization code not found",
            status: 404,
            error: "AuthorizationCodeNotFound",
          });
        }

        if (dayjs(authorizationCode.expiresAt).isBefore(dayjs())) {
          return errorResponse({
            response: res,
            message: "Authorization code expired",
            status: 400,
            error: "AuthorizationCodeExpired",
          });
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
          return errorResponse({
            response: res,
            message: "User not found",
            status: 404,
            error: "UserNotFound",
          });
        }

        if (user.authProviderType !== authorizationCode.authProviderType) {
          return errorResponse({
            response: res,
            message: "Invalid auth provider",
            status: 400,
            error: "InvalidAuthProvider",
          });
        }

        const ip = getIp(req);

        await prisma.authorizationCode.deleteMany({
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
            authProviderType: "email",
          },
        });

        if (!user) {
          return errorResponse({
            response: res,
            message: "User not found",
            status: 404,
            error: "UserNotFound",
          });
        }

        await prisma.passwordRecovery.deleteMany({
          where: {
            userId: user.id,
          },
        });

        const passwordReset = await prisma.passwordRecovery.create({
          data: {
            userId: user.id,
            expiresAt: dayjs().add(1, "hour").toDate(),
          },
        });

        emailService.sendEmail({
          to: email,
          subject: "Reset your password",
          html: emailTemplatesService.getPasswordResetTemplate({
            code: passwordReset.id,
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
            id: code,
            userId,
          },
        });

        if (!passwordReset) {
          return errorResponse({
            response: res,
            message: "Password reset not found",
            status: 404,
            error: "PasswordResetNotFound",
          });
        }

        if (dayjs(passwordReset.expiresAt).isBefore(dayjs())) {
          return errorResponse({
            response: res,
            message: "Password reset has expired",
            status: 400,
            error: "PasswordResetExpired",
          });
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
    "/google",
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

        const userDataRequest = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: {
            Authorization: `Bearer ${data.access_token}`,
          },
        });

        const userData = await userDataRequest.json() as {
          sub: string;
          picture: string;
          email: string;
          email_verified: boolean;
        };

        const authorizationCode = await authenticate({
          authProviderExternalId: userData.sub,
          authProviderType: "google",
          email: userData.email,
          displayName: userData.email && userData.email_verified ? userData.email.split("@")[0] : "Unknown",
          registerIp: getIp(req),
          avatarUrl: userData.picture,
          prisma,
        });

        return res.redirect(redirectWithCode({
          callbackUrl,
          code: authorizationCode,
        }));
      } catch (error) {
        return next(error);
      }
    },
  );

  router.get(
    "/github",
    async (req, res, next) => {
      try {
        const urlToRedirect = url.format({
          protocol: "https",
          host: "github.com",
          pathname: "/login/oauth/authorize",
          query: {
            client_id: socialAuthProviders.github.clientId,
            redirect_uri: `${baseUrl}/api/auth/github/callback`,
            scope: "user:email",
          },
        });

        return res.redirect(urlToRedirect);
      } catch (error) {
        return next(error);
      }
    },
  );

  const githubCallbackSchema = {
    query: {
      code: Joi.string().optional(),
      error: Joi.string().optional(),
    },
  };

  router.get(
    "/github/callback",
    validation(githubCallbackSchema, "/login"),
    async (req: TypedRequest<typeof githubCallbackSchema>, res, next) => {
      try {
        const { code, error } = req.query;

        if (error) {
          return res.redirect(redirectWithError({
            callbackUrl,
            error,
          }));
        }

        const authorizationToken = await fetch(`https://github.com/login/oauth/access_token?client_id=${socialAuthProviders.github.clientId}&client_secret=${socialAuthProviders.github.clientSecret}&code=${code}`, {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
        });

        const data = await authorizationToken.json();

        const userDataRequest = await fetch("https://api.github.com/user", {
          headers: {
            Authorization: `token ${data.access_token}`,
          },
        });

        const userData = await userDataRequest.json() as {
          login: string;
          id: number;
          node_id?: string;
          avatar_url?: string;
          gravatar_id?: "",
          url?: string,
          name?: string,
          email?: string
        };

        const authorizationCode = await authenticate({
          authProviderExternalId: userData.id.toString(),
          authProviderType: "github",
          email: userData.email,
          displayName: userData.name || userData.login,
          registerIp: getIp(req),
          avatarUrl: userData.avatar_url,
          prisma,
        });

        return res.redirect(redirectWithCode({
          callbackUrl,
          code: authorizationCode,
        }));
      } catch (error) {
        return next(error);
      }
    },
  );

  return router;
}
