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
    var newVals =  {};

    // validate input
    //
    if((typeof req.body.route == "undefined") ||
        (req.body.route == null) ||
        (req.body.route.length == null)){
        ret.message = "route is a required field";
        res.json(ret);
        return;
    } else {
        newVals.route = req.body.route;
    }

    if((typeof req.body.description != 'undefined') && 
        (req.body.description != null) && 
        (req.body.description.length > 0)) {
            newVals.description = req.body.description;
    }

    if((typeof req.body.group != 'undefined') && 
        (req.body.group != null) && 
        (req.body.group.length > 0)) {
            newVals.group = req.body.group;
    }

    if((typeof req.body.contenttype != 'undefined') && 
        (req.body.contenttype != null) && 
        (req.body.contenttype.length > 0)) {
            newVals.contenttype = req.body.contenttype;
    } else {
        // so things to crash later on, we need a value
        // can change later
        //
        newVals.contenttype = 'text/html';
    }

    if((typeof req.body.content != 'undefined') && 
        (req.body.content != null) && 
        (req.body.content.length > 0)) {
            newVals.content = req.body.content;
    }
    
    if((typeof req.body.size != 'undefined') && 
        (req.body.size != null) && 
        (req.body.size.length > 0)) {
            newVals.size = req.body.size;
    }
    
    Template.findOne({route: req.body.route}, function(err, template) {

        if((typeof template == 'undefined') || (template == null)) {
            var template = new Template(newVals);
            
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
                ret.id = template._id;
            
                res.json(ret);
            });
        } else {
            ret.message = "route already exists";
            res.json(ret);
            return;
        }
    });
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
    } else {
        ret.message = "id is a required field";
        res.json(ret);
        return;
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

    if((typeof req.body.contenttype != 'undefined') && 
        (req.body.contenttype != null) && 
        (req.body.contenttype.length > 0)) {
            newVals.contenttype = req.body.contenttype;
            argCount++;
    }

    if((typeof req.body.content != 'undefined') && 
        (req.body.content != null) && 
        (req.body.content.length > 0)) {
            newVals.content = req.body.content;
            argCount++;
    }
    
    if((typeof req.body.size != 'undefined') && 
        (req.body.size != null) && 
        (req.body.size.length > 0)) {
            newVals.size = req.body.size;
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
