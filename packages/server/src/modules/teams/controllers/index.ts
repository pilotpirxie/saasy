import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { EmailService } from "../../email/services/emailService";
import { EmailTemplates } from "../../email/services/emailTemplates";
import getTeamController from "./teamController";
import getRoleController from "./roleController";
import getInvitationController from "./invitationController";

type UserControllersConfig = {
  jwtSecret: string;
  prisma: PrismaClient;
  emailService: EmailService;
  emailTemplatesService: EmailTemplates;
}

export default function initializeTeamControllers({
  jwtSecret,
  prisma,
  emailService,
  emailTemplatesService,
}: UserControllersConfig): Router {
  const router = Router();

  router.use(getTeamController({
    jwtSecret,
    prisma,
  }));

  router.use(getRoleController({
    jwtSecret,
    prisma,
  }));

  router.use(getInvitationController({
    jwtSecret,
    prisma,
    emailService,
    emailTemplatesService,
  }));

  return router;
}
