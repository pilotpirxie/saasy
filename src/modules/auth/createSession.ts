import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import dayjs from "dayjs";
import ms from "ms";
import { getTokens } from "./getTokens";
import { JwtInfo } from "./jwtInfo";

export async function createSession({
  prisma,
  userId,
  ip,
  jwtInfo,
  userAgent,
  authProviderType,
}: {
  prisma: PrismaClient;
  userId: string;
  ip: string;
  userAgent: string;
  authProviderType:
    | "twitter"
    | "github"
    | "facebook"
    | "google"
    | "gitlab"
    | "bitbucket"
    | "email"
    | "apple";
  jwtInfo: JwtInfo;
}): Promise<{ jwtToken: string; jwtRefreshToken: string }> {
  const session = await prisma.sessions.create({
    data: {
      user_id: userId,
      ip_address: ip,
      refresh_token: crypto.randomBytes(32).toString("hex"),
      user_agent: userAgent,
      expires_at: dayjs().add(ms(jwtInfo.timeout), "millisecond").toDate(),
      auth_provider_type: authProviderType,
    },
  });

  return getTokens({
    userId,
    session,
    jwtInfo,
  });
}
