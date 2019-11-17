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

var admin = function (req, res, next) {
    if (req.user.type == 'admin') {
      next();
    } else {
      res.redirect('/');
    }
  }

//table route
router.get ('/privilege', loggedin, admin, (req, res) => {
    console.log("executed tables!!!");
    res.redirect('/'+req.user.username+'/privilege');
});

//table route
router.get ('/:username/privilege', loggedin, admin, (req, res) => {
    console.log("executed /:username/tables!!!");
    var type = [{type: req.user.type}];
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
                res.render('privilege', {privilegeSuccess: false, type: type, list: list, solved: solved, unsolved: unsolved, total: list.length, discarded: list.length});
            }
        });
        
    });
    // res.render('privilege', {type: type});
});

//table route
router.get ('/privilege/success', loggedin, admin, (req, res) => {
    console.log("executed /:username/tables!!!");
    var type = [{type: req.user.type}];
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
                res.render('privilege', {privilegeSuccess: true, type: type, list: list, solved: solved, unsolved: unsolved, total: list.length, discarded: list.length});
            }
        });
        
    });
    // res.render('privilege', {type: type});
});

module.exports = router;