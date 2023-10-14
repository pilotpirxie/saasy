import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { EmailService } from "../../emails/services/emailService";
import { EmailTemplates } from "../../emails/services/emailTemplates";
import { JwtInfo } from "../utils/jwtInfo";
import initializeSessionController from "./sessionController";
import initializePasswordController from "./passwordController";
import initializeEmailAuthController from "./emailAuthController";
import initializeSocialAuthController from "./socialAuthController";

type AuthControllersConfig = {
  jwtInfo: JwtInfo;
  prisma: PrismaClient;
  emailService: EmailService;
  emailTemplatesService: EmailTemplates;
  socialAuthProviders: {
    google: {
      clientId: string;
      clientSecret: string;
    },
    github: {
      clientId: string;
      clientSecret: string;
    }
  };
  baseUrl: string;
  callbackUrl: string;
}

export default function initializeCombinedAuthController({
  jwtInfo,
  prisma,
  emailService,
  emailTemplatesService,
  socialAuthProviders,
  baseUrl,
  callbackUrl,
}: AuthControllersConfig): Router {
  const router = Router();

  router.use(initializeEmailAuthController({
    prisma,
    emailService,
    emailTemplatesService,
    callbackUrl,
  }));

  router.use(initializeSessionController({
    jwtInfo,
    prisma,
  }));

  router.use(initializePasswordController({
    prisma,
    emailService,
    emailTemplatesService,
  }));

  router.use(initializeSocialAuthController({
    prisma,
    callbackUrl,
    baseUrl,
    socialAuthProviders,
  }));

  return router;
}
