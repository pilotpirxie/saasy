const authorisationMiddleware = (req, res, next) => {
  if (req.session.userData && req.session.userData.expiresAt > Date.now()) {
    res.redirect('/?info=already-logged');
  } else {
    next();
  }
};

module.exports = authorisationMiddleware;
