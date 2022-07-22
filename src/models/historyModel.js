const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

// create an schema
const historySchema = mongoose.Schema(
    {
        productType: { type: String, required: false },
        sellerName: { type: String, required: false },
        organization: { type: String, required: false },
        sellerAddress: { type: String, required: false },
        productName: { type: String, required: false },
        image:
        {
            data: Buffer,
            contentType: String
        },
        productQuantity: { type: String, required: false },
        productDesc: { type: String, required: false },
        productColor: { type: String, required: false },
        productSize: { type: String, required: false },
        sellerPhone: { type: String, required: false },
        sellerEmail: { type: String, required: false },
        productPrice: { type: Number, required: false },
        orderStatus: {type: String, default: 0},
        buyer: { type: String, sparse: false, default: null },
        buyerName:{type:String, default:null}
    },
    { collection: 'history' }
);

const model = mongoose.model('historySchema', historySchema);


module.exports = model;