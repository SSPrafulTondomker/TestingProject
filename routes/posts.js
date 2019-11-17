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

var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS
            }
        });

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

router.post("/index", upload.any(), function(req, res){

    
    var inputString = req.body.inputString;
    var newData = req.body;
    
    var spawn = require("child_process").spawn;
    var process = spawn('python',["./CliNER-master/cliner predict --txt ./CliNER-master/data/examples/ex_doc.txt --out ./CliNER-master/data/predictions --model ./CliNER-master/models/silver.crf --format i2b2"]);

     process.stdout.on('data', function(data) {
        
        var output = [{answer: data.toString()}];
        res.render("query", {output: output, type : req.user.type});
    });
});

router.post("/fileSend", upload.any(), function(req, res){

    var filename = "";
    if (req.files.length > 0){
        filename = req.files[0].filename;
    }
    var patient = "intrudor";
    var inPerson = req.body.medication;
    var doctor = req.user.username;

    console.log(filename);


    profileList.find({username: patient}, function(err, patientProfile){
        
        var consent = patientProfile[0].consent;
        if (inPerson == ""){

                        var today = new Date();
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
            profileList.findOneAndUpdate({username: patient},
                {
                    $push: {records : filename}
                }
                , {upsert: true}, function(err, newCreate){
                if(err){
                    console.log(err);
                }
                else{
                    profileList.findOneAndUpdate({username: patient}, 
                    {
                        $push: {inday: date}
                    }
                    ,{upsert: true}, function (err, newCreate){
                        if (err){
                            console.log(err);
                        }else {
                            profileList.findOneAndUpdate({username: patient}, 
                                {
                                    $push: {intime: time}
                                }, {upsert: true}, function (err, newCreate){
                                                        res.redirect('/sendFiles');
                            });
                        }

                    });

                }
            });
        }else {

            var today = new Date();
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
            
            console.log(today)
            profileList.find({username: inPerson}, function(err, patientProfile){
                var intime = patientProfile[0].in;
                var out = patientProfile[0].out;
                if (!intime){
                    profileList.findOneAndUpdate({username: inPerson},
                        {
                            $push: {inday : date},
                            in : true
                        }
                        , {upsert: true}, function(err, newCreate){
                        if(err){
                            console.log(err);
                        }
                        else{
                            profileList.findOneAndUpdate({username: inPerson},
                            {
                                $push: {intime : time},
                                in : true
                            }
                            ,{upsert: true}, function(err, newCreate){
                                if (err){
                                    console.log(err);
                                }else{
                                    res.redirect('/sendFiles');
                                }

                            });
                            
                        }
                    });
                }else{
                    profileList.findOneAndUpdate({username: inPerson},
                        {
                            $push: {outday : date},
                            in : false
                        }
                        , {upsert: true}, function(err, newCreate){
                        if(err){
                            console.log(err);
                        }
                        else{
                            profileList.findOneAndUpdate({username: inPerson},
                            {
                                $push: {outtime : time},
                                in : false
                            }
                            ,{upsert: true}, function(err, newCreate){
                                if (err){
                                    console.log(err);
                                }else{
                                    res.redirect('/sendFiles');
                                }

                            });
                        }
                    });
                }

            });
        }

    });


});


router.post('/viewRecords',loggedin,  function (req, res, next) {
    var username = req.user.username;
    var patient = req.body.patient;
    
    console.log(patient)
	profileList.find({username: patient}, function(err, patientProfile){
        userList.find({$or: [{type: "patient"}, {type: "doctor"}, {username: "intrudor"}]}, function(err, listOfPatients){
            console.log(listOfPatients)
            profileList.find({username: req.user.username}, function(err, userProfile){
                res.render("viewFiles", {type: req.user.type, username: req.user.username, listOfPatients: listOfPatients, patientProfile: patientProfile, clientUsername: patient, userProfile: userProfile});
            });
        });
    });
});

router.post('/generateXlsx', function(req, res){
    var dt = req.body.date+"T06:01:17.171Z",
        mail = req.body.mail;
        var path = [];
        console.log(dt);

    complaintList.find({ createdAt: { $gte: dt } }, function(err, dat){
        var data = [];
        console.log(dat);
        dat.forEach(function(d){
            data.push({requestId: d.requestId, userName:d.userName, subject:d.subject, solved:d.solved,type:d.type,complaint:d.complaint,createdAt:Date(d.createdAt)});
        });
        var model = mongoXlsx.buildDynamicModel(data);
        console.log(data);
        mongoXlsx.mongoData2Xlsx(data, model, function(err, data) {
            console.log('File saved at:', data.fullPath); 
            console.log(data);
            path.push({path:data.fullPath});
            
            var attachments = attachments = [{ filename: 'Grievance.xlsx', path: data.fullPath, contentType: 'xlsx' }]; 
                        const html = `Hi there,
                                        <br/>
                                        Here is the Grievance report!!
                                        <br/><br/>
                                        Please find your attachment.
                                        <br/><br/>
                                        Have a pleasant day.`;
                            const mailOptions = {
                                from: process.env.EMAIL, // sender address
                                to: mail,
                                subject: 'Grievance status report', // Subject line
                                html: html,// plain text body
                                attachments:  attachments
                            };

                            transporter.sendMail(mailOptions, function (err, info) {
                                if(err)
                                    console.log(err)
                                else
                                    console.log(info);
                            }); 

                        var xlsx = new xlsxList({
                            path: data.fullPath
                            });
                        xlsx.save(function(err, newCreate){
                            if(err){
                                console.log("error in editing profile");
                            }
                            else{
                                console.log("Editing  Successful!!!");
                            }
                        });   
                            
          });
    });
    xlsxList.find({}, function(err, doc){
        if (doc.length != 0){
            console.log(doc[0].path);
          fs.unlink(doc[0].path, (err) => {
            if (err) {
                console.log('error in unlink');
            }
            console.log(doc);
          });
        }
        xlsxList.deleteOne({path: doc[0].path}, function(err){
            if (err){
                console.log('error in deleteion');
            }
        });
    });
    
    res.redirect('/generateXlsx');
});




module.exports = router;