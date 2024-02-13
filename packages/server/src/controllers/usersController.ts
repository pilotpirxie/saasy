import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import Joi from "joi";
import crypto from "crypto";
import dayjs from "dayjs";
import totp from "totp-generator";
import { EmailService } from "../services/emailService";
import { EmailTemplates } from "../services/emailTemplates";
import jwtVerify from "../middlewares/jwt";
import errorResponse from "../utils/errorResponse";
import validation from "../middlewares/validation";
import { TypedRequest } from "../express";
import { getHashedPassword } from "../utils/passwordManager";
import { generateCode } from "../utils/generateCode";

type UserControllersConfig = {
  jwtSecret: string;
  prisma: PrismaClient;
  emailService: EmailService;
  emailTemplatesService: EmailTemplates;
}

export default function initializeUsersController({
  jwtSecret,
  prisma,
  emailService,
  emailTemplatesService,
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

        await prisma.emailVerification.deleteMany({
          where: {
            userId: user.id,
          },
        });

        const code = generateCode();

        await prisma.emailVerification.create({
          data: {
            code,
            email: newEmail,
            userId: user.id,
            expiresAt: dayjs().add(15, "minutes").toDate(),
          },
        });

        emailService.sendEmail({
          to: newEmail,
          subject: `${code} is your verification code`,
          html: emailTemplatesService.getVerifyEmailTemplate({
            code,
            username: user.displayName,
          }),
        });

        return res.sendStatus(200);
      } catch (error) {
        return next(error);
      }
    },
  );

  const verifyNewEmailSchema = {
    body: {
      code: Joi.string().required(),
    },
  };

  router.put(
    "/email-verify",
    jwtVerify(jwtSecret),
    validation(verifyNewEmailSchema),
    async (req: TypedRequest<typeof verifyNewEmailSchema>, res, next) => {
      try {
        const { code } = req.body;

        const emailVerification = await prisma.emailVerification.findFirst({
          where: {
            code,
            userId: req.userId,
            expiresAt: {
              gte: dayjs().toDate(),
            },
          },
        });

        if (!emailVerification) {
          return errorResponse({
            response: res,
            message: "Code is invalid or expired",
            error: "InvalidCode",
            status: 400,
          });
        }

        await prisma.user.update({
          where: {
            id: req.userId,
          },
          data: {
            email: emailVerification.email,
            emailVerifiedAt: dayjs().toDate(),
          },
        });

        await prisma.emailVerification.deleteMany({
          where: {
            userId: req.userId,
          },
        });

        return res.sendStatus(204);
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
        const userTeams = await prisma.userTeam.findMany({
          where: {
            userId: req.userId,
          },
        });

        if (userTeams.length > 0) {
          return errorResponse({
            response: res,
            message: "User belongs to a team",
            error: "UserBelongsToTeam",
            status: 403,
          });
        }

        await prisma.passwordRecovery.deleteMany({
          where: {
            userId: req.userId,
          },
        });

        await prisma.emailVerification.deleteMany({
          where: {
            userId: req.userId,
          },
        });

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

  const enableTotpSchema = {
    body: {
      totpCode: Joi.string().required(),
      totpToken: Joi.string().required(),
    },
  };

  router.post(
    "/totp",
    jwtVerify(jwtSecret),
    validation(enableTotpSchema),
    async (req: TypedRequest<typeof enableTotpSchema>, res, next) => {
      try {
        const { totpCode, totpToken } = req.body;

        const expectedTotpCode = totp(totpToken);

        if (expectedTotpCode !== totpCode) {
          return errorResponse({
            response: res,
            message: "Invalid TOTP code",
            status: 401,
            error: "InvalidTotpCode",
          });
        }

        await prisma.user.update({
          where: {
            id: req.userId,
          },
          data: {
            totpAddedAt: dayjs().toDate(),
            totpToken,
          },
        });

        return res.sendStatus(204);
      } catch (error) {
        return next(error);
      }
    },
  );

  router.delete(
    "/totp",
    jwtVerify(jwtSecret),
    async (req, res, next) => {
      try {
        await prisma.user.update({
          where: {
            id: req.userId,
          },
          data: {
            totpAddedAt: null,
            totpToken: null,
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
