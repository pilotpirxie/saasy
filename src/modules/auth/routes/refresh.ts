import Joi from "joi";
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import validation from "../../shared/middlewares/validation";
import { TypedRequest } from "../../../types/express";
import { getIp } from "../../shared/utils/getIp";
import { createSession } from "../services/createSession";
import { JwtInfo } from "../model/jwtInfo";

const validationSchema = {
  body: {
    refresh_token: Joi.string().required(),
  },
};

export function refresh({
  prisma,
  config,
}: {
  prisma: PrismaClient;
  config: {
    jwtInfo: JwtInfo;
  }
}): Router {
  const router = Router();

  router.post(
    "/refresh",
    validation(validationSchema),
    async (req: TypedRequest<typeof validationSchema>, res, next) => {
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
          jwtInfo: config.jwtInfo,
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

  return router;
}
