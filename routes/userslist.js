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

//userslist route
router.get ('/userslist', loggedin, admin, (req, res) => {
    console.log("executed complaint!!!");
    res.redirect('/'+req.user.username+'/userslist');
});


//userlist success route
router.get ('/userslist/success', loggedin, admin, (req, res) => {
    
    userList.find({},function(err, listOfProfiles){
            var type = [{type: req.user.type}];
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
                    
                
                // res.render('privilege', {type: type, list: list, solved: solved, unsolved: unsolved, total: list.length, discarded: list.length});
                res.render('userslist', {userdelete:true, type: type, lister: listOfProfiles,list: list, solved: solved, unsolved: unsolved, total: list.length, discarded: list.length});
            }
        });
        
    });


});

//profile route
router.get ('/:username/userslist', loggedin, admin, (req, res) => {
    
            userList.find({},function(err, listOfProfiles){
                    var type = [{type: req.user.type}];
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
                            
                        
                        // res.render('privilege', {type: type, list: list, solved: solved, unsolved: unsolved, total: list.length, discarded: list.length});
                        res.render('userslist', {userdelete:false, type: type, lister: listOfProfiles,list: list, solved: solved, unsolved: unsolved, total: list.length, discarded: list.length});
                    }
                });
                
            });
       

});

module.exports = router;