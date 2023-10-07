import Joi from "joi";
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import dayjs from "dayjs";
import validation from "../../shared/middlewares/validation";
import { TypedRequest } from "../../../types/express";

const validationSchema = {
  body: {
    refresh_token: Joi.string().required(),
  },
};

export function logout({
  prisma,
}: {
  prisma: PrismaClient;
}): Router {
  const router = Router();

  router.post(
    "/logout",
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

  return router;
}
