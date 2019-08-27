const express = require('express');
const router = express.Router();
const config = require('../config/config');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const validation = require('../util/validation');
const Joi = require('joi');
const auth = require('../controllers/auth');

router.get('/', csrfProtection, (req, res) => {
  res.render('accounts/index', {metadata: config.METADATA, currentYear: (new Date).getFullYear(), csrf: req.csrfToken()});
});

router.get('/login', csrfProtection, (req, res) => {
  res.render('accounts/login', {metadata: config.METADATA, currentYear: (new Date).getFullYear(), csrf: req.csrfToken()});
});

router.get('/register', csrfProtection, (req, res) => {
  res.render('accounts/register', {metadata: config.METADATA, currentYear: (new Date).getFullYear(), csrf: req.csrfToken()});
});

router.post('/login', [csrfProtection, validation({
  body: {
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    _csrf: Joi.string().required(),
  }
})], auth.login);

module.exports = router;
