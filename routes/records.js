var express = require('express');
    router = express.Router(),
    multer = require('multer'),
    upload = multer({ dest: 'public/uploads' }),
    fs = require('fs'),
    bcrypt = require('bcrypt-nodejs'),
    mongoose = require('mongoose'),
    mongoXlsx = require('mongo-xlsx');
    // filepreview = require('filepreview');

var userList = require('../db/User'),
    complaintList = require('../db/complaint'),
    backupList = require('../db/backup'),
    xlsxList = require('../db/xlsx'),
    profileList = require('../db/profile');

    
var loggedin = function (req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/login');
  }
}


//records route
router.get ('/records', loggedin, (req, res) => {

    profileList.find({username: req.user.username}, function(err, userProfile){
        if (err){
                res.status(500).send("error in getting profile");
        }else{
            res.render('records', {userProfile: userProfile, username: req.user.username, type : req.user.type});
        }
    });
});



router.post("/records", upload.any(), function(req, res){

    
    var record =  req.files[0];
    var files = req.body.records;

    if (record)
    {
        console.log(record);
        record = req.files[0].filename;
        var type = req.files[0].mimetype,
            originalName = req.files[0].originalname.split(".")[0]+".txt";

        if (type != 'text/plain') {
            console.log("iam image");
            var spawn = require("child_process").spawn;
            var process = spawn('python',["converter/main.py", "--input_dir", "public/uploads/images/", "--output_dir", "public/uploads/images"]);
            
            process.stderr.on('data', function(data) {
                
                console.log(data.toString());
                profileList.findOneAndUpdate({username: req.user.username},
                    { 
                        $push: {records : originalName}
                    }
                    , {upsert:true}, function(err, newCreate){
                    if(err){
                        console.log("error in /records upload profile");
                    }
                    else{
                        
                        res.redirect('/records');
                    }
                });
            });

            

        }else {
            profileList.findOneAndUpdate({username: req.user.username},
                { 
                    $push: {records : record}
                }
                , {upsert:true}, function(err, newCreate){
                if(err){
                    console.log("error in /records upload profile");
                }
                else{
                    
                    res.redirect('/records');
                }
            });
        }
        
    }
    else 
    {
        console.log("python");
        //cliner call
        // var spawn = require("child_process").spawn;
        // var process = spawn('python',["./CliNER/cliner", "predict", "--txt", "public/uploads/demo.txt", "--out", "./CliNER/data/examples/", "--format" ,"i2b2" ,"--model" ,"./CliNER/models/silver.crf"]);

        // process.stderr.on('data', function(data) {
        //     console.log(data.toString());
        // });
        
 
        
        res.redirect('/records');
    }

});

module.exports = router;
