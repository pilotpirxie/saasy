const Joi = require('joi');

const DEFAULT_SCHEMA_OBJECT = {};

const createParamsObject = (req) => ({
  query: { ...req.query },
  params: { ...req.params },
  body: { ...req.body },
});

const validation = (schema) => (req, res, next) => {
  const mixedSchema = Joi.object({ ...DEFAULT_SCHEMA_OBJECT, ...schema }).unknown();
  const params = createParamsObject(req);
  const result = Joi.validate(params, mixedSchema);

  if (result.error) {
    // eslint-disable-next-line no-console
    console.warn(`Blocked request from ${result.error}`);
    return res.status(400).json({
      error: `Validation error: ${result.error}`,
    });
  }
  return next();
};

module.exports = validation;
