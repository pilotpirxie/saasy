import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import Joi from "joi";
import jwtVerify from "../../shared/middlewares/jwt";
import validation from "../../shared/middlewares/validation";
import errorResponse from "../../shared/utils/errorResponse";
import verifyUserTeamRole from "../middlewares/verifyUserTeamRole";

export default function getRolesController({
  prisma,
  jwtSecret,
}: {
  prisma: PrismaClient,
  jwtSecret: string
}): Router {
  const router = Router();

  const updateRoleSchema = {
    params: {
      teamId: Joi.string().required(),
    },
    body: {
      userId: Joi.string().required(),
      role: Joi.string().valid("owner", "editor", "viewer").required(),
    },
  };

  router.put(
    "/:teamId/roles",
    jwtVerify(jwtSecret),
    verifyUserTeamRole(prisma, ["owner"]),
    validation(updateRoleSchema),
    async (req, res, next) => {
      try {
        const { userId, role } = req.body;
        const { teamId } = req.params;

        if (userId === req.userId) {
          return errorResponse({
            error: "CannotAssignRoleToSelf",
            message: "Cannot assign role to self",
            response: res,
            status: 400,
          });
        }

        const userAlreadyInTeam = await prisma.userTeam.findFirst({
          where: {
            userId,
            teamId,
          },
        });

        if (!userAlreadyInTeam) {
          return errorResponse({
            error: "UserNotInTeam",
            message: "User not in team",
            response: res,
            status: 400,
          });
        }

        await prisma.userTeam.update({
          where: {
            userId_teamId: {
              userId,
              teamId,
            },
          },
          data: {
            role,
          },
        });

        return res.sendStatus(200);
      } catch (error) {
        next(error);
      }
    },
  );

  const revokeRoleSchema = {
    params: {
      teamId: Joi.string().required(),
    },
    body: {
      userId: Joi.string().required(),
    },
  };

  router.delete(
    "/:teamId/roles",
    jwtVerify(jwtSecret),
    verifyUserTeamRole(prisma, ["owner"]),
    validation(revokeRoleSchema),
    async (req, res, next) => {
      try {
        const { userId } = req.body;
        const { teamId } = req.params;

        if (userId === req.userId) {
          return errorResponse({
            error: "CannotRevokeRoleFromSelf",
            message: "Cannot revoke role from self",
            response: res,
            status: 400,
          });
        }

        const userAlreadyInTeam = await prisma.userTeam.findFirst({
          where: {
            userId,
            teamId,
          },
        });

        if (!userAlreadyInTeam) {
          return errorResponse({
            error: "UserNotInTeam",
            message: "User not in team",
            response: res,
            status: 400,
          });
        }

        const teamOwner = await prisma.userTeam.findFirst({
          where: {
            teamId,
            role: "owner",
            userId: {
              not: userId,
            },
          },
        });

        if (!teamOwner) {
          return errorResponse({
            error: "CannotRevokeRole",
            message: "Cannot revoke role, there must be at least one owner",
            response: res,
            status: 400,
          });
        }

        await prisma.userTeam.delete({
          where: {
            userId_teamId: {
              userId,
              teamId,
            },
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
