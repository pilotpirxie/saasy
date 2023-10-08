import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import Joi from "joi";
import dayjs from "dayjs";
import url from "url";
import validation from "../../shared/middlewares/validation";
import { TypedRequest } from "../../shared/types/express";
import { getIp } from "../../shared/utils/getIp";
import { JwtInfo } from "../utils/jwtInfo";
import { createSession } from "../utils/sessionManager";
import { redirectWithCode, redirectWithError } from "../utils/redirectManager";

export default function getSocialController({
  jwtInfo,
  prisma,
  socialAuthProviders,
  baseUrl,
  callbackUrl,
}: {
  jwtInfo: JwtInfo;
  prisma: PrismaClient;
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
}): Router {
  const router = Router();

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

        const searchForUser = await prisma.user.findFirst({
          select: {
            id: true,
            authProviderType: true,
          },
          where: {
            email: userData.email,
          },
        });

        if (searchForUser && searchForUser.authProviderType !== "google") {
          return res.redirect(redirectWithError({
            callbackUrl,
            error: "user_already_exists",
          }));
        }

        if (!searchForUser) {
          await prisma.user.create({
            data: {
              email: userData.email || null,
              verifiedAt: userData.email_verified ? dayjs().toDate() : null,
              displayName: userData.email.split("@")[0],
              role: "user",
              authProviderType: "google",
              authProviderExternalId: userData.sub,
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
            authProviderType: "google",
            authProviderExternalId: userData.sub,
          },
        });

        if (!user) {
          return res.redirect(redirectWithError({
            callbackUrl,
            error: "user_not_found",
          }));
        }

        if (user.authProviderType !== "google") {
          return res.redirect(redirectWithError({
            callbackUrl,
            error: "invalid_provider",
          }));
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

        return res.redirect(redirectWithCode({
          callbackUrl,
          code: authorizationCode.id,
        }));
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

        const searchForUser = await prisma.user.findFirst({
          select: {
            id: true,
            authProviderType: true,
          },
          where: {
            email: userData.email || "",
          },
        });

        if (searchForUser && searchForUser.authProviderType !== "github") {
          return res.redirect(redirectWithError({
            callbackUrl,
            error: "user_already_exists",
          }));
        }

        if (!searchForUser) {
          await prisma.user.create({
            data: {
              email: userData.email || null,
              verifiedAt: userData.email ? dayjs().toDate() : null,
              displayName: userData.login,
              role: "user",
              authProviderType: "github",
              authProviderExternalId: userData.id.toString(),
              registerIp: getIp(req),
              avatarUrl: userData.avatar_url,
            },
          });
        }

        const user = await prisma.user.findFirst({
          select: {
            id: true,
            authProviderType: true,
          },
          where: {
            authProviderType: "github",
            authProviderExternalId: userData.id.toString(),
          },
        });

        if (!user) {
          return res.redirect(redirectWithError({
            callbackUrl,
            error: "user_not_found",
          }));
        }

        if (user.authProviderType !== "github") {
          return res.redirect(redirectWithError({
            callbackUrl,
            error: "invalid_provider",
          }));
        }

        const authorizationCode = await prisma.authorizationCode.create({
          data: {
            userId: user.id,
            authProviderType: "github",
            expiresAt: dayjs().add(5, "minutes").toDate(),
          },
        });

        return res.redirect(redirectWithCode({
          callbackUrl,
          code: authorizationCode.id,
        }));
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
