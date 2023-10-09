import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import Joi from "joi";
import jwtVerify from "../../shared/middlewares/jwt";
import validation from "../../shared/middlewares/validation";
import verifyUserTeamRole from "../middlewares/verifyUserTeamRole";

export default function getTeamController({
  prisma,
  jwtSecret,
}: {
  prisma: PrismaClient,
  jwtSecret: string
}): Router {
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
        const teams = await prisma.userTeam.findMany({
          include: {
            team: true,
          },
          where: {
            userId: req.userId,
          },
        });

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

        await prisma.team.delete({
          where: {
            id: teamId,
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
