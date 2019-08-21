module.exports = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  if (err) {
    console.error(err.stack);
    res.status(500).render('errors/error500');
  }
};
