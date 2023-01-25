'use strict';
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
//const { router } = require("./routes/index");


const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

var uri = "mongodb://localhost:27017/Vehicle";


mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
    if (err) {
        console.log(err);
        return;
    }
    console.log('Successfully connected to the database');
});

mongoose.connection.on('connected', () => {
    console.log('Mongoose default connection open');
});

const userSchema = new mongoose.Schema({
    phone: String,
    password: String,
    role: Number
});

//userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });

const User = new mongoose.model("User", userSchema);

console.log("hello world")
const port = 3000;
app.get("/", function (req, res) {
    res.render("home");
});
app.get("/login", function (req, res) {
    res.render("login");
});

app.get("/register", function (req, res) {
    res.render("register");
});

app.get("/landing", function (req, res) {
    res.render("landing");
});
app.get("/adminLanding", function (req, res) {
    res.render("adminLanding");
});
app.get("/createVehicle", function (req, res) {
    res.render("createVehicle");
});
app.get("/createStation", function (req, res) {
    res.render("createStation");
});

app.post("/register", function (req, res) {

    User.findOne({ phone: req.body.phone }, function (err, foundUser) {
        if (foundUser) {
            res.send('<script>alert("User already exist, redirecting to login page!!!"); window.location.href = "/login";</script>');
        } else {
            const newUser = new User({
                phone: req.body.phone,
                password: req.body.password,
                role: 2
            });
            newUser.save(function (err) {
                if (err) {
                    console.log(err);
                } else {
                    res.redirect("landing");
                }
            });
        }
    });
});

app.post("/login", function (req, res) {
    const phone = req.body.phone;
    const password = req.body.password;

    User.findOne({ phone: phone }, function (err, foundUser) {
        if (foundUser) {
            if (foundUser.password === password) {
                if (foundUser.role === 1) {
                    res.redirect("adminLanding");
                } else {
                    res.redirect("landing");
                }
            } else {
                res.send('<script>alert("Wrong Password"); window.location.href = "/login";</script>');
            }
        } else {
            console.log(err ? err : 'errored');
        }
    });

});
app.listen(port, function () {
    console.log("Server is running on Port: " + port);
});
