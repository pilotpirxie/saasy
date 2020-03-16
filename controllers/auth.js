const UAParser = require('ua-parser-js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const config = require('../config/config');
const { Users, Sessions } = require('../models/index');
const { generatesSalt, generateVerificationCode, encodePassword } = require('../util/helpers');
const uploadFile = require('../util/asyncFtp');

/**
 * Create session in database and redis
 * @param {string} userId
 * @param {string} email
 * @param {string} ipAddress
 * @param {number} authType
 * @param {object} req
 * @param {object} res
 * @returns {Promise<*>}
 */
async function createSession(userId, email, ipAddress, authType, req, res) {
  try {
    const {
      browser, engine, os, device,
    } = UAParser(req.headers['user-agent']);

    await Sessions.create({
      user_id: userId,
      user_agent: JSON.stringify({
        browser, engine, os, device: device.type || '',
      }),
      ip_address: ipAddress,
      auth_type: authType,
    });

    req.session.userData = {
      userId,
      email,
      auth_type: authType,
      createdAt: Date.now(),
      expiresAt: Date.now() + config.SESSION_TIMEOUT,
    };

    return res.redirect(`${config.METADATA.URL}/?info=logged`);
  } catch (err) {
    return new Error(err);
  }
}

module.exports = {

  /**
   * Try to login
   * @param req
   * @param res
   * @param next
   * @returns {Promise<void|*|Response>}
   */
  login: async (req, res, next) => {
    try {
      const reCaptchaSecret = config.CAPTCHA_SECRET;
      const reCaptchaUserResponse = req.body['g-recaptcha-response'];
      const reCaptchaResponse = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${reCaptchaSecret}&response=${reCaptchaUserResponse}`, {}, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        },
      });

      if (!(reCaptchaResponse.data
        && reCaptchaResponse.data.success
        && reCaptchaResponse.data.score >= config.CAPTCHA_SCORE_THRESHOLD)) {
        return res.redirect('/login?info=error-invalid-captcha');
      }

      const userSearch = await Users.findOne({
        where: {
          email: req.body.email,
          auth_type: 0,
        },
      });

      if (!userSearch) {
        return res.redirect('/login?info=error-invalid-credentials');
      }

      const user = await Users.findOne({
        where: {
          password: encodePassword(req.body.password, userSearch.salt),
        },
      });

      if (!user) {
        return res.redirect('/login?info=error-invalid-credentials');
      }

      return await createSession(userSearch.id, userSearch.email, req.get('x-forwarded-for') || req.connection.remoteAddress, 0, req, res);
    } catch (err) {
      return next(err);
    }
  },

  /**
   * Try to register
   * @param req
   * @param res
   * @param next
   * @returns {Promise<void|*|Response>}
   */
  register: async (req, res, next) => {
    if (!req.body.terms) {
      return res.redirect('/register?info=error-terms');
    }

    if (!(req.body.password === req.body['repeat-password'] && req.body.password.length >= 8)) {
      return res.redirect('/register?info=error-confirm-password');
    }

    try {
      const reCaptchaSecret = config.CAPTCHA_SECRET;
      const reCaptchaUserResponse = req.body['g-recaptcha-response'];
      const reCaptchaResponse = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${reCaptchaSecret}&response=${reCaptchaUserResponse}`, {}, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        },
      });

      if (!(reCaptchaResponse.data
        && reCaptchaResponse.data.success
        && reCaptchaResponse.data.score >= config.CAPTCHA_SCORE_THRESHOLD)) {
        return res.redirect('/register?info=error-invalid-captcha');
      }

      const userSearch = await Users.findOne({
        where: {
          email: req.body.email,
          auth_type: 0,
        },
      });

      if (userSearch) {
        return res.redirect('/login?info=error-user-already-exists');
      }

      const salt = generatesSalt();
      const verificationCode = generateVerificationCode();

      const user = await Users.create({
        nickname: req.body.email.split('@')[0],
        email: req.body.email,
        password: encodePassword(req.body.password, salt),
        auth_type: 0,
        avatar_url: `${config.FILE_SERVER.PUBLIC_URL}/avatar_default.png`,
        salt,
        activation_key: verificationCode,
        verified: config.INITIALLY_VERIFIED ? 1 : 0,
        blocked: config.INITIALLY_BLOCKED ? 1 : 0,
        newsletter: req.body.newsletter ? 1 : 0,
        marketing: req.body.marketing ? 1 : 0,
        ip_address: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      });

      if (!user) {
        return res.redirect('/register?info=error-something-wrong');
      }

      const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      return await createSession(user.id, user.email, ipAddress, 0, req, res);
    } catch (err) {
      return next(err);
    }
  },

  /**
   * Remove session
   * @param req
   * @param res
   * @returns {Promise<void|*|Response>}
   */
  logout: async (req, res) => {
    req.session = null;
    return res.redirect('/?info=logout');
  },

  /**
   * Change user password
   * @param req
   * @param res
   * @param next
   * @returns {Promise<void|*|Response>}
   */
  changePassword: async (req, res, next) => {
    try {
      if (!(req.body['new-password'] === req.body['repeat-new-password'] && req.body['new-password'].length >= 8)) {
        return res.redirect('/accounts?info=error-confirm-password');
      }

      const userSearch = await Users.findOne({
        attributes: ['salt'],
        where: {
          id: req.session.userData.userId,
        },
      });

      if (!userSearch) {
        return res.redirect('/accounts?info=error-invalid-credentials');
      }

      const user = await Users.findOne({
        attributes: ['salt'],
        where: {
          password: encodePassword(req.body['current-password'], userSearch.salt),
        },
      });

      if (!user) {
        return res.redirect('/accounts?info=error-invalid-credentials');
      }

      const updatedUser = Users.update({
        password: encodePassword(req.body['new-password'], user.salt),
      }, {
        where: {
          id: req.session.userData.userId,
          password: encodePassword(req.body['current-password'], user.salt),
        },
      });

      if (!updatedUser) {
        return res.redirect('/accounts?info=error-something-wrong');
      }

      return res.redirect('/accounts?info=updated');
    } catch (err) {
      return next(err);
    }
  },

  /**
   * Change user data
   * @param req
   * @param res
   * @param next
   * @returns {void|*|Response}
   */
  changeData: (req, res, next) => {
    try {
      const updatedUser = Users.update({
        nickname: req.body.nickname,
      }, {
        where: {
          id: req.session.userData.userId,
        },
      });

      if (!updatedUser) {
        return res.redirect('/accounts?info=error-something-wrong');
      }

      return res.redirect('/accounts?info=updated');
    } catch (err) {
      return next(err);
    }
  },

  /**
   * Change user email
   * @param req
   * @param res
   * @param next
   * @returns {Promise<void|*|Response>}
   */
  changeEmail: async (req, res, next) => {
    try {
      const userSearch = await Users.findOne({
        attributes: ['salt'],
        where: {
          id: req.session.userData.userId,
        },
      });

      if (!userSearch) {
        return res.redirect('/accounts?info=error-invalid-credentials');
      }

      const user = await Users.findOne({
        attributes: ['salt'],
        where: {
          password: encodePassword(req.body['current-password'], userSearch.salt),
        },
      });

      if (!user) {
        return res.redirect('/accounts?info=error-invalid-credentials');
      }

      const updatedUser = Users.update({
        email: req.body.email,
        verified: config.INITIALLY_VERIFIED,
      }, {
        where: {
          id: req.session.userData.userId,
          password: encodePassword(req.body['current-password'], user.salt),
        },
      });

      if (!updatedUser) {
        return res.redirect('/accounts?info=error-something-wrong');
      }

      return res.redirect('/accounts/logout');
    } catch (err) {
      return next(err);
    }
  },

  /**
   * Change user agreements
   * @param req
   * @param res
   * @param next
   * @returns {void|*|Response}
   */
  changeAgreements: (req, res, next) => {
    try {
      const updatedUser = Users.update({
        newsletter: req.body.newsletter ? 1 : 0,
        marketing: req.body.marketing ? 1 : 0,
      }, {
        where: {
          id: req.session.userData.userId,
        },
      });

      if (!updatedUser) {
        return res.redirect('/accounts?info=error-something-wrong');
      }

      return res.redirect('/accounts?info=updated');
    } catch (err) {
      return next(err);
    }
  },

  /**
   * Close user account
   * @param req
   * @param res
   * @param next
   * @returns {Promise<void|*|Response>}
   */
  closeAccount: async (req, res, next) => {
    try {
      const userSearch = await Users.findOne({
        attributes: ['salt'],
        where: {
          id: req.session.userData.userId,
        },
      });

      if (!userSearch) {
        return res.redirect('/accounts?info=error-invalid-credentials');
      }

      const user = await Users.findOne({
        attributes: ['salt'],
        where: {
          password: encodePassword(req.body['current-password'], userSearch.salt),
        },
      });

      if (!user) {
        return res.redirect('/accounts?info=error-invalid-credentials');
      }

      if (!req.body.confirm) {
        return res.redirect('/accounts?info=error-not-confirmed');
      }

      const destroyed = Users.destroy({
        where: {
          id: req.session.userData.userId,
          password: encodePassword(req.body['current-password'], user.salt),
        },
      });

      if (!destroyed) {
        return res.redirect('/accounts?info=error-something-wrong');
      }

      return res.redirect('/accounts/logout');
    } catch (err) {
      return next(err);
    }
  },

  /**
   * Change user avatar
   * @param req
   * @param res
   * @param next
   * @returns {Promise<void|*|Response|null>}
   */
  changeAvatar: async (req, res, next) => {
    try {
      if (!req.file) {
        return res.redirect('/accounts?info=error-something-wrong');
      }

      const extension = path.extname(req.file.originalname);
      const newFilename = `${req.file.filename}${extension}`;
      const newLocalFilePath = `${req.file.path}${extension}`;

      fs.rename(req.file.path, newLocalFilePath, async (err) => {
        if (err) return next(err);

        const fileName = `${crypto.createHmac('sha256', config.HMAC_SECRET)
          .update(`avatar_${req.session.userData.userId}`)
          .digest('hex')}x${req.session.userData.userId}`;

        let avatarUrl;
        if (config.FILE_SERVER.REMOTE_FTP_UPLOAD) {
          const file = await uploadFile(newLocalFilePath, fileName, {
            host: config.FILE_SERVER.HOST,
            port: config.FILE_SERVER.PORT,
            secure: config.FILE_SERVER.SECURE,
            user: config.FILE_SERVER.USER,
            password: config.FILE_SERVER.PASS,
            destinationDirectory: config.FILE_SERVER.REMOTE_DIRECTORY,
            publicUrl: config.FILE_SERVER.PUBLIC_URL,
          });

          fs.unlink(newLocalFilePath, (err2) => {
            if (err2) next(err2);
          });

          avatarUrl = file.url;
        } else {
          avatarUrl = `${config.FILE_SERVER.PUBLIC_URL}${newFilename}`;
        }
        const updatedUser = Users.update({
          avatar_url: avatarUrl,
        }, {
          where: {
            id: req.session.userData.userId,
          },
        });

        if (!updatedUser) {
          return res.redirect('/accounts?info=error-something-wrong');
        }

        return res.redirect('/accounts?info=updated');
      });
      return null;
    } catch (err) {
      return next(err);
    }
  },
};
