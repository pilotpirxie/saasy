import express, { Express } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import NodeCache from "node-cache";
import cors from "cors";
import { errorHandler } from "./middlewares/errors";
import { checkPrismaConnection } from "./data/prismaConnectionTest";
import { usePrismaClientFactory } from "./data/prismaClientFactory";
import { NodeCacheAdapter } from "./data/cacheStore";
import getAuthController from "./controllers/authController";
import { NodemailerEmailService } from "./services/nodemailerEmailService";
import { EmailTemplatesService } from "./services/emailTemplatesService";

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

checkPrismaConnection(prisma);

const nodeCache = new NodeCache({
  stdTTL: 10,
  checkperiod: 1,
});

const cache = new NodeCacheAdapter({
  nodeCache,
});

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
  from: "Company Name <company@example.com>",
});

const emailTemplates = new EmailTemplatesService({
  baseUrl: "http://localhost:3000",
  companyName: "Company Name",
});

app.get(
  "/api/health",
  async (req, res) => {
    const data = await prisma.$executeRaw`SELECT 1`;
    return res.sendStatus(data ? 200 : 500);
  },
);

app.use("/api/auth", getAuthController({
  jwtInfo: {
    secret: process.env.JWT_SECRET || "",
    refreshTokenTimeout: process.env.JWT_REFRESH_TOKEN_TIMEOUT || "1d",
    timeout: process.env.JWT_TIMEOUT || "1h",
  },
  emailService,
  emailTemplatesService: emailTemplates,
  prisma,
  baseUrl: "http://localhost:3000",
  socialAuthProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
}));

app.use(errorHandler);

app.listen(port, () => {
  console.info({
    mode: process.env.NODE_ENV,
    sdk: process.version,
    datetime: new Date().toISOString(),
    service: process.env.SERVICE,
  });
  console.info(`Server is running on port ${port}`);
});
