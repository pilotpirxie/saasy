import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import Joi from "joi";
import jwt from "jsonwebtoken";
import dayjs from "dayjs";
import errorResponse from "../../shared/utils/errorResponse";
import validation from "../../shared/middlewares/validation";
import { TypedRequest } from "../../shared/types/express";
import { getIp } from "../../shared/utils/getIp";
import { JwtInfo } from "../utils/jwtInfo";
import { createSession } from "../utils/sessionManager";

export default function getSessionController({
  jwtInfo,
  prisma,
}: {
  jwtInfo: JwtInfo;
  prisma: PrismaClient;
}): Router {
  const router = Router();

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

  return router;
}