var express = require('express');
    router = express.Router(),
    multer = require('multer'),
    upload = multer({ dest: 'public/uploads/' }),
    fs = require('fs'),
    bcrypt = require('bcrypt-nodejs'),
    mongoose = require('mongoose'),
    mongoXlsx = require('mongo-xlsx');

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

router.get ('/generateXlsx', function(req, res){
    res.redirect('/'+req.user.username+'/generateXlsx');
});

router.get ('/:username/generateXlsx', loggedin, (req, res) => {
    console.log("executed complaint!!!");
    profileList.find({userName: req.user.username},function(err, type){

        complaintList.find({}, function(err, list){
            if (err){
                    console.log("error in complaint list!!!");
            }else{
                var solved, unsolved;
                solved = 0;
                unsolved = 0;
                list.forEach(function(l){
                    if (l.solved){
                        solved += 1;
                    } else {
                        unsolved += 1;
                    }
                });
                      
                // console.log(list);
                // console.log(type);
                // console.log(req.user);
                res.render('generate', {type: type, list: list, solved: solved, unsolved: unsolved, total: list.length, discarded: list.length});
            }
        });
        
    });
});

module.exports = router;