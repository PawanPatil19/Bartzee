const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

// create an schema
const userSchema = mongoose.Schema(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		phone: { type: String, required: true },
		organization: { type: String, required: true },
		image:
        {
            data: Buffer,
            contentType: String,
        },
		date: { type: Date, default: Date.now },
		admin: {type: String, default: null}

	},
	{ collection: 'users' }
);

userSchema.plugin(passportLocalMongoose);
const model = mongoose.model('userSchema', userSchema);


module.exports = model;