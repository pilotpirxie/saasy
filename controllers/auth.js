const config = require('../config/config');
const {Users, Prompts} = require('../models/index');
const UAParser = require('ua-parser-js');
const axios = require('axios');
const { generatesSalt, generateVerificationCode, encodePassword } = require('../util/helpers');

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

    await Prompts.create({
      user_id: userId,
      status: 1,
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

      if (reCaptchaResponse.data && reCaptchaResponse.data.success) {
        const userSearch = await Users.findOne({
          where: {
            email: req.body.email,
            auth_type: 0
          }
        });

        if (userSearch) {
          const user = await Users.findOne({
            where: {
              password: encodePassword(req.body.password, userSearch.salt),
            }
          });

          if (user) {
            return await createSession(userSearch.id, userSearch.email, req.get('x-forwarded-for') || req.connection.remoteAddress, 0, req, res);
          } else {
            return res.redirect('/login?info=error-invalid-credentials');
          }
        } else {
          return res.redirect('/login?info=error-invalid-credentials');
        }
      } else {
        return res.redirect('/login?info=error-invalid-captcha');
      }
    } catch (err) {
      next(err);
    }
  },

  register: async (req, res, next) => {
    if (req.body.terms) {
      if (req.body.password === req.body['repeat-password']) {
        try {
          const reCaptchaSecret = config.CAPTCHA_SECRET;
          const reCaptchaUserResponse = req.body['g-recaptcha-response'];
          const reCaptchaResponse = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${reCaptchaSecret}&response=${reCaptchaUserResponse}`, {}, {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded; charset=utf-8"
            }
          });

          console.log(reCaptchaResponse.data);

          if (reCaptchaResponse.data && reCaptchaResponse.data.success && reCaptchaResponse.data.score >= config.CAPTCHA_SCORE_THRESHOLD) {
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

              if (user) {
                return await createSession(user.id, user.email, req.headers['x-forwarded-for'] || req.connection.remoteAddress, 0, req, res);
              } else {
                return res.redirect('/register?info=error-something-wrong');
              }
            }
          } else {
            return res.redirect('/register?info=error-invalid-captcha');
          }
        } catch (err) {
          next(err);
        }
      } else {
        return res.redirect('/register?info=error-confirm-password');
      }
    } else {
      return res.redirect('/register?info=error-terms');
    }
  },

  logout: async (req, res, next) => {
    req.session = null;
    return res.redirect('/?info=logout');
  }

};
