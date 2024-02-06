import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import errorResponse from "../utils/errorResponse";

const jwtVerify = (jwtSecret: string) => (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers.authorization) {
    return errorResponse({
      response: res,
      message: "Missing authorization header",
      status: 400,
      error: "MissingAuthorizationHeader",
    });
  }

  if (req.headers.authorization.split(" ")[0] !== "Bearer") {
    return errorResponse({
      response: res,
      message: "Invalid authorization header",
      status: 400,
      error: "InvalidAuthorizationHeader",
    });
  }

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return errorResponse({
      response: res,
      message: "Missing token",
      status: 401,
      error: "Unauthorized",
    });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    if (!decoded || typeof decoded !== "object" || !decoded.sub) {
      return errorResponse({
        response: res,
        message: "Invalid token",
        status: 401,
        error: "Unauthorized",
      });
    }
    req.userId = decoded.sub;
    return next();
  } catch (err) {
    return errorResponse({
      response: res,
      message: "Invalid token",
      status: 401,
      error: "Unauthorized",
    });
  }
};

export default jwtVerify;
