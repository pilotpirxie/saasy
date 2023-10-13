import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { EmailService } from "../../emails/services/emailService";
import { EmailTemplates } from "../../emails/services/emailTemplates";
import initializeProfileController from "./profileController";
import initializeAccountController from "./accountController";

type UserControllersConfig = {
  jwtSecret: string;
  prisma: PrismaClient;
  emailService: EmailService;
  emailTemplatesService: EmailTemplates;
}

export default function initializeCombinedUsersController({
  jwtSecret,
  prisma,
  emailService,
  emailTemplatesService,
}: UserControllersConfig): Router {
  const router = Router();

  router.use(initializeProfileController({
    jwtSecret,
    prisma,
  }));

  router.use(initializeAccountController({
    jwtSecret,
    prisma,
    emailService,
    emailTemplatesService,
  }));

  return router;
}
