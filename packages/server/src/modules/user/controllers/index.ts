import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { EmailService } from "../../email/services/emailService";
import { EmailTemplates } from "../../email/services/emailTemplates";
import getProfileController from "./profileController";
import getAccountController from "./accountController";

type UserControllersConfig = {
  jwtSecret: string;
  prisma: PrismaClient;
  emailService: EmailService;
  emailTemplatesService: EmailTemplates;
}

export default function initializeUserControllers({
  jwtSecret,
  prisma,
  emailService,
  emailTemplatesService,
}: UserControllersConfig): Router {
  const router = Router();

  router.use(getProfileController({
    jwtSecret,
    prisma,
  }));

  router.use(getAccountController({
    jwtSecret,
    prisma,
    emailService,
    emailTemplatesService,
  }));

  return router;
}
