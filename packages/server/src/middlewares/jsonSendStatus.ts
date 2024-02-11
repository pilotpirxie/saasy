import { NextFunction, Request, Response } from "express";

const EMPTY_BODY = JSON.stringify({});

export const jsonSendStatus = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  res.sendStatus = (statusCode) => res.status(statusCode)
    .type("json")
    .send(EMPTY_BODY);

  next();
};
