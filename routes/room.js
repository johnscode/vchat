const express = require('express');
const router = express.Router();
const logger = require('../logger');
const indexController = require('../controllers/indexController');

/* GET home page. */
router.get('/', indexController.index);

module.exports = router;