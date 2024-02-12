import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import errorResponse from "../utils/errorResponse";

export type UserTeamRole = "owner" | "editor" | "viewer";

// eslint-disable-next-line max-len
const verifyUserProjectRole = (prisma: PrismaClient, roles: UserTeamRole[]) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req;
    const { projectId } = req.params;

    if (!userId) {
      return errorResponse({
        response: res,
        message: "Missing userId",
        status: 400,
        error: "MissingUserId",
      });
    }

    if (!projectId) {
      return errorResponse({
        response: res,
        message: "Missing projectId",
        status: 400,
        error: "MissingProjectId",
      });
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
      },
      select: {
        team: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!project) {
      return errorResponse({
        response: res,
        message: "Project not found",
        status: 404,
        error: "ProjectNotFound",
      });
    }

    const user = await prisma.userTeam.findFirst({
      where: {
        userId,
        teamId: project?.team.id,
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

export default verifyUserProjectRole;
