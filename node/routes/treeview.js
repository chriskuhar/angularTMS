var express = require('express');
var mongoose = require('mongoose');
var Template = require('../models/template');
var router = express.Router();

// Pseudo index is route
// 

/* GET users listing. */
router.get('/', function(req, res, next) {
    var success = false;
    var message = ""
    var out = [];
    var topNode = { "text": "Files",
                    "state": {"opened": true},
                    "children":[] };
    // create out[0] 
    //
    out.push(topNode);

    Template.find({}, function(err, templates) {
        // check for save error
        //
        if(err) {
            res.json(out);
            return;
        }
    
        if((typeof templates == 'undefined') || (templates == null))
        {
            res.json(out);
            return;
        }
        var htmlTopNode = { "text": "HTML",
                    "state": {"opened": true},
                    "children":[] };
    
        var cssTopNode = { "text": "CSS",
                    "state": {"opened": true},
                    "children":[] };
    
        var jsTopNode = { "text": "JavaScript",
                    "state": {"opened": true},
                    "children":[] };
    
        var jsonTopNode = { "text": "JSON",
                    "state": {"opened": true},
                    "children":[] };
    
        var imageTopNode = { "text": "Image",
                    "state": {"opened": true},
                    "children":[] };
    
        templates.forEach(function(template) {
            if(typeof template.route != 'undefined') {
                var item = {};
                item.id = template._id;
                item.text = template.route;
                item.state = {"selected": false, "opened": false};
                item.children = false;
                if(template.contenttype.toLowerCase().indexOf('text/css') == 0) {
                    cssTopNode.children.push(item);
                } else if(template.contenttype.toLowerCase().indexOf('application/javascript') == 0) {
                    jsTopNode.children.push(item);
                } else if(template.contenttype.toLowerCase().indexOf('application/json') == 0) {
                    jsonTopNode.children.push(item);
                } else if(template.contenttype.toLowerCase().indexOf('image') == 0) {
                    imageTopNode.children.push(item);
                } else {
                    htmlTopNode.children.push(item);
                }
            
            }
        });
        out[0].children.push(htmlTopNode);
        out[0].children.push(jsTopNode);
        out[0].children.push(cssTopNode);
        out[0].children.push(imageTopNode);
        out[0].children.push(jsonTopNode);
    
        res.json(out);
    });
});

module.exports = router;
