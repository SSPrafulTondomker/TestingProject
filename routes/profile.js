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


//profile route
router.get ('/profile', loggedin, (req, res) => {

    profileList.find({username: req.user.username}, function(err, userProfile){
        if (err){
                res.status(500).send("error in getting profile");
        }else{
            res.render('profile', {userProfile: userProfile, type : req.user.type, username: req.user.username});
        }
    });
});



router.post( '/editprofile',(req, res) => {
 
    var username = req.user.username, 
    name = req.body.name,
    address = req.body.address, 
    gender = req.body.gender,
    interests = req.body.interests,
    consent = [],
    blood = req.body.blood,
    disease = req.body.disease,
    medication = req.body.medication;

    if (!Array.isArray(interests))
        interests = [interests];

    if (disease == 'option1')
        disease = true;
    else
        disease = false;
    if (medication == 'option1')
        medication = true;
    else 
        medication = false;


  var profile = new profileList({
      username: username, 
      firstname : name,
      address : address, 
      gender : gender,
      interest : interests,
      consent : [],
      records : [],
      blood : blood,
      disease : disease,
      medication : medication
      });


       
      profileList.find({username: req.user.username}, function(err, listOfProfile){
          if (err){
                  console.log("error in profile list!!!");
          }else{
              if(listOfProfile.length != 0){
                  profileList.findOneAndUpdate({username: req.user.username},
                      {
                        username: username, 
                        firstname : name,
                        address : address, 
                        gender : gender,
                        interest : interests,
                        consent : listOfProfile[0].consent,
                        records : listOfProfile[0].records,
                        blood : blood,
                        disease : disease,
                        medication : medication
                      }
                      , {upsert: true}, function(err, newCreate){
                      if(err){
                          console.log(err);
                      }
                      else{
                                                console.log(blood);

                          res.redirect('/profile');
                      }
                  });
              }else {
                  profile.save(function(err, newCreate){
                      if(err){
                          console.log("error in editing profile");
                      }
                      else{
                        console.log(blood);
                          res.redirect('/profile');
                      }
                  });            
              }
          }
      });
});

module.exports = router;
