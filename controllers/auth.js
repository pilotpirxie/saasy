const config = require('../config/config');
const {Users, Sessions} = require('../models/index');
const UAParser = require('ua-parser-js');
const axios = require('axios');
const {generatesSalt, generateVerificationCode, encodePassword} = require('../util/helpers');
const uploadFile = require('../util/asyncFtp');
const fs = require('fs');
const path = require('path');

/**
 * Create session in database and redis
 * @param {string} userId
 * @param {string} email
 * @param {string} ipAddress
 * @param {string} origin
 * @param {object} req
 * @returns {Promise<*>}
 */
async function createSession(userId, email, ipAddress, authType, req, res) {
  try {
    const {browser, engine, os, device} = UAParser(req.headers['user-agent']);

    await Sessions.create({
      user_id: userId,
      user_agent: JSON.stringify({browser, engine, os, device: device.type || ''}),
      ip_address: ipAddress,
      auth_type: authType
    });

    req.session.userData = {
      userId: userId,
      email: email,
      auth_type: authType,
      createdAt: Date.now(),
      expiresAt: Date.now() + config.SESSION_TIMEOUT
    };

    return res.redirect(`${config.METADATA.URL}/?info=logged`);
  } catch (err) {
    return new Error(err);
  }
}

module.exports = {

  login: async (req, res, next) => {
    try {
      const reCaptchaSecret = config.CAPTCHA_SECRET;
      const reCaptchaUserResponse = req.body['g-recaptcha-response'];
      const reCaptchaResponse = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${reCaptchaSecret}&response=${reCaptchaUserResponse}`, {}, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
        }
      });

      if (!(reCaptchaResponse.data && reCaptchaResponse.data.success && reCaptchaResponse.data.score >= config.CAPTCHA_SCORE_THRESHOLD)) {
        return res.redirect('/login?info=error-invalid-captcha');
      }

      const userSearch = await Users.findOne({
        where: {
          email: req.body.email,
          auth_type: 0
        }
      });

      if (!userSearch) {
        return res.redirect('/login?info=error-invalid-credentials');
      }

      const user = await Users.findOne({
        where: {
          password: encodePassword(req.body.password, userSearch.salt),
        }
      });

      if (!user) {
        return res.redirect('/login?info=error-invalid-credentials');
      }

      return await createSession(userSearch.id, userSearch.email, req.get('x-forwarded-for') || req.connection.remoteAddress, 0, req, res);

    } catch (err) {
      next(err);
    }
  },

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
          "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
        }
      });

      if (!(reCaptchaResponse.data && reCaptchaResponse.data.success && reCaptchaResponse.data.score >= config.CAPTCHA_SCORE_THRESHOLD)) {
        return res.redirect('/register?info=error-invalid-captcha');
      }

      const userSearch = await Users.findOne({
        where: {
          email: req.body.email,
          auth_type: 0
        }
      });

      if (userSearch) {
        return res.redirect('/login?info=error-user-already-exists');
      } else {

        const salt = generatesSalt();
        const verificationCode = generateVerificationCode();

        const user = await Users.create({
          nickname: req.body.email.split('@')[0],
          email: req.body.email,
          password: encodePassword(req.body.password, salt),
          auth_type: 0,
          avatar_url: '',
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

        return await createSession(user.id, user.email, req.headers['x-forwarded-for'] || req.connection.remoteAddress, 0, req, res);
      }
    } catch (err) {
      next(err);
    }
  },

  logout: async (req, res, next) => {
    req.session = null;
    return res.redirect('/?info=logout');
  },

  changePassword: async (req, res, next) => {
    try {
      if (!(req.body['new-password'] === req.body['repeat-new-password'] && req.body['new-password'].length >= 8)) {
        return res.redirect('/accounts?info=error-confirm-password');
      }

      const userSearch = await Users.findOne({
        attributes: ['salt'],
        where: {
          id: req.session.userData.userId,
        }
      });

      if (!userSearch) {
        return res.redirect('/accounts?info=error-invalid-credentials');
      }

      const user = await Users.findOne({
        attributes: ['salt'],
        where: {
          password: encodePassword(req.body['current-password'], userSearch.salt),
        }
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
        }
      });

      if (!updatedUser) {
        return res.redirect('/accounts?info=error-something-wrong');
      }

      return res.redirect('/accounts?info=updated');
    } catch (err) {
      next(err);
    }
  },

  changeData: (req, res, next) => {
    try {
      const updatedUser = Users.update({
        nickname: req.body['nickname']
      }, {
        where: {
          id: req.session.userData.userId,
        }
      });

      if (!updatedUser) {
        return res.redirect('/accounts?info=error-something-wrong');
      }

      return res.redirect('/accounts?info=updated');
    } catch (err) {
      next(err);
    }
  },

  changeEmail: async (req, res, next) => {
    try {
      const userSearch = await Users.findOne({
        attributes: ['salt'],
        where: {
          id: req.session.userData.userId,
        }
      });

      if (!userSearch) {
        return res.redirect('/accounts?info=error-invalid-credentials');
      }

      const user = await Users.findOne({
        attributes: ['salt'],
        where: {
          password: encodePassword(req.body['current-password'], userSearch.salt),
        }
      });

      if (!user) {
        return res.redirect('/accounts?info=error-invalid-credentials');
      }

      const updatedUser = Users.update({
        email: req.body.email,
        verified: config.INITIALLY_VERIFIED
      }, {
        where: {
          id: req.session.userData.userId,
          password: encodePassword(req.body['current-password'], user.salt),
        }
      });

      if (!updatedUser) {
        return res.redirect('/accounts?info=error-something-wrong');
      }

      return res.redirect('/accounts/logout');
    } catch (err) {
      next(err);
    }
  },

  changeAgreements: (req, res, next) => {
    try {
      const updatedUser = Users.update({
        newsletter: req.body.newsletter ? 1 : 0,
        marketing: req.body.marketing ? 1 : 0,
      }, {
        where: {
          id: req.session.userData.userId,
        }
      });

      if (!updatedUser) {
        return res.redirect('/accounts?info=error-something-wrong');
      }

      return res.redirect('/accounts?info=updated');
    } catch (err) {
      next(err);
    }
  },

  closeAccount: async (req, res, next) => {
    try {
      const userSearch = await Users.findOne({
        attributes: ['salt'],
        where: {
          id: req.session.userData.userId,
        }
      });

      if (!userSearch) {
        return res.redirect('/accounts?info=error-invalid-credentials');
      }

      const user = await Users.findOne({
        attributes: ['salt'],
        where: {
          password: encodePassword(req.body['current-password'], userSearch.salt),
        }
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
        }
      });

      if (!destroyed) {
        return res.redirect('/accounts?info=error-something-wrong');
      }

      return res.redirect('/accounts/logout');
    } catch (err) {
      next(err);
    }
  },

  changeAvatar: async (req, res, next) => {
    try {
      if (!req.file) {
        return res.redirect('/accounts?info=error-something-wrong');
      }

      const extension = path.extname(req.file.originalname);
      const newFilename = `${req.file.filename}${extension}`;
      const newLocalFilePath = `${req.file.path}${extension}`;

      fs.rename(req.file.path, newLocalFilePath, async (err) => {
        if (err) next(err);

        let avatarUrl;
        if (config.FILE_SERVER.REMOTE_FTP_UPLOAD) {
          const file = await uploadFile(newLocalFilePath, undefined, {
            host: config.FILE_SERVER.HOST,
            port: config.FILE_SERVER.PORT,
            secure: config.FILE_SERVER.SECURE,
            user: config.FILE_SERVER.USER,
            password: config.FILE_SERVER.PASS,
            destinationDirectory: config.FILE_SERVER.REMOTE_DIRECTORY,
            publicUrl: config.FILE_SERVER.PUBLIC_URL
          });

          fs.unlink(newLocalFilePath, (err) => {
            if (err) next(err);
          });

          avatarUrl = file.url;
        } else {
          avatarUrl = `${config.FILE_SERVER.PUBLIC_URL}${newFilename}`;
        }

        const updatedUser = Users.update({
          avatar_url: avatarUrl
        }, {
          where: {
            id: req.session.userData.userId,
          }
        });

        if (!updatedUser) {
          return res.redirect('/accounts?info=error-something-wrong');
        }

        return res.redirect('/accounts?info=updated');
      });


    } catch (err) {
      next(err);
    }
  }
};
