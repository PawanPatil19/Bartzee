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



// setting up multer to stroing uploaded images
var multer = require('multer');
const { Template } = require("ejs");
var storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'src/uploads')
	},
	filename: (req, file, cb) => {
		cb(null, file.fieldname + '-' + Date.now())
	}
});
var upload = multer({ storage: storage });


//login page
router.get('/', (req, res) => {
	//console.log("1: ", req.user)
	Product.find({ 'buyer': null }).exec(function (err, product) {
		if (req.user) {
			Product.find({ 'buyer': req.user._id }).exec(function (err, numberOfOrders) {
				if (err) {
					console.log("Error:", err);
				}
				var cnt = numberOfOrders.length
				res.render("index", { layout: false, product: product, user: req.user, count: cnt });

			});
		} else {
			res.render("index", { layout: false, product: product, user: req.user, count: 0 });
		}



	});
})


//Organization Registration page
router.get("/orgReg", (req, res) => {
	res.render("orgReg");
})

//Post Organization Registration
router.post("/orgReg", async (req, res) => {
	const { org, country } = req.body

	try {
		const response = await Org.create({
			org,
			country
		})
		console.log('Organization Registered ', response)
	} catch (error) {
		if (error.code === 11000) {
			// duplicate key
			return res.json({ status: 'error', error: 'Organization already registered..' })
		}
		throw error
	}

	Org.find({}).exec(function (err, Organization) {

		if (err) {
			console.log("Error:", err);
		}

		res.render("register", { Organization: Organization });
	});
	//res.json({ status: 'ok' })
});



// Product Registration Page
router.get("/productReg", ensureAuthenticated, (req, res) => {
	console.log("2: ", req.user)
	Org.find({}).exec(function (err, Organization) {
		if (err) {
			console.log("Error:", err);
		}
		Product.find({ 'buyer': req.user._id }).exec(function (err, numberOfOrders) {
			if (err) {
				console.log("Error:", err);
			}
			res.render("productReg", { Organization: Organization, layout: false, user: req.user, count: numberOfOrders.length });
		});

	});
})

//Post Product registration
router.post("/productReg", upload.single('image'), (req, res) => {
	console.log(req.file)

	var img = fs.readFileSync(req.file.path);
	var encode_img = img.toString('base64');

	console.log(__dirname + '/uploads');
	var obj = {
		productType: req.body.productType,
		sellerName: req.body.sellerName,
		organization: req.body.organization,
		sellerAddress: req.body.sellerAddress,
		productName: req.body.productName,
		image: {
			data: fs.readFileSync(path.join(__dirname, '..', 'uploads', req.file.filename)),
			contentType: 'image/jpg'
		},
		productQuantity: req.body.productQuantity,
		productDesc: req.body.productDesc,
		productColor: req.body.productColor,
		productSize: req.body.productSize,
		sellerPhone: req.body.sellerPhone,
		sellerEmail: req.body.sellerEmail,
		productPrice: req.body.productPrice,
	}


	Product.create(obj, (err, item) => {
		if (err) {
			console.log(err);
		}
		else {
			item.save();
			console.log("ID: ", item._id)
			// Product.find({ '_id': item._id }, (err, prd) => {
			// 	err ? console.log(err) : res.render('review', { prd: prd, user: req.user });
			// });

			Product.find({ '_id': item._id }).exec(function (err, prd) {
				if (err) {
					console.log(err);
				}
				Product.find({ 'buyer': req.user._id }).exec(function (err, numberOfOrders) {
					if (err) {
						console.log("Error:", err);
					}
					res.render('review', { prd: prd, layout: false, user: req.user, count: numberOfOrders.length });
				});

			})
		}
	});

});

router.get("/review", (req, res) => {
	// Product.find({ '_id': req.params.id }, (err, prd) => {
	// 	err ? console.log(err) : res.render('review', { prd: prd, layout: false, user: req.user, count: 0 });
	// });
	res.render('review');
})



