var express = require("express");
var path = require("path");
var User = require("../models/userModel");
var Product = require("../models/productModel");
var Org = require("../models/orgModel");
var Chat = require("../models/chatModel");
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
const { ensureAuthenticated } = require('../config/auth')
var mongo = require('mongodb');

var MongoClient = mongo.MongoClient;


router.get('/:searchQuery', (req, res) => {
	Product.find({
		$or: [{ "productName": { "$regex": req.params.searchQuery, "$options": '$i' } },
		{ 'productType': req.params.searchQuery },
		{"productType": {"$regex": req.params.searchQuery, "$options": '$i'}},
		{"sellerName": {"$regex": req.params.searchQuery, "$options": '$i'}},
		{ "organization": { "$regex": req.params.searchQuery, "$options": '$i' } },
		{ "productDesc": { "$regex": req.params.searchQuery, "$options": '$i' } }],
		'buyer': null
	}).exec(function (err, product) {
		if (req.user) {
			Product.find({ 'buyer': req.user._id }).exec(function (err, numberOfOrders) {
				if (err) {
					console.log("Error:", err);
				}
				var cnt = numberOfOrders.length
				res.render("index", { layout: false, search: req.params.searchQuery,product: product, user: req.user, count: cnt });

			});
		} else {
			res.render("index", { layout: false, search: req.params.searchQuery, product: product, user: req.user, count: 0 });
		}
	});
})


module.exports = router; 