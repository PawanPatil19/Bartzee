const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

// create an schema
const orgSchema = mongoose.Schema(
    {
		org: { type: String, required: false, unique: true },
		country: { type: String, required: false },
	
	},
	{ collection: 'organizations' }
        );
 
const model = mongoose.model('orgSchema', orgSchema);

 
module.exports = model;