// Product review page
router.get("/review/:id", (req, res) => {
	// Product.find({ '_id': req.params.id }, (err, prd) => {
	// 	err ? console.log(err) : res.render('review', { prd: prd, layout: false, user: req.user, count: 0 });
	// });

	Product.find({ '_id': req.params.id }).exec(function (err, prd) {
		if (req.user) {
			Product.find({ 'buyer': req.user._id }).exec(function (err, numberOfOrders) {
				if (err) {
					console.log("Error:", err);
				}
				res.render("review", { prd: prd, layout: false, user: req.user, count: numberOfOrders.length });
			});
		} else {
			res.render('review', { prd: prd, layout: false, user: req.user, count: 0 });
		}

	})
})

router.post("/review/:id", (req, res) => {
	Product.updateOne({ '_id': req.params.id }, { buyer: req.user._id }, function (err, docs) {
		if (err) {
			console.log(err)
		}
		else {

			console.log("Item added to cart! ", docs);
			Product.find({ 'buyer': req.user._id }).exec(function (err, numberOfOrders) {
				if (err) {
					console.log("Error:", err);
				}
				res.render("cart", { orders: numberOfOrders, layout: false, user: req.user, count: numberOfOrders.length });
			});

		}
	});

})

// Cart page
router.get("/cart", (req, res) => {
	Product.find({ 'buyer': req.user._id }, (err, orders) => {
		err ? console.log(err) : res.render('cart', { orders: orders, layout: false, user: req.user, count: orders.length });
	});

})

// Profile page
router.get("/profile", (req, res) => {
	Product.find({ 'buyer': req.user._id }, (err, orders) => {
		err ? console.log(err) : res.render('profile', { layout: false, user: req.user, count: orders.length });
	});
})

//Delete user
router.get("/deleteUser", function (req, res) {
	User.findByIdAndRemove(req.user._id, (err, doc) => {
		if (!err) {
			Product.find({}).exec(function (err, product) {
				if (err) {
					console.log("Error:", err);
				}
				res.render("index", { layout: false, product: product, user: null, count: 0 });

			});
		} else {
			console.log('Failed to Delete user Details: ' + err);
		}
	});

});


//Remove product from user cart
router.get("/removeCart/:id", function (req, res) {
	var myquery = { roomID: req.params.id };
	Chat.remove(myquery, (err, doc) => {
		if(err) {
			console.log(err)
		} else{
			console.log('Chats deleted for the product')
		}
	})


	Product.updateOne({ '_id': req.params.id }, { buyer: null }, function (err, docs) {
		if (err) {
			console.log(err)
		}
		else {
			console.log("Item removed from cart! ", docs);
			Product.find({ 'buyer': req.user._id }, (err, orders) => {
				err ? console.log(err) : res.render('cart', { orders: orders, layout: false, user: req.user, count: orders.length });
			});

		}
	});
});

// Chat Interface
router.get("/chatInterface/:roomID", function (req, res) {
	var room = req.params.roomID;
	console.log(room);
	Product.find({ 'buyer': req.user._id }, (err, orders) => {
		err ? console.log(err) : res.render('chatInterface', { layout: false, room: room, user: req.user, count: orders.length });
	});
});

// Sell Cart
router.get("/sellCart", (req, res) => {
	Product.find({ 'buyer': req.user._id }, function(err, orders)  {
		if(err){
			console.log(err)
		} else {
			Product.find({'sellerEmail' : req.user.email}, function(err, sellItems) {
				if(err) {
					console.log(err);
				} else {
					console.log(sellItems);
					res.render('sellCart', { layout: false, user: req.user, count: orders.length, sellItems: sellItems });
				}
			})
			
		}
		
	});

})

//Delete Item to sell
router.get("/deleteItem/:id", (req, res) => {
	var myquery = { roomID: req.params.id };
	Chat.remove(myquery, (err, doc) => {
		if(err) {
			console.log(err)
		} else{
			console.log('Chats deleted for the product')
		}
	})
	
	Product.findByIdAndRemove(req.params.id, (err, doc) => {
		if(err) {
			console.log(err);
		} else {
			console.log("Product Deleted!")
		}
	})
})



router.get("/error", function (req, res) {
	res.render('error');
});

module.exports = router; 