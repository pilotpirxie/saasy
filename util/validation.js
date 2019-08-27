const Joi = require('joi');

const DEFAULT_SCHEMA_OBJECT = {};

const validation = function (schema) {
  return function (req, res, next) {
    let _schema = Joi.object(Object.assign({}, DEFAULT_SCHEMA_OBJECT, schema)).unknown();
    let params = createParamsObject(req);
    let result = Joi.validate(params, _schema);

    if (result.error) {
      console.warn('Blocked request from ' + result.error);
      return res.status(400).json({
        error: `Validation error: ${result.error}`
      });
    } else {
      next();
    }
  };
};

const createParamsObject = function (req) {
  return {
    query: { ...req.query },
    params: { ...req.params },
    body: { ...req.body },
  };
};

module.exports = validation;
