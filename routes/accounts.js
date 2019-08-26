const express = require('express');
const router = express.Router();
const config = require('../config/config');

router.get('/', (req, res) => {
  res.render('accounts/index', {metadata: config.METADATA, currentYear: (new Date).getFullYear()});
});

router.get('/login', (req, res) => {
  res.render('accounts/login', {metadata: config.METADATA, currentYear: (new Date).getFullYear()});
});

router.get('/register', (req, res) => {
  res.render('accounts/register', {metadata: config.METADATA, currentYear: (new Date).getFullYear()});
});

module.exports = router;
