const authorisationMiddleware = (req, res, next) => {
  if (req.session.userData && req.session.userData.expiresAt > Date.now()) {
    next();
  } else {
    res.redirect('/accounts/register');
  }
};

module.exports = authorisationMiddleware;
