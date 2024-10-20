const express = require("express");
const userModel = require("./models/user"); // Imported DB model
const postModel = require("./models/post");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require('path');
const upload = require("./config/multerconfig");


const app = express();


app.set("view engine", "ejs"); // Set view engine to EJS
app.use(express.json()); // Use JSON middleware
app.use(express.urlencoded({ extended: true })); // Use URL encoded middleware with extended option
app.use(express.static(path.join(__dirname, "public"))); // Use static middleware
app.use(cookieParser()); // Use cookie parser middleware

// This a route to root page.
app.get("/", (req, res) => {
    res.render("index");
});

// This is a route to login page
app.get("/login", (req, res) => {
    res.render("login");
});

// This is a route to profile page
app.get("/profile", isLoggedIn, async (req, res) => {
    let user = await userModel.findOne({email: req.user.email}).populate("posts");
    const displayImageUrls = {
        1: "https://i.pinimg.com/736x/13/1d/45/131d4550369de28e7602fa3d33e44b4c.jpg",
        2: "https://i.pinimg.com/736x/13/1d/45/131d4550369de28e7602fa3d33e44b4c.jpg",
        3: "https://i.pinimg.com/736x/d7/17/8e/d7178ecc343666e2b6acec7206b3c321.jpg",
        4: "https://i.pinimg.com/736x/d7/17/8e/d7178ecc343666e2b6acec7206b3c321.jpg",
        5: "https://i.pinimg.com/736x/b4/70/46/b47046f6d39a4f60c07722736f60bd51.jpg",
        6: "https://i.pinimg.com/736x/97/03/11/970311e4c9af170c2fcb58a774289e9e.jpg"
      };
    res.render("profile", {user, displayImageUrls});
});

app.get("/home", isLoggedIn, async (req, res) => {
    let user = await userModel.findOne({email: req.user.email}).populate("posts");
    let posts = await postModel.find().populate("user");
    const displayImageUrls = {
        1: "https://i.pinimg.com/736x/13/1d/45/131d4550369de28e7602fa3d33e44b4c.jpg",
        2: "https://i.pinimg.com/736x/13/1d/45/131d4550369de28e7602fa3d33e44b4c.jpg",
        3: "https://i.pinimg.com/736x/d7/17/8e/d7178ecc343666e2b6acec7206b3c321.jpg",
        4: "https://i.pinimg.com/736x/d7/17/8e/d7178ecc343666e2b6acec7206b3c321.jpg",
        5: "https://i.pinimg.com/736x/b4/70/46/b47046f6d39a4f60c07722736f60bd51.jpg",
        6: "https://i.pinimg.com/736x/97/03/11/970311e4c9af170c2fcb58a774289e9e.jpg"
      };
    res.render("home", {user, posts, displayImageUrls});
});

app.get("/feed", isLoggedIn, async (req, res) => {
    let user = await userModel.findOne({email: req.user.email}).populate("posts");
    let posts = await postModel.find().populate("user");
    res.render("feed", {user, posts});
});


app.get("/like/:id", isLoggedIn, async (req, res) => {
    let post = await postModel.findOne({_id: req.params.id}).populate("user");

    if(post.likes.indexOf(req.user.userid) === -1){
        post.likes.push(req.user.userid);
    } else {
        post.likes.splice(post.likes.indexOf(req.user.userid), 1);
    }
    await post.save();
    res.redirect("back");
});

app.get("/edit/:id", isLoggedIn, async (req, res) => {
    let post = await postModel.findOne({_id: req.params.id}).populate("user");
    let user = await userModel.findOne({email: req.user.email}).populate("posts");

    res.render("edit", {post, user});
});

app.post("/update/:id", isLoggedIn, async (req, res) => {
    let post = await postModel.findOneAndUpdate({_id: req.params.id}, {content: req.body.content});

    res.redirect("/profile");
});

app.get("/delete/:id", async (req, res) => {
    let post = await postModel.findOneAndDelete({_id: req.params.id});
    res.redirect("/profile");
  });

app.post("/post", isLoggedIn, upload.single("image"), async (req, res) => {
    let user = await userModel.findOne({email: req.user.email});
    let {content, image} = req.body;
    let post = await postModel.create({
        user: user._id,
        name: user.name,
        content: content,
        image: image
    });

    // console.log(req.file);
    if(req.file){
        post.image = req.file.filename;
    }
    user.posts.push(post._id);
    await post.save();
    await user.save();
    res.redirect("back");
});

app.post("/register", async (req, res) =>{
    let { password, email, name, age , display} = req.body; // Destructuring assignment is a way to extract values from an object or an array and assign them to individual variables.

    let user = await userModel.findOne({email});
    if(user){
        return res.status(500).send("User already exists");
    }

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {
            let user = await userModel.create({
                email,
                password: hash,
                name,
                age,
                display
            });
            let token = jwt.sign({email: email, userid: user._id}, "shhhh");
            res.cookie("token", token);
            res.redirect("/login");
        })
    })



})

app.post("/login", async (req, res) =>{
    let { email, password } = req.body;

    let user = await userModel.findOne({email});
    if(!user){
        return res.status(500).send("Something went wrong");
    }

    bcrypt.compare(password, user.password, function(err, result){
        if(result){
            let token = jwt.sign({email: email, userid: user._id}, "shhhh");
            res.cookie("token", token);
            res.status(200).redirect("/home");
        }else{
            res.redirect("/login");
        }
    })  
})

app.get("/logout", (req, res) => {
    res.cookie("token", "");
    res.redirect("/login");
})


function isLoggedIn(req,res, next) {
    if(req.cookies.token === ""){
        res.redirect("/login");  
    } else {
        let data = jwt.verify(req.cookies.token, "shhhh");
        req.user = data;
        next();
    }    
}
app.listen(3000);