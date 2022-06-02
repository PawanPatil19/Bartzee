const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

// create an schema
const userSchema = mongoose.Schema(
    {
        name: {type: String, required: false},
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		phone: { type: String, required: false },
		organization: { type: String, required: false }
	
	},
	{ collection: 'users' }
        );
 
const model = mongoose.model('userSchema', userSchema);

 
module.exports = model;