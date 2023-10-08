import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import Joi from "joi";
import crypto from "crypto";
import totp from "totp-generator";
import dayjs from "dayjs";
import validation from "../../shared/middlewares/validation";
import { TypedRequest } from "../../shared/types/express";
import { getIp } from "../../shared/utils/getIp";
import { EmailService } from "../../email/services/emailService";
import { EmailTemplates } from "../../email/services/emailTemplates";
import { JwtInfo } from "../utils/jwtInfo";
import { getHashedPassword } from "../utils/passwordManager";
import { createSession } from "../utils/sessionManager";

export default function getEmailController({
  jwtInfo,
  prisma,
  emailService,
  emailTemplatesService,
}: {
  jwtInfo: JwtInfo;
  prisma: PrismaClient;
  emailService: EmailService;
  emailTemplatesService: EmailTemplates;
}): Router {
  const router = Router();

  const loginSchema = {
    body: {
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      totpCode: Joi.string().optional(),
    },
  };

  router.post(
    "/login",
    validation(loginSchema),
    async (req: TypedRequest<typeof loginSchema>, res, next) => {
      try {
        const { email, password, totpCode } = req.body;

        const user = await prisma.user.findFirst({
          select: {
            id: true,
            password: true,
            salt: true,
            iterations: true,
            totpAddedAt: true,
            totpToken: true,
            authProviderType: true,
          },
          where: {
            email,
            authProviderType: "email",
          },
        });

        if (!user || !user.password || !user.salt || !user.iterations) {
          return res.sendStatus(404);
        }

        if (user.authProviderType !== "email") {
          return res.sendStatus(401);
        }

        const hashedPassword = getHashedPassword({
          password,
          salt: user.salt,
          iterations: user.iterations,
        });

        if (hashedPassword !== user.password) {
          return res.sendStatus(401);
        }

        if (user.totpAddedAt !== null && user.totpToken) {
          if (!totpCode) {
            return res.sendStatus(401);
          }

          const expectedTotpCode = totp(user.totpToken);

          if (expectedTotpCode !== totpCode) {
            return res.sendStatus(401);
          }
        }

        const ip = getIp(req);

        const { jwtToken, jwtRefreshToken } = await createSession({
          prisma,
          userId: user.id,
          ip,
          jwtInfo,
          userAgent: req.headers["user-agent"] || "",
          authProviderType: "email",
        });

        return res.json({
          accessToken: jwtToken,
          refreshToken: jwtRefreshToken,
        });
      } catch (error) {
        return next(error);
      }
    },
  );

  const totpStatusSchema = {
    body: {
      email: Joi.string().email().required(),
    },
  };

  router.post(
    "/totp-status",
    validation(totpStatusSchema),
    async (req: TypedRequest<typeof totpStatusSchema>, res, next) => {
      try {
        const { email } = req.body;

        const user = await prisma.user.findFirst({
          select: {
            id: true,
            totpAddedAt: true,
          },
          where: {
            email,
            authProviderType: "email",
          },
        });

        if (!user) {
          return res.sendStatus(404);
        }

        return res.json({
          enabled: !!user.totpAddedAt,
        });
      } catch (error) {
        return next(error);
      }
    },
  );

  const registerSchema = {
    body: {
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    },
  };

  router.post(
    "/register",
    validation(registerSchema),
    async (req: TypedRequest<typeof registerSchema>, res, next) => {
      try {
        const { email, password } = req.body;

        const possibleUser = await prisma.user.findFirst({
          select: {
            id: true,
          },
          where: {
            email,
          },
        });

        if (possibleUser) {
          return res.sendStatus(409);
        }

        const salt = crypto.randomBytes(16).toString("hex");
        const iterations = 600000;
        const hashedPassword = getHashedPassword({
          password,
          salt,
          iterations,
        });

        const user = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            salt,
            iterations,
            displayName: email.split("@")[0],
            role: "user",
            registerIp: getIp(req),
            authProviderType: "email",
          },
        });

        const emailVerification = await prisma.emailVerification.create({
          data: {
            userId: user.id,
            code: crypto.randomBytes(32).toString("hex"),
            email,
          },
        });

        emailService.sendEmail({
          to: email,
          subject: "Verify your email",
          html: emailTemplatesService.getVerifyEmailTemplate({
            code: emailVerification.code,
            username: user.displayName,
            userId: user.id,
          }),
        });

        return res.sendStatus(201);
      } catch (error) {
        return next(error);
      }
    },
  );

  const verifyEmailSchema = {
    body: {
      userId: Joi.string().required(),
      code: Joi.string().required(),
    },
  };

  router.post(
    "/verify",
    validation(verifyEmailSchema),
    async (req: TypedRequest<typeof verifyEmailSchema>, res, next) => {
      try {
        const { code, userId } = req.body;

        const verificationCode = await prisma.emailVerification.findFirst({
          select: {
            id: true,
            userId: true,
          },
          where: {
            code,
            userId,
          },
        });

        if (!verificationCode) {
          return res.sendStatus(404);
        }

        await prisma.user.update({
          data: {
            verifiedAt: dayjs().toDate(),
          },
          where: {
            id: verificationCode.userId,
          },
        });

        await prisma.emailVerification.delete({
          where: {
            id: verificationCode.id,
          },
        });

        return res.sendStatus(200);
      } catch (error) {
        return next(error);
      }
    },
  );

  const resendVerification = {
    body: {
      email: Joi.string().email().required(),
    },
  };

  router.post(
    "/resend-verify",
    validation(resendVerification),
    async (req: TypedRequest<typeof resendVerification>, res, next) => {
      try {
        const { email } = req.body;

        const user = await prisma.user.findFirst({
          select: {
            id: true,
            displayName: true,
          },
          where: {
            email,
            verifiedAt: null,
            authProviderType: "email",
          },
        });

        if (!user) {
          return res.sendStatus(400);
        }

        await prisma.emailVerification.deleteMany({
          where: {
            userId: user.id,
          },
        });

        const emailVerification = await prisma.emailVerification.create({
          data: {
            userId: user.id,
            code: crypto.randomBytes(32).toString("hex"),
            email,
          },
        });

        emailService.sendEmail({
          to: email,
          subject: "Verify your email",
          html: emailTemplatesService.getVerifyEmailTemplate({
            code: emailVerification.code,
            username: user.displayName,
            userId: user.id,
          }),
        });

        return res.sendStatus(200);
      } catch (error) {
        return next(error);
      }
    },
  );

  return router;
}
