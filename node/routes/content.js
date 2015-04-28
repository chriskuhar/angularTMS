var express = require('express');
var mongoose = require('mongoose');
var Template = require('../models/template');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    var success = false;
    var message = ""
    var ret = { success: success,
                message: message };

    if(typeof req.query.route != undefined) {
        Template.findOne({route: req.query.route}, function(err, template) {
            ret.template = template;
            res.json(ret);
        });
    } else {
        Template.find({}, function(err, templates) {
            // check for save error
            //
            if(err) {
                ret.message = err;
                res.json(ret);
                return;
            }

            var templates = {};

            templates.forEach(function(template) {
                templates[template.description] = template.content;

            });
            res.templates = templates;
            res.json(ret);

        });
    }
});

module.exports = router;
