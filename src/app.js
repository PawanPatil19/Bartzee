var express = require("express");
var path = require("path");
var User = require("./models/userModel");
var Product = require("./models/productModel");
var passport = require("passport");
var bodyParser = require("body-parser");
var LocalStrategy = require("passport-local").Strategy;
var passportLocalMongoose = require("passport-local-mongoose");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const JWT_SECRET = 'sdjkfh8923yhjdksbfma@#*(&@*!^#&@bhjb2qiuhesdbhjdsfg839ujkdhfjk'


//calling the database connection
require("./connection")

const app = express();
const port = process.env.PORT || 3000;

//user management
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require("express-session")({
    secret: "node js mongodb",
    resave: false,
    saveUninitialized: false
}));

// app.use(passport.initialize());
// app.use(passport.session());

// passport.use(new LocalStrategy(User.authenticate()));
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());



const staticpath = path.join(__dirname, "../public");

app.use('/css', express.static(path.join(__dirname, "../node_modules/bootstrap/dist/css")));
app.use('/js', express.static(path.join(__dirname, "../node_modules/bootstrap/dist/js")));
app.use('/jq', express.static(path.join(__dirname, "../node_modules/jquery/dist")));
app.use(express.static(staticpath))

app.set('view engine', 'ejs');

//Home Page
app.get("/", (req, res) => {
    res.render("index");
})

//Showing secret page
app.get("/secret", isLoggedIn, function (req, res) {
	res.render("secret");
});


// Registration Page
app.get("/register", (req, res) => {
    res.render("register");
})

//Post Registration
app.post("/register", async(req, res) => {
    const { name, email, password: plainTextPassword, phone, organization } = req.body

    const password = await bcrypt.hash(plainTextPassword, 10)

	try {
		const response = await User.create({
			name,
            email,
			password,
            phone,
            organization
		})
		console.log('User created successfully: ', response)
	} catch (error) {
		if (error.code === 11000) {
			// duplicate key
			return res.json({ status: 'error', error: 'Username already in use' })
		}
		throw error
	}

    res.render("login")
	//res.json({ status: 'ok' })
});

//Login Page
app.get("/login", function (req, res) {
    res.render('login');
});

//Post user login
app.post('/login', async (req, res) => {
	const { email, password } = req.body
	const user = await User.findOne({ email }).lean()

	if (!user) {
		return res.json({ status: 'error', error: 'Invalid email/password' })
	}

	if (await bcrypt.compare(password, user.password)) {
		// the username, password combination is successful

		const token = jwt.sign(
			{
				id: user._id,
				email: user.email
			},
			JWT_SECRET
		)

        console.log("Data added")
        //res.render("index")
		return res.json({ status: 'ok', data: token })
	}
    else{
        res.json({ status: 'error', error: 'Invalid email/password' })
    }

	
})


function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect("/login");
}


// Product Registration Page
app.get("/productReg", (req, res) => {
    res.render("productReg");
})


//Post Product registration
app.post("/productReg", async(req, res) => {
    const { sellerName, address, productName, productImage, productQuantity, sellerPhone, sellerEmail, productPrice } = req.body    

	try {
		const response = await Product.create({
			sellerName, 
            address, 
            productName, 
            productImage, 
            productQuantity, 
            sellerPhone, 
            sellerEmail ,
            productPrice
		})
		console.log('Product registered successfully: ', response)
	} catch (error) {
		if (error.code === 11000) {
			// duplicate key
			return res.json({ status: 'error', error: 'Product already registered' })
		}
		throw error
	}

    res.render("secret")
	//res.json({ status: 'ok' })
});




//server create
app.listen(port, () => {
    console.log(`server is running at port at port no ${port}`);
})