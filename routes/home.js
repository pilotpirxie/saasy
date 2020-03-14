const express = require('express');

const router = express.Router();

/**
 * @api {get} /
 * @apiName GetHome
 * @apiGroup Home
 */
router.get('/', (req, res) => {
  res.render('index');
});

module.exports = router;
