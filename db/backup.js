var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');

var backupSchema = new mongoose.Schema({
    requestId: String,
    userName: String, 
    subject : String, 
    solved : Boolean,
    type : String,
    complaint : String
});

backupSchema.plugin(timestamps);
module.exports = mongoose.model('backupList',backupSchema,'backupList');
