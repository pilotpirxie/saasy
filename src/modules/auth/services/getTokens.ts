import jwt from "jsonwebtoken";
import { JwtInfo } from "../model/jwtInfo";

export function getTokens({
  userId,
  jwtInfo,
  session,
}: {
  userId: string;
  session: {
    id: string;
    refresh_token: string;
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
    session.refresh_token,
    {
      expiresIn: jwtInfo.refreshTokenTimeout,
    },
  );

  return { jwtToken, jwtRefreshToken };
}
