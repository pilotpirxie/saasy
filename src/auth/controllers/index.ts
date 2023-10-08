import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { EmailService } from "../../email/services/emailService";
import { EmailTemplates } from "../../email/services/emailTemplates";
import { JwtInfo } from "../utils/jwtInfo";
import getEmailController from "./emailController";
import getSessionController from "./sessionController";
import getPasswordController from "./passwordController";
import getSocialAuthController from "./socialController";

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

export default function initializeAuthControllers({
  jwtInfo,
  prisma,
  emailService,
  emailTemplatesService,
  socialAuthProviders,
  baseUrl,
  callbackUrl,
}: AuthControllersConfig): Router {
  const router = Router();

  router.use(getEmailController({
    jwtInfo,
    prisma,
    emailService,
    emailTemplatesService,
  }));

  router.use(getSessionController({
    jwtInfo,
    prisma,
  }));

  router.use(getPasswordController({
    prisma,
    emailService,
    emailTemplatesService,
  }));

  router.use(getSocialAuthController({
    prisma,
    jwtInfo,
    callbackUrl,
    baseUrl,
    socialAuthProviders,
  }));

  return router;
}
