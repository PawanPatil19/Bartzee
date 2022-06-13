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
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/error',
        failureFlash: true
    })(req, res, next)
})

// //register post handle
// router.post('/register', (req, res) => {
//     const { name, email, password, password2 } = req.body;
//     let errors = [];
//     console.log(' Name ' + name + ' email :' + email + ' pass:' + password);
//     if (!name || !email || !password || !password2) {
//         errors.push({ msg: "Please fill in all fields" })
//     }
//     //check if match
//     if (password !== password2) {
//         errors.push({ msg: "passwords dont match" });
//     }

//     //check if password is more than 6 characters
//     if (password.length < 6) {
//         errors.push({ msg: 'password atleast 6 characters' })
//     }
//     if (errors.length > 0) {
//         res.render('register', {
//             errors: errors,
//             name: name,
//             email: email,
//             password: password,
//             password2: password2
//         })
//     } else {
//         //validation passed
//         User.findOne({ email: email }).exec((err, user) => {
//             console.log(user);
//             if (user) {
//                 errors.push({ msg: 'email already registered' });
//                 res.render('register', { errors, name, email, password, password2 })
//             } else {
//                 const newUser = new User({
//                     name: name,
//                     email: email,
//                     password: password
//                 });

//                 //hash password
//                 bcrypt.genSalt(10, (err, salt) =>
//                     bcrypt.hash(newUser.password, salt,
//                         (err, hash) => {
//                             if (err) throw err;
//                             //save pass to hash
//                             newUser.password = hash;
//                             //save user
//                             newUser.save()
//                                 .then((value) => {
//                                     console.log(value)
//                                     req.flash('success_msg', 'You have now registered!');
//                                     res.redirect('/users/login');
//                                 })
//                                 .catch(value => console.log(value));

//                         }));
//             }
//         })
//     }
// })

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
                    res.render("login");
                } catch (error) {
                    console.log(error);
                }
				
			}
		});
	}

});

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


