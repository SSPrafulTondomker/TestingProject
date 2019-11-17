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

//complaint route
router.get ('/complaint', loggedin, (req, res) => {
    res.redirect('/'+req.user.username+'/complaint');
});


//:username/compalint route
router.get ('/:username/complaint', loggedin, (req, res) => {
    profileList.find({userName: req.user.username},function(err, type){
        if (req.user.type == 'admin') {
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
                    console.log(list);
                    backupList.find({}, function(err, discard){
                        res.render('complaint', {type: type, list: list, solved: solved, unsolved: unsolved, total: list.length, discarded: discard.length});
                    });
                    
                }
            });
        } else {
        complaintList.find({userName: req.user.username}, function(err, list){
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
                backupList.find({userName: req.user.username}, function(err, card){
                    var discard = [];

                   
                    res.render('complaint', {type: type, list: list, solved: solved, unsolved: unsolved, total: list.length, discarded: discard.length});
                });
                
            }
        });
        }
        
    });
});

module.exports = router;