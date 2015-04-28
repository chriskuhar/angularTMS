var express = require('express');
var mongoose = require('mongoose');
var Template = require('../models/template');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.sendFile(__dirname + '/views/editor.html')
});

module.exports = router;
