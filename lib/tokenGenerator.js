const crypto = require('crypto');

module.exports = {
  secretToken: () => {
    return crypto.createHash('sha256').update(Date.now().toString(), 'utf8').digest('hex');
  },
  publicToken: () => {
    return crypto.createHash('sha256').update((Math.random() * Date.now()).toString(), 'utf8').digest('hex');
  }
};