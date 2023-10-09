import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import Joi from "joi";
import crypto from "crypto";
import dayjs from "dayjs";
import { EmailService } from "../../email/services/emailService";
import { EmailTemplates } from "../../email/services/emailTemplates";
import jwtVerify from "../../shared/middlewares/jwt";
import validation from "../../shared/middlewares/validation";
import { TypedRequest } from "../../shared/types/express";
import { getHashedPassword } from "../../auth/utils/passwordManager";
import errorResponse from "../../shared/utils/errorResponse";

export default function getAccountController({
  prisma,
  jwtSecret,
  emailService,
  emailTemplatesService,
}: {
  prisma: PrismaClient,
  jwtSecret: string
  emailService: EmailService;
  emailTemplatesService: EmailTemplates;
}): Router {
  const router = Router();

  router.get(
    "/account",
    jwtVerify(jwtSecret),
    async (req, res, next) => {
      try {
        const user = await prisma.user.findFirst({
          select: {
            email: true,
            emailVerifiedAt: true,
            authProviderType: true,
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

  const updatePasswordSchema = {
    body: {
      newPassword: Joi.string().min(8).max(32).required(),
    },
  };

  router.put(
    "/password",
    jwtVerify(jwtSecret),
    validation(updatePasswordSchema),
    async (req: TypedRequest<typeof updatePasswordSchema>, res, next) => {
      try {
        const { newPassword } = req.body;

        const user = await prisma.user.findFirst({
          where: {
            id: req.userId,
          },
          select: {
            authProviderType: true,
          },
        });

        if (!user) {
          return errorResponse({
            response: res,
            message: "User not found",
            error: "UserNotFound",
            status: 404,
          });
        }

        if (user.authProviderType !== "email") {
          return errorResponse({
            response: res,
            message: "Password can be changed only for email users",
            error: "PasswordChangeNotAllowed",
            status: 403,
          });
        }

        const salt = crypto.randomBytes(16).toString("hex");
        const iterations = 600000;
        const hashedPassword = getHashedPassword({
          password: newPassword,
          salt,
          iterations,
        });

        await prisma.user.update({
          where: {
            id: req.userId,
          },
          data: {
            password: hashedPassword,
            salt,
            iterations,
          },
        });

        return res.sendStatus(204);
      } catch (error) {
        return next(error);
      }
    },
  );

  const updateEmailSchema = {
    body: {
      newEmail: Joi.string().email().required(),
    },
  };

  router.put(
    "/email",
    jwtVerify(jwtSecret),
    validation(updateEmailSchema),
    async (req: TypedRequest<typeof updateEmailSchema>, res, next) => {
      try {
        const { newEmail } = req.body;

        const user = await prisma.user.findFirst({
          select: {
            id: true,
            displayName: true,
            email: true,
          },
          where: {
            id: req.userId,
          },
        });

        if (!user) {
          return errorResponse({
            response: res,
            message: "User not found",
            error: "UserNotFound",
            status: 404,
          });
        }

        if (user.email === newEmail) {
          return errorResponse({
            response: res,
            message: "New email is the same as current",
            error: "SameEmail",
            status: 400,
          });
        }

        const possibleUser = await prisma.user.findFirst({
          select: {
            id: true,
          },
          where: {
            email: newEmail,
          },
        });

        if (possibleUser) {
          return res.status(409).json({
            message: "Email already exists",
            error: "EmailAlreadyExists",
          });
        }

        const emailVerification = await prisma.emailVerification.create({
          data: {
            userId: user.id,
            email: newEmail,
          },
        });

        emailService.sendEmail({
          to: newEmail,
          subject: "Verify your email",
          html: emailTemplatesService.getVerifyEmailTemplate({
            code: emailVerification.id,
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

  router.delete(
    "/account",
    jwtVerify(jwtSecret),
    async (req, res, next) => {
      try {
        await prisma.user.delete({
          where: {
            id: req.userId,
          },
        });

        return res.sendStatus(204);
      } catch (error) {
        return next(error);
      }
    },
  );

  const updateConsentsSchema = {
    body: {
      isNewsletterConsentGranted: Joi.boolean().required(),
      isMarketingConsentGranted: Joi.boolean().required(),
    },
  };

  router.put(
    "/consents",
    jwtVerify(jwtSecret),
    validation(updateConsentsSchema),
    async (req: TypedRequest<typeof updateConsentsSchema>, res, next) => {
      try {
        const { isNewsletterConsentGranted, isMarketingConsentGranted } = req.body;

        await prisma.user.update({
          where: {
            id: req.userId,
          },
          data: {
            newsletterConsentGrantedAt: isNewsletterConsentGranted ? dayjs().toDate() : null,
            marketingConsentGrantedAt: isMarketingConsentGranted ? dayjs().toDate() : null,
          },
        });

        return res.sendStatus(204);
      } catch (error) {
        return next(error);
      }
    },
  );

  router.get(
    "/invitations",
    jwtVerify(jwtSecret),
    async (req, res, next) => {
      try {
        const { teamId } = req.params;

        const invitations = await prisma.invitation.findMany({
          where: {
            teamId,
          },
        });

        return res.json(invitations);
      } catch (error) {
        next(error);
      }
    },
  );

  return router;
}
