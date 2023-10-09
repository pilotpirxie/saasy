import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { EmailService } from "../../email/services/emailService";
import { EmailTemplates } from "../../email/services/emailTemplates";

export default function getInvitationController({
  prisma,
  jwtSecret,
  emailService,
  emailTemplatesService,
}: {
  prisma: PrismaClient,
  jwtSecret: string
  emailService: EmailService;
  emailTemplatesService: EmailTemplates;
}): Router {
  const router = Router();

  return router;
}
