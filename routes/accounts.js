const express = require('express');
const router = express.Router();
const config = require('../config/config');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true })

router.get('/', csrfProtection, (req, res) => {
  res.render('accounts/index', {metadata: config.METADATA, currentYear: (new Date).getFullYear(), csrf: req.csrfToken()});
});

router.get('/login', csrfProtection, (req, res) => {
  res.render('accounts/login', {metadata: config.METADATA, currentYear: (new Date).getFullYear(), csrf: req.csrfToken()});
});

router.get('/register', csrfProtection, (req, res) => {
  res.render('accounts/register', {metadata: config.METADATA, currentYear: (new Date).getFullYear(), csrf: req.csrfToken()});
});

module.exports = router;
