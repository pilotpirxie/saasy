const crypto = require('crypto');

/**
 * Generate random 64 character length salt
 * @returns {string}
 */
const generatesSalt = () => crypto.randomBytes(64).toString('hex');

/**
 * Generate random 24 character length verification code
 * @returns {string}
 */
const generateVerificationCode = () => crypto.randomBytes(24).toString('hex');

/**
 * Encode password with salt as hash sha512
 * @param password
 * @returns {string}
 */
const encodePassword = (password, salt) => crypto.createHash('sha512').update(salt + password).digest('hex');

module.exports = {
  generatesSalt,
  generateVerificationCode,
  encodePassword
};
