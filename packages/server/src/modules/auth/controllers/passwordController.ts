import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import Joi from "joi";
import crypto from "crypto";
import dayjs from "dayjs";
import errorResponse from "../../shared/utils/errorResponse";
import validation from "../../shared/middlewares/validation";
import { TypedRequest } from "../../shared/types/express";
import { EmailService } from "../../emails/services/emailService";
import { EmailTemplates } from "../../emails/services/emailTemplates";
import { getHashedPassword } from "../utils/passwordManager";

export default function getPasswordController({
  prisma,
  emailService,
  emailTemplatesService,
}: {
  prisma: PrismaClient;
  emailService: EmailService;
  emailTemplatesService: EmailTemplates;
}): Router {
  const router = Router();

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

  return router;
}
