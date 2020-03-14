function reduceParameters(parameters) {
  const newQuery = {};

  if (!parameters) {
    return newQuery;
  }
  Object.keys(parameters).forEach((param) => {
    if (Array.isArray(parameters[param]) && parameters[param].length > 1) {
      newQuery[param] = parameters[param][parameters[param].length - 1];
    } else {
      newQuery[param] = parameters[param];
    }
  });
  return parameters;
}

module.exports = (req, res, next) => {
  req.query = reduceParameters(req.query);
  req.body = reduceParameters(req.body);
  next();
};
