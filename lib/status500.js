module.exports = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  if (err) {
    // eslint-disable-next-line no-console
    console.error(err.stack);
    return res.status(500).render('errors/error500');
  }
  return res.status(500).json({ error: true, msg: 'Something went totally wrong. Try again later.' });
};
