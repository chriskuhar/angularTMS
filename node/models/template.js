var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Template = new Schema({
    description: String,
    group: String,
    route: String,
    contenttype: String,
    content: String,
    size: String
});

module.exports = mongoose.model('templates', Template);
