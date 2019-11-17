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


router.post ('/feedback', (req, res) => {

    var body = req.body,
            name = body.name,
            email = body.email,
            subject = body.subject,
            message = body.message;
            
    const html = `Hi there,
            <br/>
            There is a feedback for you!
            <br/><br/>
            From:
            ${name}
            <br/><br/>
            Email:
            ${email}
            <br/><br/>
            Message:
            ${message}
            <br/><br/>
            Have a pleasant day.`;

    const mailOptions = {
        from: process.env.EMAIL, 
        to: process.env.EMAIL,
        subject: subject, 
        html: html
    };

    transporter.sendMail(mailOptions, function (err, info) {
        if(err)
            console.log(err);
        else
            console.log(info);
    });
    res.redirect('/');
});
//end

module.exports = router;
