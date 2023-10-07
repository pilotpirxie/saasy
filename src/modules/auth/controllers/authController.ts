import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { JwtInfo } from "../model/jwtInfo";
import { login } from "../routes/login";
import { refresh } from "../routes/refresh";
import { logout } from "../routes/logout";
import { register } from "../routes/register";

export default function getAuthController({
  config,
  prisma,
}: {
  config: {
    jwtInfo: JwtInfo;
  };
  prisma: PrismaClient;
}): Router {
  const router = Router();

  router.use("/login", login({ prisma, config }));

  router.use("/refresh", refresh({ prisma, config }));

  router.use("/logout", logout({ prisma }));

  router.post("/register", register({ prisma, config }));

  return router;
}
