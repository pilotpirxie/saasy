import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import Joi from "joi";
import jwtVerify from "../middlewares/jwt";
import errorResponse from "../utils/errorResponse";
import validation from "../middlewares/validation";
import { TypedRequest } from "../express";

type ProjectsControllersConfig = {
  jwtSecret: string;
  prisma: PrismaClient;
}

export default function initializeProjectsController({
  jwtSecret,
  prisma,
}: ProjectsControllersConfig): Router {
  const router = Router();

  const createProjectSchema = {
    body: {
      teamId: Joi.string().required(),
      name: Joi.string().required(),
    },
  };

  router.post(
    "/",
    jwtVerify(jwtSecret),
    validation(createProjectSchema),
    async (req: TypedRequest<typeof createProjectSchema>, res, next) => {
      try {
        const { teamId, name } = req.body;

        const team = await prisma.team.findFirst({
          where: {
            id: teamId,
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

        const teamMember = await prisma.userTeam.findFirst({
          where: {
            userId: req.userId,
            teamId,
          },
        });

        if (!teamMember) {
          return errorResponse({
            response: res,
            message: "Forbidden access, user is not in the team",
            status: 403,
            error: "ForbiddenNotInTeam",
          });
        }

        const roles = ["owner", "editor"];
        if (!roles.includes(teamMember.role)) {
          return errorResponse({
            response: res,
            message: `Forbidden access, user does not have the required role. Required one of: ${roles.join(", ")}`,
            status: 403,
            error: "ForbiddenRole",
          });
        }

        await prisma.project.create({
          data: {
            name,
            teamId,
          },
        });

        res.sendStatus(201);
      } catch (error) {
        next(error);
      }
    },
  );

  return router;
}
