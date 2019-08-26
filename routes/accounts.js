const express = require('express');
const router = express.Router();
const config = require('../config/config');

router.get('/', (req, res) => {
  res.render('accounts/index', {metadata: config.METADATA, currentYear: (new Date).getFullYear()});
});

module.exports = router;
