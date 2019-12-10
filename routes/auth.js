var express = require('express');
var router = express.Router();
var User = require('../db/User');
var randomstring = require('randomstring');
var bcrypt = require('bcrypt-nodejs');
var profileList = require('../db/profile');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS
    }
});                         
require('dotenv').config();


module.exports = function (passport) {


    //sinup route
    router.post('/signup', function (req, res) {


        var body = req.body,
            username = body.username,
            mail = body.email,
            type = body.type,
            password = body.password,
            firstname = "";
        
        var secretToken = randomstring.generate();


        User.findOne({username: username}, function (err, doc) {
            if (err) {
                res.status(500).send('error  occured while signup');
            } else {
                if (doc) {
                    res.render('register');
                } else {

                    var record = new User();
                    record.username = username;
		            record.mail = mail;
                    record.password = record.hashPassword(password);
                    record.token = secretToken;
                    record.activate = true;
                    record.type = type;

                    var profile = new profileList({
                        username: username, 
                        firstname : "",
                        address : "", 
                        gender : "",
                        interest : [],
                        consent : [],
                        records : [],
                        blood : "",
                        disease : false,
                        medication : false
                        });

                        profile.save(function(err, newCreate){
                            if(err){
                                console.log("error in saving profile");
                            }
                            else{
                                console.log("Saving profile Successful!!!");
                            }
                        });  
                    
                        record.save(function (err, user) {
                        if (err) {
                            res.status(500).send('error in saving profile');
                        } else {
                            const html = `Hi there,
                                        <br/>
                                        Thank you for registering!
                                        <br/><br/>
                                        Please verify your email by clicking the following link:
                                        
                                        <a href="${process.env.HOST_LINK}/${username}/${secretToken}">activate</a>
                                        <br/><br/>
                                        ${process.env.HOST_LINK}/${username}/${secretToken}
                                        <br/><br/>
                                        Have a pleasant day.`;

                            const mailOptions = {
                                from: process.env.EMAIL, 
                                to: mail,
                                subject: 'Activation link', 
                                html: html
                            };

                            transporter.sendMail(mailOptions, function (err, info) {
                                if(err)
                                    console.log(err);
                                else
                                    console.log(info);
                            });
                            res.redirect('/verify');
                        }
                    });
                }
            }
        });
    });


    //forgot
    router.post('/forgot', function (req, res) {

        var body = req.body,
            username = body.username,
            password = randomstring.generate(7);
        
        User.findOne({username: username}, function (err, doc) {

            if (err) {
                res.status(500).send('error occured in /forgot');
            } else {
                if(doc) {
                    User.findOneAndUpdate({username: username},
                        {
                            username : username,
                            mail : doc.mail,
                            password : bcrypt.hashSync(password,bcrypt.genSaltSync(10)),
                            token : doc.secretToken,
                            activate : doc.activate,
                            type : doc.type  
                        }
                        , {upsert:true}, function(err, newCreate){
                        if(err){
                            console.log("error in forgot password!");
                        }
                        else{
                            const html = `Hi there,
                                        <br/>
                                        Thank you for joining us!
                                        <br/><br/>
                                        Please use this password for log in!
                                        <br/><br/>
                                        Username:
                                        ${username}
                                        <br/><br/>
                                        password:
                                        ${password}
                                        <br/><br/>
                                        Have a pleasant day.`;
                            
                            const mailOptions = {
                                from: process.env.EMAIL, 
                                to: doc.mail,
                                subject: 'New Generated Password', 
                                html: html
                            };

                            transporter.sendMail(mailOptions, function (err, info) {
                                if(err)
                                    console.log(err);
                                else
                                    console.log(info);
                            });
                            res.redirect('/login');
                        }
                    });
                }
            }
        });
    });


    //verify again
    router.post('/verifyAgain', function (req, res) {

        var body = req.body,
            username = body.username,
            secretToken = randomstring.generate();
        
        User.findOne({username: username}, function (err, doc) {

            if (err) {
                res.status(500).send('error occured in /verify');
            } else {

                if(doc) {

                    User.findOneAndUpdate({username: username},
                        {
                            username : username,
                            mail : doc.mail,
                            password : doc.password,
                            token : secretToken,
                            activate : doc.activate,
                            type : doc.type
                        }
                        , {upsert:true}, function(err, newCreate){
                        if(err){
                            console.log("error in verify!");
                        }
                        else{
                            const html = `Hi there,
                                            <br/>
                                            Thank you for registering!
                                            <br/><br/>
                                            Please click on the link to verify your email:
                                            <a href="${process.env.HOST_LINK}/${doc.username}/${secretToken}">activate</a>
                                            <br/><br/>
                                            Have a pleasant day.`;
                            
                            const mailOptions = {
                                from: process.env.EMAIL, 
                                to: doc.mail,
                                subject: 'Activation link', 
                                html: html
                            };

                            transporter.sendMail(mailOptions, function (err, info) {
                                if(err)
                                    console.log(err);
                                else
                                    console.log(info);
                            });
                            res.redirect('/login');
                        }
                    });
                }
            }
        });
    });


    router.post('/signin', passport.authenticate('local', {
       
        failureRedirect: '/login',
        successRedirect: '/success',
    
    }), function (req, res) {
        res.send("done");
    });
    return router;
};
