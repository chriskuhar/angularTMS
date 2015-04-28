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
    
        templates.forEach(function(template) {
            if(typeof template.route != 'undefined') {
                var item = {};
                item.id = template._id;
                item.text = template.route;
                item.state = {"selected": false};
                htmlTopNode.children.push(item);
            }
        });
        out[0].children.push(htmlTopNode);
    
        res.json(out);
    });
});

module.exports = router;
