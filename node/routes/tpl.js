var express = require('express');
var mongoose = require('mongoose');
var Template = require('../models/template');
var router = express.Router();

// Pseudo index is route
// 

/* GET users listing. */
router.get('/', function(req, res, next) {
    var success = false;
    var content = "";
    var url_regexp = /^(\/tpl\/)(.*)$/i;

    var result = url_regexp.exec(req.originalUrl);

    content = "<pre>Route: Cannot find route </pre>";

    if(typeof result[2] != 'undefined') {
        var route = result[2];
        route = route.replace(/\/$/, '');
        res.contentType('text/html');

            // Build query, we only need one
            // TODO: get rid of route, ID is best to
            // deal with
        var query = {};
            query.route = route

        Template.findOne(query, function(err, template) {
            if((template == null ) || (typeof template == 'undefined')) {
                res.send("<pre>Template not found for route \"" + route + "\"</pre>");
            } else {

                if((template.content != null) && 
                    (template.content != 'undefined') &&
                    (template.content.length > 0)) {
                    content = new Buffer(template.content, 'base64');
                }

                // for HTML data
                //
                res.contentType('text/html');
                res.send(content);

            }
        });
    } else {
        content = "<pre>No Content found for route</pre>";
        res.contentType('text/html');
        res.send(content);
    }
});

module.exports = router;
