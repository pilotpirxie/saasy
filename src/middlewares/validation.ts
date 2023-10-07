import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';

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

const validation = (schema: ValidationSchema, redirectUrl = '') => (req: Request, res: Response, next: NextFunction) => {
  const mixedSchema = Joi.object(schema).unknown();
  const params = createParamsObject(req);
  const result = mixedSchema.validate(params);

  if (result.error) {
    // eslint-disable-next-line no-console
    console.warn(`Validation error: ${result.error.message}`);
    if (redirectUrl.length > 0) {
      return res.redirect(redirectUrl);
    }
    return res.status(400).json({
      error: `Validation error: ${result.error.message}`,
    });
  }
  return next();
};

export default validation;
