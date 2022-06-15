var express = require("express");
var path = require("path");
var User = require("./models/userModel");
var Product = require("./models/productModel");
var Org = require("./models/orgModel");
var Chat = require("./models/chatModel");
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

//calling the database connection
require("./connection")

const app = express();
const router = express.Router();
const port = process.env.PORT || 3000;

//user management
app.use(bodyParser.urlencoded({ extended: true }));


// Socket.io setup
var http = require('http').Server(app);
var io = require('socket.io')(http);
var users = {};
io.on('connection', (socket) => {
	console.log('User connected', socket.id);

	socket.on("new-user-joined", (username)=>{
		users[socket.id]=username;
		console.log(users);
		socket.broadcast.emit('user-connected',username);
	})

	// socket.on('chat message', function (message) {
	// 	console.log("message: " + msg);

	// 	socket.broadcast.emit("received", { message: msg });

	// 	var chatMessage = new Chat({ message: message, sender: "Anonymous" });
	// 	chatMessage.save();
	// });



	socket.on("disconnect", () => {
		socket.broadcast.emit('user-disconnected', user= users[socket.id]);
		delete users[socket.id];
		console.log('User disconnected')
	})

	socket.on('message', (data) => {
		socket.broadcast.emit("message", {user: data.user, msg: data.msg});
	})
});



// Session management
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	next();
})


const { ensureAuthenticated } = require("./config/auth.js")


const staticpath = path.join(__dirname, "../public");

app.use('/css', express.static(path.join(__dirname, "../node_modules/bootstrap/dist/css")));
app.use('/js', express.static(path.join(__dirname, "../node_modules/bootstrap/dist/js")));
app.use('/jq', express.static(path.join(__dirname, "../node_modules/jquery/dist")));
app.use(express.static(staticpath))

app.set('view engine', 'ejs');

// Routes 
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));

//server create
http.listen(port, () => {
	console.log(`server is running at port at port no ${port}`);
})