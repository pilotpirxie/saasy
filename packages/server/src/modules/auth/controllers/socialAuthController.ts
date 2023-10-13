import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import Joi from "joi";
import dayjs from "dayjs";
import url from "url";
import validation from "../../shared/middlewares/validation";
import { TypedRequest } from "../../shared/types/express";
import { getIp } from "../../shared/utils/getIp";
import { JwtInfo } from "../utils/jwtInfo";
import { redirectWithCode, redirectWithError } from "../../shared/utils/redirectManager";

async function authenticate({
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

export default function initializeSocialAuthController({
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
