var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');

var complaintSchema = new mongoose.Schema({
    requestId: String,
    userName: String, 
    subject : String, 
    solved : Boolean,
    type : String,
    complaint : String
});



complaintSchema.plugin(timestamps);
module.exports = mongoose.model('complaintList',complaintSchema,'complaintList');
