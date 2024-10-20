const mongoose = require("mongoose");


const userSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    date: {
        type: Date,
        default: Date.now
    },
    name: {
        type: mongoose.Schema.Types.String,
        ref: "user"
    },
    content: String,
    image: String,
    likes: [
        {type: mongoose.Schema.Types.ObjectId, ref: "user"}
    ]
});

module.exports = mongoose.model("post", userSchema);






