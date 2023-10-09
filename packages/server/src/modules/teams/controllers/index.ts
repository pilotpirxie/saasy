import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import getTeamsController from "./teamsController";
import getRolesController from "./rolesController";

type UserControllersConfig = {
  jwtSecret: string;
  prisma: PrismaClient;
}

export default function initializeTeamControllers({
  jwtSecret,
  prisma,
}: UserControllersConfig): Router {
  const router = Router();

  router.use(getTeamsController({
    jwtSecret,
    prisma,
  }));

  router.use(getRolesController({
    jwtSecret,
    prisma,
  }));

  return router;
}
