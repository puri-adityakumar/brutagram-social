const mongoose = require("mongoose");
require('dotenv').config();

const uri = process.env.MONGODB_URI;
mongoose.connect(uri)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));
mongoose.connect("mongodb+srv://username:password@cluster0.hjdsj5.mongodb.net/testdb"); // Connected project to DB
// better use env variables


// DB Schema
const userSchema = mongoose.Schema({
    password: String,
    age: Number,
    email: String,
    name: String,
    display: Number,    
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "post"}
    ]
    
})


// DB Model & export
module.exports = mongoose.model("user", userSchema);


