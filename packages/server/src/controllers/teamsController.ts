import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import Joi from "joi";
import dayjs from "dayjs";
import jwtVerify from "../middlewares/jwt";
import validation from "../middlewares/validation";
import verifyUserTeamRole from "../middlewares/verifyUserTeamRole";
import errorResponse from "../utils/errorResponse";

type UserControllersConfig = {
  jwtSecret: string;
  prisma: PrismaClient;
}

export default function initializeTeamsController({
  jwtSecret,
  prisma,
}: UserControllersConfig): Router {
  const router = Router();

  const createTeamSchema = {
    body: {
      name: Joi.string().min(1).max(32).required(),
    },
  };

  router.post(
    "/",
    jwtVerify(jwtSecret),
    validation(createTeamSchema),
    async (req, res, next) => {
      try {
        const { name } = req.body;

        const team = await prisma.team.create({
          data: {
            name,
            planId: "00000000-0000-0000-0000-000000000000",
          },
        });

        await prisma.userTeam.create({
          data: {
            teamId: team.id,
            userId: req.userId,
            role: "owner",
          },
        });

        return res.json(team);
      } catch (error) {
        next(error);
      }
    },
  );

  router.get(
    "/",
    jwtVerify(jwtSecret),
    async (req, res, next) => {
      try {
        const userTeams = await prisma.userTeam.findMany({
          include: {
            team: {
              include: {
                projects: true,
                plan: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          where: {
            userId: req.userId,
          },
        });

        const teams = userTeams.map((userTeam) => ({
          ...userTeam.team,
          role: userTeam.role,
          plan: userTeam.team?.plan,
        }));

        return res.json(teams);
      } catch (error) {
        next(error);
      }
    },
  );

  const updateTeamSchema = {
    params: {
      teamId: Joi.string().required(),
    },
    body: {
      name: Joi.string().min(1).max(32).required(),
    },
  };

  router.put(
    "/:teamId",
    jwtVerify(jwtSecret),
    verifyUserTeamRole(prisma, ["owner"]),
    validation(updateTeamSchema),
    async (req, res, next) => {
      try {
        const { teamId } = req.params;
        const { name } = req.body;

        const team = await prisma.team.update({
          where: {
            id: teamId,
          },
          data: {
            name,
          },
        });

        return res.json(team);
      } catch (error) {
        next(error);
      }
    },
  );

  const deleteTeamSchema = {
    params: {
      teamId: Joi.string().required(),
    },
  };

  router.delete(
    "/:teamId",
    jwtVerify(jwtSecret),
    verifyUserTeamRole(prisma, ["owner"]),
    validation(deleteTeamSchema),
    async (req, res, next) => {
      try {
        const { teamId } = req.params;

        await prisma.team.update({
          where: {
            id: teamId,
          },
          data: {
            deleteAfter: dayjs().add(31, "day").toDate(),
          },
        });

        return res.sendStatus(204);
      } catch (error) {
        next(error);
      }
    },
  );

  router.put(
    "/:teamId/restore",
    jwtVerify(jwtSecret),
    verifyUserTeamRole(prisma, ["owner"]),
    validation(deleteTeamSchema),
    async (req, res, next) => {
      try {
        const { teamId } = req.params;

        await prisma.team.update({
          where: {
            id: teamId,
          },
          data: {
            deleteAfter: null,
          },
        });

        return res.sendStatus(204);
      } catch (error) {
        next(error);
      }
    },
  );

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

  const getAllTeamMembersSchema = {
    params: {
      teamId: Joi.string().required(),
    },
  };

  router.get(
    "/:teamId/members",
    jwtVerify(jwtSecret),
    verifyUserTeamRole(prisma, ["owner"]),
    validation(getAllTeamMembersSchema),
    async (req, res, next) => {
      try {
        const { teamId } = req.params;

        const teamMembers = await prisma.userTeam.findMany({
          where: {
            teamId,
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                displayName: true,
              },
            },
          },
        });

        return res.json(teamMembers);
      } catch (error) {
        next(error);
      }
    },
  );

  const getAllInvitedMembersSchema = {
    params: {
      teamId: Joi.string().required(),
    },
  };

  router.get(
    "/:teamId/invitations",
    jwtVerify(jwtSecret),
    verifyUserTeamRole(prisma, ["owner"]),
    validation(getAllInvitedMembersSchema),
    async (req, res, next) => {
      try {
        const { teamId } = req.params;

        const invitedMembers = await prisma.invitation.findMany({
          where: {
            teamId,
            expiresAt: {
              gt: new Date(),
            },
          },
        });

        return res.json(invitedMembers);
      } catch (error) {
        next(error);
      }
    },
  );

  const inviteMemberSchema = {
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
    validation(inviteMemberSchema),
    async (req, res, next) => {
      try {
        const { teamId } = req.params;
        const { email, role } = req.body;

        const userAlreadyInTeam = await prisma.userTeam.findFirst({
          where: {
            user: {
              email,
            },
            teamId,
          },
        });

        if (userAlreadyInTeam) {
          return errorResponse({
            error: "UserAlreadyInTeam",
            message: "User already in team",
            response: res,
            status: 400,
          });
        }

        const userAlreadyInvited = await prisma.invitation.findFirst({
          where: {
            email,
            teamId,
            expiresAt: {
              gt: new Date(),
            },
          },
        });

        if (userAlreadyInvited) {
          return errorResponse({
            error: "UserAlreadyInvited",
            message: "User already invited",
            response: res,
            status: 400,
          });
        }

        await prisma.invitation.deleteMany({
          where: {
            email,
            expiresAt: {
              lt: new Date(),
            },
          },
        });

        await prisma.invitation.create({
          data: {
            teamId,
            role,
            email,
            invitedBy: req.userId,
            expiresAt: dayjs().add(14, "day").toDate(),
          },
        });

        return res.sendStatus(201);
      } catch (error) {
        next(error);
      }
    },
  );

  const cancelInvitationSchema = {
    params: {
      teamId: Joi.string().required(),
      invitationId: Joi.string().required(),
    },
  };

  router.delete(
    "/:teamId/invitations/:invitationId",
    jwtVerify(jwtSecret),
    verifyUserTeamRole(prisma, ["owner"]),
    validation(cancelInvitationSchema),
    async (req, res, next) => {
      try {
        const { invitationId } = req.params;

        await prisma.invitation.delete({
          where: {
            id: invitationId,
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
