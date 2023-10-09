import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import errorResponse from "../../shared/utils/errorResponse";

export type UserTeamRole = "owner" | "editor" | "viewer";

// eslint-disable-next-line max-len
const verifyUserTeamRole = (prisma: PrismaClient, roles: UserTeamRole[]) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req;
    const { teamId } = req.params;

    if (!userId) {
      return errorResponse({
        response: res,
        message: "Missing userId",
        status: 400,
        error: "MissingUserId",
      });
    }

    if (!teamId) {
      return errorResponse({
        response: res,
        message: "Missing teamId",
        status: 400,
        error: "MissingTeamId",
      });
    }

    const user = await prisma.userTeam.findFirst({
      where: {
        userId,
        teamId,
      },
    });

    if (!user) {
      return errorResponse({
        response: res,
        message: "Forbidden access, user is not in the team",
        status: 403,
        error: "ForbiddenNotInTeam",
      });
    }

    if (!roles.includes(user.role)) {
      return errorResponse({
        response: res,
        message: `Forbidden access, user does not have the required role. Required one of: ${roles.join(", ")}`,
        status: 403,
        error: "ForbiddenRole",
      });
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

export default verifyUserTeamRole;
