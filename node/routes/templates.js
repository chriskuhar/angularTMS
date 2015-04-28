var express = require('express');
var mongoose = require('mongoose');
var Template = require('../models/template');
var router = express.Router();

// Pseudo index is route
// 

/* GET users listing. */
router.get('/', function(req, res, next) {
    var success = false;
    var message = "";
    var ret = { success: success,
                message: message };

    // if route is not defined, list all templates
    //
    if((typeof req.query.route != "undefined") ||
        (typeof req.query.id != "undefined")) {

            // Build query, we only need one
            // TODO: get rid of route, ID is best to
            // deal with
        var query = {};
        if(typeof req.query.route != "undefined") {
            query.route = req.query.route
        } else if (typeof req.query.id != "undefined") {
            query._id = req.query.id;
        }

        Template.findOne(query, function(err, template) {
            if((template == null ) || (typeof template == 'undefined')) {
                res.send("<pre>Template not found for route \"" + req.query.route + "\"</pre>");
            } else {
                var content = "";

                if((template.content != null) && 
                    (template.content != 'undefined') &&
                    (template.content.length > 0)) {
                    content = new Buffer(template.content, 'base64');
                }

                // for HTML data
                //
                //res.contentType('text/html');
                //res.send(content);

                res.json(template);
                return;
            }
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

            if((typeof templates == 'undefined') || (templates == null))
            {
                ret.message = "no templates found";
                res.json(ret);
                return;
            }

            ret.templates = [];
            ret.success = true;

            templates.forEach(function(template) {
                if(typeof template.route != 'undefined') {
                    ret.templates.push(template);
                }
            });

            res.json(ret);

        });
    }
});

router.delete('/', function(req, res, next) {
    var success = false;
    var message = "";
    var ret = { success: success,
                message: message };

    // if route is not defined, list all templates
    //
    if((typeof req.query.id == "undefined") ||
        (req.query.id == "0") ||
        (req.query.id.length == 0))
    {
        ret.message = "id is required field";
        res.json(ret);
        return;
    }

    var query = {'_id': req.query.id};
    
    Template.findOne(query, function(err, template) {
        template.remove(function(err, template) {
            // check for save error
            //
            if(err) {
                ret.message = err;
            } else {
                ret.success = true;
            }

            res.json(ret);
        });
    });
});

router.post('/', function(req, res, next) {
    var success = false;
    var message = ""
    var ret = { success: success,
                message: message };

    // validate input
    //
    if(typeof req.body.route == "undefined") {
        ret.message = "route required";
    } else if(typeof req.body.description == "undefined") {
        ret.message = "description required";
    } else if(typeof req.body.group == "undefined") {
        ret.message = "group required";
    } else if(typeof req.body.content == "undefined") {
        ret.message = "content required";
    }

    // any input error return error
    
    if(ret.message.length > 0) {
        res.json(ret);
        return;
    }

    if(typeof req.body.route != "undefined") {
        //
        // build save object
        //
        var template = new Template({
            route: req.body.route,
            description: req.body.route,
            group: req.body.group,
            content: req.body.content
        });
        
        // save to DB
        //
        template.save(function(err, template) {
        
            // check for save error
            //
            if(err) {
                ret.message = err;
            } else {
                ret.success = true;
            }
        
            res.json(ret);
        });
    } 
});

router.put('/', function(req, res, next) {
    var success = false;
    var message = ""
    var ret = { success: success,
                message: message };
    var argCount = 0;

    var newVals =  {};

    if((typeof req.body.id != 'undefined') && 
        (req.body.id != null) && 
        (req.body.id.length > 0)) {
            newVals._id = req.body.id;
            argCount++;
    }
        
    if((typeof req.body.route != 'undefined') && 
        (req.body.route != null) && 
        (req.body.route.length > 0)) {
            newVals.route = req.body.route;
            argCount++;
    }
        
    if((typeof req.body.description != 'undefined') && 
        (req.body.description != null) && 
        (req.body.description.length > 0)) {
            newVals.description = req.body.description;
            argCount++;
    }

    if((typeof req.body.group != 'undefined') && 
        (req.body.group != null) && 
        (req.body.group.length > 0)) {
            newVals.group = req.body.group;
            argCount++;
    }

    if((typeof req.body.content != 'undefined') && 
        (req.body.content != null) && 
        (req.body.content.length > 0)) {
            newVals.content = req.body.content;
            argCount++;
    }
    
    // any input error return error
    //
    if(argCount == 0) {
        ret.message = "at least one argument is required, route, description, group or content";
        res.json(ret);
        return;
    }

    Template.findOne({_id: req.body.id}, function(err, template) {
        // template null, we could not find it
        //
        if ((typeof template == 'undefined') || 
            (template == null)) {
                ret.message = "template not found for route: " + req.body.route;
                res.json(ret);
                return;
            }
        // build save object
        //
    
        for (var attr in newVals) {
            template[attr] = newVals[attr];
        }
    
        // save to DB
        //
        template.save(function(err, template) {

            // check for save error
            //
            if(err) {
                ret.message = err;
            } else {
                ret.success = true;
            }

            res.json(ret);
        });
    });
});

module.exports = router;
