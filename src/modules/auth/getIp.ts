import { Request } from "express";

export function getIp(req: Request): string {
  return (
    req.headers["x-forwarded-for"]
    || req.connection.remoteAddress
    || ""
  ).toString();
}
