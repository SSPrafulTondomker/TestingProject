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


//Index page route
router.get('/index', loggedin, (req,res) => {

    userList.find({type: "patient"}, function(err, listOfPatients){
        profileList.find({username: req.user.username}, function(err, userProfile){

            res.render('index', {type: req.user.type, username: req.user.username, listOfPatients: listOfPatients, patientProfile:[], userProfile: userProfile});

        });
    });

});

//Index page route
router.get('/sendFiles', (req,res) => {

    userList.find({type: "patient"}, function(err, listOfPatients){
        profileList.find({username: req.user.username}, function(err, userProfile){

            res.render('sendFiles', {type: req.user.type, username: req.user.username, listOfPatients: listOfPatients, patientProfile:[], userProfile: userProfile});

        });
    });

});

//Index page route
router.get('/viewFiles', loggedin, (req,res) => {

    userList.find({$or: [{type: "patient"}, {type: "doctor"}, {username: "intrudor"}]}, function(err, listOfPatients){
        profileList.find({username: req.user.username}, function(err, userProfile){

            res.render('viewFiles', {type: req.user.type, username: req.user.username, listOfPatients: listOfPatients, patientProfile:[], userProfile: userProfile, clientUsername: ""});

        });
    });

});

//Query page route
router.get('/query', loggedin, (req,res) => {

    var output = [{answer: "Your answer will appear here"}];
    res.render('query', {output: output, type : req.user.type});

});

//Index page route
router.get('/', loggedin, (req,res) => {
    res.redirect('/'+req.user.username);
});


//signout route
router.get('/signout', function (req, res) {
    req.logout();
    res.redirect('/login');
});

//signout route
router.get('/login', function (req, res) {
    res.render('login');
});

//register route
router.get('/register', function (req, res) {
    res.render('register', {error: false});
});

//verify route
router.get('/verify', function (req, res) {
    res.render('verify');
});

//forgot-paword route
router.get('/forgot', function (req, res) {
    res.render('forgot');
});



//success route
router.get('/success', loggedin, (req,res) => {
    var username = req.user.username;
    res.redirect('/'+username);
});


//user index route
router.get('/:username', loggedin, (req,res) => {
    res.render('home');
});



//token verification
router.get('/:username/:token', function(req, res, next){
   
    userList.find({$and: [{username: req.params.username}, {token: req.params.token}]}, function(err, userEntity){
        if (err){
                console.log("error in getting userEntity in /:username/:token");
        }else{
            if (userEntity.length != 0){
                userList.findOneAndUpdate({username: req.params.username},
                    {
                        activate : true, 
                    }
                    , {upsert:true}, function(err, newCreate){
                    if(err){
                        console.log("error in Updating active==> true");
                    }
                });
            res.redirect('/:username');
            }
        }
    }); 
});



//page not found route
router.get ('*', (req, res) => {
    console.log("page not found!!!");
    res.render('404');
});
module.exports = router;
