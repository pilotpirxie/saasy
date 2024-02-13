import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import Joi from "joi";
import crypto from "crypto";
import dayjs from "dayjs";
import { EmailService } from "../services/emailService";
import { EmailTemplates } from "../services/emailTemplates";
import jwtVerify from "../middlewares/jwt";
import errorResponse from "../utils/errorResponse";
import validation from "../middlewares/validation";
import { TypedRequest } from "../express";
import { getHashedPassword } from "../utils/passwordManager";

type UserControllersConfig = {
  jwtSecret: string;
  prisma: PrismaClient;
  emailService: EmailService;
  emailTemplatesService: EmailTemplates;
}

export default function initializeUsersController({
  jwtSecret,
  prisma,
}: UserControllersConfig): Router {
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

        if (!user) {
          return errorResponse({
            response: res,
            status: 404,
            message: "User not found",
            error: "UserNotFound",
          });
        }

        return res.json(user);
      } catch (error) {
        return next(error);
      }
    },
  );

  const updateProfileAddressSchema = {
    body: {
      country: Joi.string().optional().allow(""),
      address: Joi.string().optional().allow(""),
      phone: Joi.string().optional().allow(""),
      fullName: Joi.string().optional().allow(""),
    },
  };

  router.put(
    "/profile/address",
    jwtVerify(jwtSecret),
    validation(updateProfileAddressSchema),
    async (req: TypedRequest<typeof updateProfileAddressSchema>, res, next) => {
      try {
        const {
          country, address, phone, fullName,
        } = req.body;

        const user = await prisma.user.findFirst({
          where: {
            id: req.userId,
          },
          select: {
            id: true,
          },
        });

        if (!user) {
          return errorResponse({
            response: res,
            status: 404,
            message: "User not found",
            error: "UserNotFound",
          });
        }

        await prisma.user.update({
          where: {
            id: req.userId,
          },
          data: {
            country: country || "",
            address: address || "",
            phone: phone || "",
            fullName: fullName || "",
          },
        });

        return res.sendStatus(204);
      } catch (error) {
        return next(error);
      }
    },
  );

  const updateProfileDisplayNameSchema = {
    body: {
      displayName: Joi.string().required(),
    },
  };

  router.put(
    "/profile/display-name",
    jwtVerify(jwtSecret),
    validation(updateProfileDisplayNameSchema),
    async (req: TypedRequest<typeof updateProfileDisplayNameSchema>, res, next) => {
      try {
        const { displayName } = req.body;

        const user = await prisma.user.findFirst({
          where: {
            id: req.userId,
          },
          select: {
            id: true,
          },
        });

        if (!user) {
          return errorResponse({
            response: res,
            status: 404,
            message: "User not found",
            error: "UserNotFound",
          });
        }

        await prisma.user.update({
          where: {
            id: req.userId,
          },
          data: {
            displayName,
          },
        });

        return res.sendStatus(204);
      } catch (error) {
        return next(error);
      }
    },
  );

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
            totpAddedAt: true,
            newsletterConsentGrantedAt: true,
            marketingConsentGrantedAt: true,
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

        // const emailVerification = await prisma.emailVerification.create({
        //   data: {
        //     userId: user.id,
        //     email: newEmail,
        //   },
        // });
        //
        // emailService.sendEmail({
        //   to: newEmail,
        //   subject: "Verify your email",
        //   html: emailTemplatesService.getVerifyEmailTemplate({
        //     code: emailVerification.id,
        //     username: user.displayName,
        //     userId: user.id,
        //   }),
        // });

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
        // check if user belongs to any team

        // remove all invitations for user

        // remove all password reset tokens for user

        // remove all email verifications for user

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
      marketingConsent: Joi.boolean().required(),
      newsletterConsent: Joi.boolean().required(),
    },
  };

  router.put(
    "/consents",
    jwtVerify(jwtSecret),
    validation(updateConsentsSchema),
    async (req: TypedRequest<typeof updateConsentsSchema>, res, next) => {
      try {
        const { marketingConsent, newsletterConsent } = req.body;

        await prisma.user.update({
          where: {
            id: req.userId,
          },
          data: {
            newsletterConsentGrantedAt: newsletterConsent ? dayjs().toDate() : null,
            marketingConsentGrantedAt: marketingConsent ? dayjs().toDate() : null,
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
        const user = await prisma.user.findFirst({
          where: {
            id: req.userId,
          },
          select: {
            id: true,
            email: true,
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

        if (!user.email) {
          return res.json([]);
        }

        const invitations = await prisma.invitation.findMany({
          where: {
            email: user.email,
            expiresAt: {
              gte: dayjs().toDate(),
            },
            acceptedAt: null,
          },
          select: {
            id: true,
            expiresAt: true,
            role: true,
            team: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        return res.json(invitations);
      } catch (error) {
        next(error);
      }
    },
  );

  const acceptInvitationSchema = {
    params: {
      invitationId: Joi.string().uuid().required(),
    },
  };

  router.put(
    "/invitations/:invitationId/accept",
    jwtVerify(jwtSecret),
    validation(acceptInvitationSchema),
    async (req: TypedRequest<typeof acceptInvitationSchema>, res, next) => {
      try {
        const { invitationId } = req.params;

        const invitation = await prisma.invitation.findFirst({
          where: {
            id: invitationId,
            expiresAt: {
              gte: dayjs().toDate(),
            },
          },
        });

        if (!invitation) {
          return errorResponse({
            response: res,
            message: "Invitation not found",
            error: "InvitationNotFound",
            status: 404,
          });
        }

        await prisma.userTeam.create({
          data: {
            userId: req.userId,
            teamId: invitation.teamId,
            role: invitation.role,
          },
        });

        await prisma.invitation.update({
          where: {
            id: invitationId,
          },
          data: {
            acceptedAt: dayjs().toDate(),
          },
        });

        return res.sendStatus(204);
      } catch (error) {
        return next(error);
      }
    },
  );

  const declineInvitationSchema = {
    params: {
      invitationId: Joi.string().uuid().required(),
    },
  };

  router.put(
    "/invitations/:invitationId/decline",
    jwtVerify(jwtSecret),
    validation(declineInvitationSchema),
    async (req: TypedRequest<typeof declineInvitationSchema>, res, next) => {
      try {
        const { invitationId } = req.params;

        const invitation = await prisma.invitation.findFirst({
          where: {
            id: invitationId,
            expiresAt: {
              gte: dayjs().toDate(),
            },
          },
        });

        if (!invitation) {
          return errorResponse({
            response: res,
            message: "Invitation not found",
            error: "InvitationNotFound",
            status: 404,
          });
        }

        await prisma.invitation.delete({
          where: {
            id: invitationId,
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
