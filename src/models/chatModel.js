
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const chatSchema = mongoose.Schema(
    {
        message: { type: String },
        sender: { type: String }
    },
    {
        timestamps: true
    },
    { collection: 'chats' });

let model = mongoose.model("Chat", chatSchema);
module.exports = model;