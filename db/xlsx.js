var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');

var xlsxSchema = new mongoose.Schema({
    path : String
});

xlsxSchema.plugin(timestamps);
module.exports = mongoose.model('xlsxList',xlsxSchema,'xlsxList');
