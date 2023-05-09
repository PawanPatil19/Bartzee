const mongoose = require("mongoose");

//creating a database
mongoose.connect("mongodb+srv://pkp:SWoeLX9VMOzpwe17@cluster0.acsjryo.mongodb.net/?retryWrites=true&w=majority", {
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
