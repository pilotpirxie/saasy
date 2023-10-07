import Joi from "joi";
import { pbkdf2Sync } from "crypto";
import totp from "totp-generator";
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import validation from "../../shared/middlewares/validation";
import { TypedRequest } from "../../../types/express";
import { getIp } from "../../shared/utils/getIp";
import { createSession } from "../services/createSession";
import { JwtInfo } from "../model/jwtInfo";

const validationSchema = {
  body: {
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    totpCode: Joi.string().optional(),
  },
};

export function login({
  prisma,
  config,
}: {
  prisma: PrismaClient;
  config: {
    jwtInfo: JwtInfo;
  }
}): Router {
  const router = Router();

  router.get(
    "/login",
    validation(validationSchema),
    async (req: TypedRequest<typeof validationSchema>, res, next) => {
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
