const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose'); 

// create an schema
const notifSchema = mongoose.Schema(
	{
        email: { type: String}, 
		notif: { type: String },
		date: { type: Date, default: Date.now }

	},
	{ collection: 'notifications' }
);

const model = mongoose.model('notifSchema', notifSchema);


module.exports = model;