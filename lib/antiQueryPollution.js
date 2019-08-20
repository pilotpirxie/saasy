function reduceParameters (parameters) {
  let newQuery = {};
  for (let param in parameters) {
    if (Array.isArray(parameters[param]) && parameters[param].length > 1) {
      newQuery[param] = parameters[param][parameters[param].length-1];
    } else {
      newQuery[param] = parameters[param];
    }
  }
  return newQuery;
}

module.exports = (req, res, next) => {
  req.query = reduceParameters(req.query);
  req.body = reduceParameters(req.body);
  next();
};