import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import errorResponse from "../utils/errorResponse";

const createParamsObject = (req: Request) => ({
  query: { ...req.query },
  params: { ...req.params },
  body: { ...req.body },
});

export type ValidationSchema = {
  query?: object;
  params?: object;
  body?: object;
};

const validation = (schema: ValidationSchema, redirectUrl = "") => (req: Request, res: Response, next: NextFunction) => {
  const mixedSchema = Joi.object(schema).unknown();
  const params = createParamsObject(req);
  const result = mixedSchema.validate(params);

  if (result.error) {
    console.warn(`Validation error: ${result.error.message}`);
    if (redirectUrl.length > 0) {
      return res.redirect(redirectUrl);
    }
    return errorResponse({
      response: res,
      message: `Validation error: ${result.error.message}`,
      status: 400,
      error: "ValidationError",
    });
  }
  return next();
};

export default validation;
