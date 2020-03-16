const express = require('express');

const router = express.Router();
const csrf = require('csurf');
const multer = require('multer');
const Joi = require('joi');

const config = require('../config/config');
const validation = require('../util/validation');
const auth = require('../controllers/auth');
const authorisationMiddleware = require('../util/authorisationMiddleware');
const reverseAuthorisationMiddleware = require('../util/reverseAuthorisationMiddleware');

const { Users } = require('../models/index');

/**
 * CSRF middleware
 * @type {csrf}
 */
const csrfProtection = csrf({ cookie: true });


/**
 * Multer setttins for file transfer
 * @type {multer|undefined}
 */
const upload = multer({
  dest: config.FILE_SERVER.LOCAL_DIRECTORY,
  limits: {
    fileSize: 524288,
    fieldSize: 524288,
    files: 1,
  },
});

/**
 * @api {get} /accounts/
 * @apiName GetHomepage
 * @apiGroup Accounts
 */
router.get('/', [csrfProtection, authorisationMiddleware], async (req, res, next) => {
  try {
    const user = await Users.findOne({
      where: {
        id: req.session.userData.userId,
      },
      raw: true,
    });

    res.render('accounts/index', {
      user: { ...user },
      metadata: config.METADATA,
      currentYear: (new Date()).getFullYear(),
      csrf: req.csrfToken(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * @api {get} /accounts/login
 * @apiName GetLogin
 * @apiGroup Accounts
 */
router.get('/login', [csrfProtection, reverseAuthorisationMiddleware], (req, res) => {
  res.render('accounts/login', {
    captchaSiteKey: config.CAPTCHA_SITE_KEY,
    metadata: config.METADATA,
    currentYear: (new Date()).getFullYear(),
    csrf: req.csrfToken(),
  });
});

/**
 * @api {get} /accounts/register
 * @apiName GetRegister
 * @apiGroup Accounts
 */
router.get('/register', [csrfProtection, reverseAuthorisationMiddleware], (req, res) => {
  res.render('accounts/register', {
    captchaSiteKey: config.CAPTCHA_SITE_KEY,
    metadata: config.METADATA,
    currentYear: (new Date()).getFullYear(),
    csrf: req.csrfToken(),
  });
});


/**
 * @api {post} /accounts/login
 * @apiName TryLogin
 * @apiGroup Accounts
 *
 * @apiParam {string} req.body['email']
 * @apiParam {string} req.body['password']
 * @apiParam {string} req.body.['_csrf']
 * @apiParam {string} req.body.['g-recaptcha-response']
 */
router.post('/login', [csrfProtection, reverseAuthorisationMiddleware, validation({
  body: {
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    _csrf: Joi.string().required(),
    'g-recaptcha-response': Joi.string().required(),
  },
})], auth.login);

/**
 * @api {post} /accounts/register
 * @apiName TryRegister
 * @apiGroup Accounts
 *
 * @apiParam {string} req.body['email']
 * @apiParam {string} req.body['password']
 * @apiParam {string} req.body['repeat-password']
 * @apiParam {string} req.body.['_csrf']
 * @apiParam {string} req.body.['g-recaptcha-response']
 * @apiParam {boolean} req.body.['terms']
 * @apiParam {boolean} req.body.['newsletter']
 * @apiParam {boolean} req.body.['marketing']
 */
router.post('/register', [csrfProtection, reverseAuthorisationMiddleware, validation({
  body: {
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    'repeat-password': Joi.string().required(),
    'g-recaptcha-response': Joi.string().required(),
    _csrf: Joi.string().required(),
    terms: Joi.any().required(),
    newsletter: Joi.any().allow('').optional(),
    marketing: Joi.any().allow('').optional(),
  },
})], auth.register);

/**
 * @api {get} /accounts/logout
 * @apiName Logout
 * @apiGroup Accounts
 */
router.get('/logout', auth.logout);

/**
 * @api {post} /accounts/password
 * @apiName ChangePassword
 * @apiGroup Accounts
 *
 * @apiParam {string} req.body['current-password']
 * @apiParam {string} req.body['new-password']
 * @apiParam {string} req.body['repeat-password']
 * @apiParam {string} req.body.['_csrf']
 */
router.post('/password', [csrfProtection, authorisationMiddleware, validation({
  body: {
    'current-password': Joi.string().required(),
    'new-password': Joi.string().required(),
    'repeat-new-password': Joi.string().required(),
    _csrf: Joi.string().required(),
  },
})], auth.changePassword);

/**
 * @api {post} /accounts/data
 * @apiName ChangeUserData
 * @apiGroup Accounts
 *
 * @apiParam {string} req.body['nickname']
 * @apiParam {string} req.body.['_csrf']
 */
router.post('/data', [csrfProtection, authorisationMiddleware, validation({
  body: {
    nickname: Joi.string().required(),
    _csrf: Joi.string().required(),
  },
})], auth.changeData);

/**
 * @api {post} /accounts/avatar
 * @apiName ChangeAvatar
 * @apiGroup Accounts
 *
 * @apiParam {object} req.body['file']
 * @apiParam {string} req.query.['_csrf']
 */
router.post('/avatar', [csrfProtection, authorisationMiddleware, upload.single('avatar'), validation({
  query: {
    _csrf: Joi.string().required(),
  },
  body: {
    file: Joi.any().allow(''),
  },
})], auth.changeAvatar);

/**
 * @api {post} /accounts/email
 * @apiName ChangeEmail
 * @apiGroup Accounts
 *
 * @apiParam {string} req.body['email']
 * @apiParam {string} req.body['current-password']
 * @apiParam {string} req.query.['_csrf']
 */
router.post('/email', [csrfProtection, authorisationMiddleware, validation({
  body: {
    email: Joi.string().email().required(),
    'current-password': Joi.string().required(),
    _csrf: Joi.string().required(),
  },
})], auth.changeEmail);

/**
 * @api {post} /accounts/agreements
 * @apiName ChangeAgreements
 * @apiGroup Accounts
 *
 * @apiParam {boolean} req.body['newsletter']
 * @apiParam {boolean} req.body['marketing']
 * @apiParam {string} req.query.['_csrf']
 */
router.post('/agreements', [csrfProtection, authorisationMiddleware, validation({
  body: {
    newsletter: Joi.any().allow('').optional(),
    marketing: Joi.any().allow('').optional(),
    _csrf: Joi.string().required(),
  },
})], auth.changeAgreements);

/**
 * @api {post} /accounts/close
 * @apiName CloseAccount
 * @apiGroup Accounts
 *
 * @apiParam {string} req.body['current-password']
 * @apiParam {boolean} req.body['confirm']
 * @apiParam {string} req.query.['_csrf']
 */
router.post('/close', [csrfProtection, authorisationMiddleware, validation({
  body: {
    'current-password': Joi.string().required(),
    confirm: Joi.any().allow('').optional(),
    _csrf: Joi.string().required(),
  },
})], auth.closeAccount);

module.exports = router;
