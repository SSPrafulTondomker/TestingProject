var mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');

var profileSchema = new mongoose.Schema({
    username: String, 
    firstname : String,
    address : String, 
    gender : String,
    interest : {type : Array , "default" : []},
    consent : {type : Array , "default" : []},
    records : {type : Array , "default" : []},
    inday : {type : Array , "default" : []},
    intime : {type : Array , "default" : []},
    outday : {type : Array , "default" : []},
    outtime : {type : Array , "default" : []},
    in : {type : Boolean , "default" : false},
    out : {type : Boolean , "default" : false},
    blood : {type : String, "default" : "A+"},
    disease : Boolean,
    medication : Boolean 
});

profileSchema.plugin(timestamps);
module.exports = mongoose.model('profileList',profileSchema,'profileList');
