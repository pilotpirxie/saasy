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
const multer  = require('multer');
const upload = multer({
  dest: config.FILE_SERVER.LOCAL_DIRECTORY,
  limits: {
    fileSize: 524288,
    fieldSize: 524288,
    files: 1
  }
});

router.get('/', [csrfProtection, authorisationMiddleware], (req, res) => {
  res.render('accounts/index', {metadata: config.METADATA, currentYear: (new Date).getFullYear(), csrf: req.csrfToken()});
});

router.get('/login', [csrfProtection, reverseAuthorisationMiddleware], (req, res) => {
  res.render('accounts/login', {captchaSiteKey: config.CAPTCHA_SITE_KEY, metadata: config.METADATA, currentYear: (new Date).getFullYear(), csrf: req.csrfToken()});
});

router.get('/register', [csrfProtection, reverseAuthorisationMiddleware], (req, res) => {
  res.render('accounts/register', {captchaSiteKey: config.CAPTCHA_SITE_KEY, metadata: config.METADATA, currentYear: (new Date).getFullYear(), csrf: req.csrfToken()});
});

router.post('/login', [csrfProtection, reverseAuthorisationMiddleware, validation({
  body: {
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    _csrf: Joi.string().required(),
    'g-recaptcha-response': Joi.string().required()
  }
})], auth.login);

router.post('/register', [csrfProtection, reverseAuthorisationMiddleware, validation({
  body: {
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    'repeat-password': Joi.string().required(),
    'g-recaptcha-response': Joi.string().required(),
    _csrf: Joi.string().required(),
    terms: Joi.any().required(),
    newsletter: Joi.any().allow('').optional(),
    marketing: Joi.any().allow('').optional()
  }
})], auth.register);

router.get('/logout', auth.logout);

router.post('/password', [csrfProtection, authorisationMiddleware, validation({
  body: {
    'current-password': Joi.string().required(),
    'new-password': Joi.string().required(),
    'repeat-new-password': Joi.string().required(),
    _csrf: Joi.string().required(),
  }
})], auth.changePassword);

router.post('/data', [csrfProtection, authorisationMiddleware, validation({
  body: {
    nickname: Joi.string().required(),
    _csrf: Joi.string().required(),
  }
})], auth.changeData);

router.post('/avatar', [csrfProtection, authorisationMiddleware, upload.single('avatar'), validation({
  query: {
    _csrf: Joi.string().required()
  }
})], auth.changeAvatar);

router.post('/email', [csrfProtection, authorisationMiddleware, validation({
  body: {
    email: Joi.string().email().required(),
    'current-password': Joi.string().required(),
    _csrf: Joi.string().required()
  }
})], auth.changeEmail);

router.post('/agreements', [csrfProtection, authorisationMiddleware, validation({
  body: {
    newsletter: Joi.any().allow('').optional(),
    marketing: Joi.any().allow('').optional(),
    _csrf: Joi.string().required()
  }
})], auth.changeAgreements);

router.post('/close', [csrfProtection, authorisationMiddleware, validation({
  body: {
    'current-password': Joi.string().required(),
    confirm: Joi.any().allow('').optional(),
    _csrf: Joi.string().required()
  }
})], auth.closeAccount);

module.exports = router;
