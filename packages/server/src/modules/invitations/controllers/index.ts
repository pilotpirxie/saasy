import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { EmailService } from "../../emails/services/emailService";
import { EmailTemplates } from "../../emails/services/emailTemplates";
import getInvitationsController from "./invitationsController";

type UserControllersConfig = {
  jwtSecret: string;
  prisma: PrismaClient;
  emailService: EmailService;
  emailTemplatesService: EmailTemplates;
}

export default function initializeInvitationControllers({
  jwtSecret,
  prisma,
  emailService,
  emailTemplatesService,
}: UserControllersConfig): Router {
  const router = Router();

  router.use(getInvitationsController({
    jwtSecret,
    prisma,
    emailService,
    emailTemplatesService,
  }));

  return router;
}
