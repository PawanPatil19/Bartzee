const mongoose = require("mongoose");

//creating a database
mongoose.connect("mongodb+srv://dbUser_Pawan:gzqnXzsPYvy6IZKL@cluster0.2hgwz.mongodb.net/orbital?retryWrites=true&w=majority", {
    useNewUrlParser: false,
    useUnifiedTopology: false
})
.then(() => {
    console.log("Connected to MongoDB");
})
.catch((err) => {
    console.log(err);
})

var conn = mongoose.connection;
module.exports = conn;
