import { NextFunction, Request, Response } from "express";
import { isAxiosError } from "axios";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (res.headersSent) {
    return next(err);
  }

  if (isAxiosError(err)) {
    console.error("AxiosError", err.response?.data);
    return res.sendStatus(424);
  }

  if (err) {
    console.error(err);
  }

  if (err.name === "PayloadTooLargeError") {
    return res.sendStatus(413);
  }

  return res.sendStatus(500);
};
