import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import Joi from "joi";
import dayjs from "dayjs";
import { EmailService } from "../../email/services/emailService";
import { EmailTemplates } from "../../email/services/emailTemplates";
import jwtVerify from "../../shared/middlewares/jwt";
import verifyUserTeamRole, { UserTeamRole } from "../../teams/middlewares/verifyUserTeamRole";
import validation from "../../shared/middlewares/validation";
import { TypedRequest } from "../../shared/types/express";
import errorResponse from "../../shared/utils/errorResponse";

export default function getInvitationController({
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
    "/",
    jwtVerify(jwtSecret),
    async (req, res, next) => {
      try {
        const user = await prisma.user.findFirst({
          where: {
            id: req.userId,
          },
          select: {
            email: true,
          },
        });

        if (!user) {
          return errorResponse({
            error: "UserNotFound",
            message: "User not found",
            response: res,
            status: 404,
          });
        }

        if (!user.email) {
          return errorResponse({
            error: "UserEmailNotSet",
            message: "User email not set",
            response: res,
            status: 400,
          });
        }

        const invitations = await prisma.invitation.findMany({
          where: {
            email: user.email,
          },
        });

        return res.json(invitations);
      } catch (error) {
        next(error);
      }
    },
  );

  const inviteUserSchema = {
    body: {
      teamId: Joi.string().required(),
      email: Joi.string().email().required(),
      role: Joi.string().valid("owner", "editor", "viewer").required(),
    },
  };

  router.post(
    "/",
    jwtVerify(jwtSecret),
    verifyUserTeamRole(prisma, ["owner"]),
    validation(inviteUserSchema),
    async (req: TypedRequest<typeof inviteUserSchema>, res, next) => {
      try {
        const { email, role, teamId } = req.body;

        const user = await prisma.user.findFirst({
          where: {
            email,
          },
        });

        if (user) {
          const userAlreadyInTeam = await prisma.userTeam.findFirst({
            where: {
              userId: user.id,
              teamId,
            },
          });

          if (userAlreadyInTeam) {
            return errorResponse({
              error: "UserAlreadyInTeam",
              message: "User is already in team",
              response: res,
              status: 400,
            });
          }
        }

        const team = await prisma.team.findFirst({
          where: {
            id: teamId,
          },
          select: {
            name: true,
          },
        });

        if (!team) {
          return errorResponse({
            error: "TeamNotFound",
            message: "Team not found",
            response: res,
            status: 404,
          });
        }

        const invitation = await prisma.invitation.create({
          data: {
            email,
            teamId,
            invitedBy: req.userId,
            expiresAt: dayjs().add(14, "day").toDate(),
            role: role as UserTeamRole,
          },
        });

        emailService.sendEmail({
          to: email,
          subject: `You've been invited to a team ${team.name}`,
          html: emailTemplatesService.getInvitationEmail(),
        });

        return res.json(invitation);
      } catch (error) {
        next(error);
      }
    },
  );

  const acceptInvitationSchema = {
    params: {
      code: Joi.string().required(),
    },
  };

  router.post(
    "/:code",
    validation(acceptInvitationSchema),
    async (req, res, next) => {
      try {
        const { code } = req.params;

        const invitation = await prisma.invitation.findFirst({
          where: {
            id: code,
            acceptedAt: null,
          },
        });

        if (!invitation) {
          return errorResponse({
            error: "InvitationNotFound",
            message: "Invitation not found",
            response: res,
            status: 404,
          });
        }

        if (dayjs(invitation.expiresAt).isBefore(dayjs())) {
          return errorResponse({
            error: "InvitationExpired",
            message: "Invitation expired",
            response: res,
            status: 400,
          });
        }

        await prisma.invitation.update({
          where: {
            id: code,
          },
          data: {
            acceptedAt: dayjs().toDate(),
          },
        });

        await prisma.userTeam.create({
          data: {
            userId: req.userId,
            teamId: invitation.teamId,
            role: invitation.role,
          },
        });

        return res.sendStatus(200);
      } catch (error) {
        next(error);
      }
    },
  );

  const deleteInvitationSchema = {
    params: {
      code: Joi.string().required(),
    },
  };

  router.delete(
    "/:code",
    jwtVerify(jwtSecret),
    validation(deleteInvitationSchema),
    async (req, res, next) => {
      try {
        const { code } = req.params;

        const invitation = await prisma.invitation.findFirst({
          where: {
            id: code,
            acceptedAt: null,
          },
        });

        if (!invitation) {
          return errorResponse({
            error: "InvitationNotFound",
            message: "Invitation not found",
            response: res,
            status: 404,
          });
        }

        await prisma.invitation.delete({
          where: {
            id: code,
          },
        });

        return res.sendStatus(204);
      } catch (error) {
        next(error);
      }
    },
  );

  return router;
}
