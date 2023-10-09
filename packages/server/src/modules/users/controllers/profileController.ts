import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import Joi from "joi";
import jwtVerify from "../../shared/middlewares/jwt";
import validation from "../../shared/middlewares/validation";
import { TypedRequest } from "../../shared/types/express";

export default function getProfileController({
  prisma,
  jwtSecret,
}: {
  prisma: PrismaClient,
  jwtSecret: string
}): Router {
  const router = Router();

  router.get(
    "/profile",
    jwtVerify(jwtSecret),
    async (req, res, next) => {
      try {
        const user = await prisma.user.findFirst({
          select: {
            displayName: true,
            avatarUrl: true,
            country: true,
            address: true,
            phone: true,
            fullName: true,
          },
          where: {
            id: req.userId,
          },
        });

        return res.json(user);
      } catch (error) {
        return next(error);
      }
    },
  );

  const updateProfileSchema = {
    body: {
      displayName: Joi.string().min(1).max(32).required(),
      avatarUrl: Joi.string().optional(),
      country: Joi.string().optional(),
      address: Joi.string().optional(),
      phone: Joi.string().optional(),
      fullName: Joi.string().optional(),
    },
  };

  router.put(
    "/profile",
    jwtVerify(jwtSecret),
    validation(updateProfileSchema),
    async (req: TypedRequest<typeof updateProfileSchema>, res, next) => {
      try {
        const {
          displayName, avatarUrl, country, address, phone, fullName,
        } = req.body;

        await prisma.user.update({
          where: {
            id: req.userId,
          },
          data: {
            displayName,
            avatarUrl,
            country,
            address,
            phone,
            fullName,
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