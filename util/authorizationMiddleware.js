const authorizationMiddleware = (req, res, next) => {
  if (req.session.userData && req.session.userData.createdAt + (480 * 60 * 1000) > Date.now()) {
    next();
  } else {
    res.redirect('/register');
  }
};

module.exports = authorizationMiddleware;