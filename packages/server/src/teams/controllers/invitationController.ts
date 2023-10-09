import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import Joi from "joi";
import dayjs from "dayjs";
import { EmailService } from "../../email/services/emailService";
import { EmailTemplates } from "../../email/services/emailTemplates";
import jwtVerify from "../../shared/middlewares/jwt";
import validation from "../../shared/middlewares/validation";
import errorResponse from "../../shared/utils/errorResponse";
import verifyUserTeamRole, { UserTeamRole } from "../middlewares/verifyUserTeamRole";
import { TypedRequest } from "../../shared/types/express";

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

  const inviteUserSchema = {
    params: {
      teamId: Joi.string().required(),
    },
    body: {
      email: Joi.string().email().required(),
      role: Joi.string().valid("owner", "editor", "viewer").required(),
    },
  };

  router.post(
    "/:teamId/invitations",
    jwtVerify(jwtSecret),
    verifyUserTeamRole(prisma, ["owner"]),
    validation(inviteUserSchema),
    async (req: TypedRequest<typeof inviteUserSchema>, res, next) => {
      try {
        const { email, role } = req.body;
        const { teamId } = req.params;

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
      teamId: Joi.string().required(),
      code: Joi.string().required(),
    },
  };

  router.get(
    "/:teamId/invitations/:code",
    validation(acceptInvitationSchema),
    async (req, res, next) => {
      try {
        const { teamId, code } = req.params;

        const invitation = await prisma.invitation.findFirst({
          where: {
            id: code,
            teamId,
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
            teamId,
          },
          data: {
            acceptedAt: dayjs().toDate(),
          },
        });

        await prisma.userTeam.create({
          data: {
            userId: req.userId,
            teamId,
            role: invitation.role,
          },
        });

        return res.sendStatus(200);
      } catch (error) {
        next(error);
      }
    },
  );

  return router;
}
