
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const chatSchema = mongoose.Schema(
    {
        message: { type: String },
        senderName: { type: String },
        senderID: { type: String },
        socketID: { type: String }
    },
    {
        timestamps: true
    },
    { collection: 'chats' });

let model = mongoose.model("Chat", chatSchema);
module.exports = model;