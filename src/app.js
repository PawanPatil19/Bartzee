var express = require("express");
var path = require("path");
var User = require("./models/userModel");
var Product = require("./models/productModel");
var Org = require("./models/orgModel");
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
require("dotenv").config();
require("./config/passport")(passport)






const JWT_SECRET = 'sdjkfh8923yhjdksbfma@#*(&@*!^#&@bhjb2qiuhesdbhjdsfg839ujkdhfjk'

// setting up multer to stroing uploaded images
// var multer = require('multer');
// const { Template } = require("ejs");

// var storage = multer.diskStorage({
// 	destination: (req, file, cb) => {
// 		cb(null, './src/uploads')
// 	},
// 	filename: (req, file, cb) => {
// 		cb(null, file.fieldname + '-' + Date.now())
// 	}
// });

// var upload = multer({ storage: storage });


//calling the database connection
require("./connection")

const app = express();
const router = express.Router();
const port = process.env.PORT || 3000;

//user management
app.use(bodyParser.urlencoded({ extended: true }));



// Session management
app.use(session({
	secret: 'secret',
	resave : true,
	saveUninitialized : true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req,res,next)=> {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error  = req.flash('error');
next();
})


const {ensureAuthenticated} = require("./config/auth.js")


const staticpath = path.join(__dirname, "../public");

app.use('/css', express.static(path.join(__dirname, "../node_modules/bootstrap/dist/css")));
app.use('/js', express.static(path.join(__dirname, "../node_modules/bootstrap/dist/js")));
app.use('/jq', express.static(path.join(__dirname, "../node_modules/jquery/dist")));
app.use(express.static(staticpath))

app.set('view engine', 'ejs');

app.use('/',require('./routes/index'));
app.use('/users',require('./routes/users'));

// //Organization Registration page
// app.get("/orgReg", (req, res) => {
// 	res.render("orgReg");
// })

// //Post Organization Registration
// app.post("/orgReg", async (req, res) => {
// 	const { org, country } = req.body

// 	try {
// 		const response = await Org.create({
// 			org,
// 			country
// 		})
// 		console.log('Organization Registered ', response)
// 	} catch (error) {
// 		if (error.code === 11000) {
// 			// duplicate key
// 			return res.json({ status: 'error', error: 'Organization already registered..' })
// 		}
// 		throw error
// 	}

// 	Org.find({}).exec(function (err, Organization) {

// 		if (err) {
// 			console.log("Error:", err);
// 		}

// 		res.render("register", { Organization: Organization });
// 	});
// 	//res.json({ status: 'ok' })
// });

// //Error page
// app.get("/error", (req, res) => {
// 	res.render("error");
// })

// // Product Registration Page
// app.get("/productReg", ensureAuthenticated, (req, res) => {
// 	console.log(req.user);
// 	Org.find({}).exec(function (err, Organization) {

// 		if (err) {
// 			console.log("Error:", err);
// 		}

// 		res.render("productReg", { Organization: Organization, layout: false, user: req.user});
// 	});
// })

// //Post Product registration
// app.post("/productReg", upload.single('image'), (req, res) => {
// 	console.log(req.file)

// 	var img = fs.readFileSync(req.file.path);
// 	var encode_img = img.toString('base64');

// 	var obj = {
// 		productType: req.body.productType,
// 		sellerName: req.body.sellerName,
// 		organization: req.body.organization,
// 		sellerAddress: req.body.sellerAddress,
// 		productName: req.body.productName,
// 		image: {
// 			data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
// 			contentType: 'image/jpg'
// 		},
// 		productQuantity: req.body.productQuantity,
// 		productDesc: req.body.productDesc,
// 		productColor: req.body.productColor,
// 		productSize: req.body.productSize,
// 		sellerPhone: req.body.sellerPhone,
// 		sellerEmail: req.body.sellerEmail,
// 		productPrice: req.body.productPrice,
// 	}


// 	Product.create(obj, (err, item) => {
// 		if (err) {
// 			console.log(err);
// 		}
// 		else {
// 			item.save();
// 			console.log("ID: ", item._id)
// 			Product.find({ '_id': item._id }, (err, prd) => {
// 				err ? console.log(err) : res.render('review', { prd: prd });
// 			});
// 		}
// 	});
// });

// // Product review page
// app.get("/review/:id", ensureAuthenticated, (req, res) => {
// 	Product.find({ '_id': req.params.id }, (err, prd) => {
// 		err ? console.log(err) : res.render('review', { prd: prd, layout: false, user: req.user });
// 	});
// })


// Cart page





//server create
app.listen(port, () => {
	console.log(`server is running at port at port no ${port}`);
})