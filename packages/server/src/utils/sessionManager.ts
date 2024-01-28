import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import dayjs from "dayjs";
import ms from "ms";
import { JwtInfo } from "./jwtInfo";

export function getTokens({
  userId,
  jwtInfo,
  session,
}: {
  userId: string;
  session: {
    id: string;
    refreshTokenSecretKey: string;
  };
  jwtInfo: JwtInfo;
}) {
  const jwtToken = jwt.sign(
    {
      sub: userId,
    },
    jwtInfo.secret,
    {
      expiresIn: jwtInfo.timeout,
    },
  );

  const jwtRefreshToken = jwt.sign(
    {
      sub: userId,
      jti: session.id,
    },
    session.refreshTokenSecretKey,
    {
      expiresIn: jwtInfo.refreshTokenTimeout,
    },
  );

  return { jwtToken, jwtRefreshToken };
}

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
  const session = await prisma.session.create({
    data: {
      userId,
      ipAddress: ip,
      refreshTokenSecretKey: crypto.randomBytes(32).toString("hex"),
      userAgent,
      expiresAt: dayjs().add(ms(jwtInfo.timeout), "millisecond").toDate(),
      authProviderType,
    },
  });

  return getTokens({
    userId,
    session,
    jwtInfo,
  });
}
