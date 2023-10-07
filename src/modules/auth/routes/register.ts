import Joi from "joi";
import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import crypto, { pbkdf2Sync } from "crypto";
import validation from "../../shared/middlewares/validation";
import { TypedRequest } from "../../../types/express";
import { getIp } from "../../shared/utils/getIp";
import { JwtInfo } from "../model/jwtInfo";

const validationSchema = {
  body: {
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  },
};

export function register({
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
    "/register",
    validation(validationSchema),
    async (req: TypedRequest<typeof validationSchema>, res, next) => {
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

        await prisma.email_verification.create({
          data: {
            user_id: user.id,
            code: crypto.randomBytes(32).toString("hex"),
          },
        });

        return res.sendStatus(201);
      } catch (error) {
        return next(error);
      }
    },
  );

  return router;
}
