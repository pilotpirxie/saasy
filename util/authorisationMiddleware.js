const authorisationMiddleware = (req, res, next) => {
  if (req.session.userData && req.session.userData.expiresAt > Date.now()) {
    res.locals.isLogged = !!req.session.userData.userId;
    next();
  } else {
    res.redirect('/accounts/register');
  }
};

module.exports = authorisationMiddleware;
