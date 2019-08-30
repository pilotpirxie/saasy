const express = require('express');
const router = express.Router();
const config = require('../config/config');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const validation = require('../util/validation');
const Joi = require('joi');
const auth = require('../controllers/auth');
const authorisationMiddleware = require('../util/authorisationMiddleware');
const reverseAuthorisationMiddleware = require('../util/reverseAuthorisationMiddleware');

router.get('/', [csrfProtection, authorisationMiddleware], (req, res) => {
  res.render('accounts/index', {metadata: config.METADATA, currentYear: (new Date).getFullYear(), csrf: req.csrfToken()});
});

router.get('/login', [csrfProtection, reverseAuthorisationMiddleware], (req, res) => {
  res.render('accounts/login', {metadata: config.METADATA, currentYear: (new Date).getFullYear(), csrf: req.csrfToken()});
});

router.get('/register', [csrfProtection, reverseAuthorisationMiddleware], (req, res) => {
  res.render('accounts/register', {metadata: config.METADATA, currentYear: (new Date).getFullYear(), csrf: req.csrfToken()});
});

router.post('/login', [csrfProtection, reverseAuthorisationMiddleware, validation({
  body: {
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    _csrf: Joi.string().required()
  }
})], auth.login);

router.post('/register', [csrfProtection, reverseAuthorisationMiddleware, validation({
  body: {
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    'repeat-password': Joi.string().required(),
    _csrf: Joi.string().required(),
    terms: Joi.any().required(),
    newsletter: Joi.any().allow('').optional(),
    marketing: Joi.any().allow('').optional()
  }
})], auth.register);

router.get('/logout', auth.logout);

module.exports = router;
