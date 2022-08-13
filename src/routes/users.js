var express = require("express");
var path = require("path");
var User = require("../models/userModel");
var Product = require("../models/productModel");
var Org = require("../models/orgModel");
var passport = require("passport");
var bodyParser = require("body-parser");
var LocalStrategy = require("passport-local").Strategy;
var passportLocalMongoose = require("passport-local-mongoose");
var bcrypt = require('bcryptjs')
var jwt = require('jsonwebtoken')
const flash = require('connect-flash');
var session = require("express-session");
var cookieParser = require("cookie-parser");
var fs = require("fs")
var ObjectId = require('mongodb').ObjectID;
var Auth0Strategy = require("passport-auth0");

const router = express.Router();
const {ensureAuthenticated} = require('../config/auth') 

router.use(flash());



//login handle

router.get('/login', (req, res, next) => {
    res.render('login', {message:null});
})

router.get('/login/:error', (req, res, next) => {
    res.render('login', {message: "Invalid Credentials"});
})


router.get('/register', (req, res) => {
    Org.find({}).exec(function (err, Organization) {
		if (err) {
			console.log("Error:", err);
		}
		res.render("register", { Organization: Organization, message: null});
	});
})

//Register handle
router.post('/login', (req, res, next) => {
	User.find({'email': req.body.email}, function(err, user) {
		for(var i in user) {
			if(user[i].admin) {
				passport.authenticate('local', {					
					successRedirect: '/admin',
					failureRedirect: '/users/login/error',
					failureFlash: true
					
				})(req, res, next)
			} else{
				passport.authenticate('local', {					
					successRedirect: '/',
					failureRedirect: '/users/login/error',
					failureFlash: true,
				})(req, res, next)
			}
		}
	})
})

router.post('/login/:error', (req, res, next) => {
	User.find({'email': req.body.email}, function(err, user) {
		for(var i in user) {
			if(user[i].admin) {
				passport.authenticate('local', {					
					successRedirect: '/admin',
					failureRedirect: '/users/login/error',
					failureFlash: true
					
				})(req, res, next)
			} else{
				passport.authenticate('local', {					
					successRedirect: '/',
					failureRedirect: '/users/login/error',
					failureFlash: true,
				})(req, res, next)
			}
		}
	})
})

// Post Registration
router.post("/register", async (req, res) => {
	const { name, email, password: plainTextPassword, phone, organization, repassword: plainTextRePassword } = req.body


	const password = await bcrypt.hash(plainTextPassword, 10)

	if (plainTextPassword != plainTextRePassword && plainTextPassword.length < 8 && organization == "Select your school/university/office.." ) {
		Org.find({}).exec(function (err, Organization) {
			if (err) {
				console.log("Error:", err);
			}
			res.render("register", { Organization: Organization, message: 'error'});
		});
	} else {
		//validation passed
		User.findOne({ email: email }).exec((err, user) => {
			if (user) {
				errors.push({ msg: 'email already registered' });
				console.log(errors);
				res.render("error");

			} else {
                try {
                    const response = new User({
                        name,
                        email,
                        password,
                        phone,
                        organization
                    })
                    console.log('User created successfully: ', response)
                    response.save();
                    res.render('/users/login')
                } catch (error) {
                    console.log(error);
                }
				
			}
		});
	}

});

router.get("/forgotPass", (req, res) => {
	res.render("forgotPass", {message: null});
})
//Forgot Password Page
router.post("/forgotPass", async (req, res) => {
	const { email, password:plainTextPassword, repassword:plainTextRePassword } = req.body

	const pass = await bcrypt.hash(plainTextPassword, 10);
	
	console.log(plainTextPassword.length)

	if (plainTextPassword != plainTextRePassword ) {
		res.render("forgotPass", {message: "Password does not match"})
	} else if (plainTextPassword.length < 8){
		res.render("forgotPass", {message: "Password is less than 8 characters"})
	} else {
		//validation passed
		
		User.findOne({ email: email }).exec((err, user) => {
			if (user) {
				var myquery = {email : email};
				var newvalues = { $set: {password: pass } };
				User.updateOne(myquery, newvalues, function (err, docs) {
					if(err){
						console.log(err)
					} else {
						console.log("Password changed successfully!")
						res.render('login', {message: null})
					}
				})
			} else {
				res.render("forgotPass", {message: "User not found"})
			}
		});
	}

})

//logout
router.get("/logout", (req, res, next) => {

	req.logout(function(err) {
		if (err) { return next(err); }
		console.log(session)
		req.flash('success_msg','Now logged out');
		res.redirect('/');
	  });
})





module.exports = router;


