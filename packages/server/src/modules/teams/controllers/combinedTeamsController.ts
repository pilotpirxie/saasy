import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import initializeTeamsController from "./teamsController";
import initializeRolesController from "./rolesController";

type UserControllersConfig = {
  jwtSecret: string;
  prisma: PrismaClient;
}

export default function initializeCombinedTeamsController({
  jwtSecret,
  prisma,
}: UserControllersConfig): Router {
  const router = Router();

  router.use(initializeTeamsController({
    jwtSecret,
    prisma,
  }));

  router.use(initializeRolesController({
    jwtSecret,
    prisma,
  }));

  return router;
}
