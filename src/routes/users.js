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




//login handle

router.get('/login', (req, res) => {
    res.render('login');
})

router.get('/register', (req, res) => {
    Org.find({}).exec(function (err, Organization) {
		if (err) {
			console.log("Error:", err);
		}
		res.render("register", { Organization: Organization});
	});
})

//Register handle
router.post('/login', (req, res, next) => {
	User.find({'email': req.body.email}, function(err, user) {
		for(var i in user) {
			if(user[i].admin) {
				passport.authenticate('local', {
					successRedirect: '/admin',
					failureRedirect: '/error',
					failureFlash: true
				})(req, res, next)
			} else{
				passport.authenticate('local', {
					successRedirect: '/',
					failureRedirect: '/error',
					failureFlash: true
				})(req, res, next)
			}
		}
	})
})

// Post Registration
router.post("/register", async (req, res) => {
	const { name, email, password: plainTextPassword, phone, organization } = req.body

	const password = await bcrypt.hash(plainTextPassword, 10)

	let errors = [];

	if (!name || !email || !password || !phone || !organization) {
		errors.push({ msg: "Please fill in all fields" })
	}

	if (errors.length > 0) {
		res.render('error')
	} else {
		//validation passed
		User.findOne({ email: email }).exec((err, user) => {
			console.log(user);
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
                    res.redirect('/users/login')
                } catch (error) {
                    console.log(error);
                }
				
			}
		});
	}

});

router.get("/forgotPass", (req, res) => {
	res.render("forgotPass");
})
//Forgot Password Page
router.post("/forgotPass", async (req, res) => {
	const { email, password:plainTextPassword } = req.body

	const pass = await bcrypt.hash(plainTextPassword, 10);
	let errors = [];

	if (errors.length > 0) {
		res.render('error')
	} else {
		//validation passed
		
		User.findOne({ email: email }).exec((err, user) => {
			console.log(user);
			if (user) {
				var myquery = {email : email};
				var newvalues = { $set: {password: pass } };
				User.updateOne(myquery, newvalues, function (err, docs) {
					if(err){
						console.log(err)
					} else {
						console.log("Password changed successfully!")
						res.redirect('/users/login')
					}
				})
			} else {
				errors.push({ msg: 'Invalid email!' });
				console.log(errors);
				res.render("error");
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


