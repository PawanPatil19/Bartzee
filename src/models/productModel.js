const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

// create an schema
const productSchema = mongoose.Schema(
    {
        sellerName: {type: String, required: false},
		address: { type: String, required: false },
		productName: { type: String, required: false },
		image: 
    {
        data: Buffer,
        contentType: String
    },
		productQuantity: { type: String, required: false },
        sellerPhone: {type: String, required: false},
        sellerEmail: {type: String, required: false},
        productPrice: {type: Number, required: false}
	
	},
	{ collection: 'products' }
        );
 
const model = mongoose.model('productSchema', productSchema);

 
module.exports = model;