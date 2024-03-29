import express, { Express } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import { errorHandler } from "./middlewares/errors";
import { checkPrismaConnection } from "./data/prismaConnectionTest";
import { usePrismaClientFactory } from "./data/prismaClientFactory";
import { NodemailerEmailService } from "./services/nodemailerEmailService";
import { EmailTemplatesService } from "./services/emailTemplatesService";
import initializeAuthController from "./controllers/authController";
import initializeUsersController from "./controllers/usersController";
import initializeTeamsController from "./controllers/teamsController";
import { jsonSendStatus } from "./middlewares/jsonSendStatus";
import initializeProjectsController from "./controllers/projectsController";

dotenv.config();

const port = process.env.PORT || 3000;
const app: Express = express();

app.set("trust proxy", true);
app.disable("x-powered-by");

app.use(bodyParser.json({ limit: process.env.MAX_BODY_SIZE || "1KB" }));
app.use(cors());
const prisma = usePrismaClientFactory({
  isDevelopment: process.env.NODE_ENV === "development",
});
app.use(jsonSendStatus);

checkPrismaConnection(prisma);

const emailService = new NodemailerEmailService({
  smtpConfig: {
    host: process.env.SMTP_HOST || "",
    port: parseInt(process.env.SMTP_PORT || "0", 10),
    auth: {
      user: process.env.SMTP_USER || "",
      password: process.env.SMTP_PASSWORD || "",
    },
    tls: {
      rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED === "true",
    },
    secure: process.env.SMTP_SECURE === "true",
  },
  from: process.env.SMTP_FROM || "",
});

const emailTemplatesService = new EmailTemplatesService({
  companyName: "Company Name",
});

app.get(
  "/api/health",
  async (req, res) => {
    const data = await prisma.$executeRaw`SELECT 1`;
    return res.sendStatus(data === 1 ? 200 : 500);
  },
);

app.use("/api/auth", initializeAuthController({
  jwtInfo: {
    secret: process.env.JWT_SECRET || "",
    refreshTokenTimeout: process.env.JWT_REFRESH_TOKEN_TIMEOUT || "1d",
    timeout: process.env.JWT_TIMEOUT || "1h",
  },
  emailService,
  emailTemplatesService,
  prisma,
  baseUrl: process.env.BASE_URL || "http://localhost:3000",
  callbackUrl: process.env.AUTH_CALLBACK_URL || "http://localhost:5173/auth/exchange-code",
  socialAuthProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    },
  },
}));

app.use("/api/users", initializeUsersController({
  jwtSecret: process.env.JWT_SECRET || "",
  emailService,
  emailTemplatesService,
  prisma,
}));

app.use("/api/teams", initializeTeamsController({
  jwtSecret: process.env.JWT_SECRET || "",
  prisma,
  emailService,
  emailTemplatesService,
}));

app.use("/api/projects", initializeProjectsController({
  prisma,
  jwtSecret: process.env.JWT_SECRET || "",
}));

app.use(errorHandler);

app.listen(port, () => {
  console.info({
    mode: process.env.NODE_ENV,
    sdk: process.version,
    datetime: new Date().toISOString(),
  });
  console.info(`Server is running on port ${port}`);
});
