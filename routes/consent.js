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
router.get ('/consent', loggedin, (req, res) => {

    userList.find({type: "doctor"}, function(err, doctorProfileList){
        if (err){
                res.status(500).send("error in getting consent");
        }else{
            profileList.find({username: req.user.username}, function (err, patientProfile){
                var consentDoctorList = patientProfile[0].consent;
                res.render('consent', {doctorProfileList: doctorProfileList, username: req.user.username, type: req.user.type, consentDoctorList: consentDoctorList});
            });
            
        }
    });
});


router.post('/deleteConsent', function(req, res){

    var doctor = req.body.doctor;

    profileList.findOneAndUpdate({username: req.user.username},
        {$pull: {consent : doctor}},
        function(err, data){
            if (err){
                console.log(err);
            }else {
                res.redirect("/consent");
            }
        });
});

router.post( '/consent',(req, res) => {
 
    var username = req.user.username, 
        doctor = [req.body.doctor];


  var profile = new profileList({
      username: username, 
      firstname : "",
      address : "", 
      gender : "",
      interest : [],
      consent : doctor,
      blood : "",
      disease : false,
      medication : false    
      });


       
      profileList.find({username: req.user.username}, function(err, userProfile){
          if (err){
                  console.log("error in /consent profile list!!!");
          }else{

              if(userProfile.length != 0){
                  console.log(req.body);
                //   res.redirect('/consent');
                  profileList.findOneAndUpdate({username: req.user.username},
                      {
                        username: userProfile[0].username, 
                        firstname : userProfile[0].firstname,
                        address : userProfile[0].address, 
                        gender : userProfile[0].gender,
                        interest : userProfile[0].interest,
                        consent : doctor.concat(userProfile[0].consent),
                        blood : userProfile[0].blood,
                        disease : userProfile[0].disease,
                        medication : userProfile[0].medication
                      }
                      , {upsert: true}, function(err, newCreate){
                      if(err){
                          console.log(err);
                      }
                      else{
                          res.redirect('/consent');
                      }
                  });
              }else {
                  profile.save(function(err, newCreate){
                      if(err){
                          console.log("error in /consent editing profile");
                      }
                      else{
                          res.redirect('/consent');
                      }
                  });            
              }
          }
      });
});

module.exports = router;
