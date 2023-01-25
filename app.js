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

var uri = "mongodb://127.0.0.1:27017/details";


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


//Schema objects

//user schema
const userSchema = new mongoose.Schema({
    phone: String,
    password: String,
    role: Number
});

//vehicle scehma
const VehicleSchema = new mongoose.Schema({
    make: String,
    model: String,
    licensePlate: String,
    qrCode: String
});

//station scehma
const StationSchema = new mongoose.Schema({
    name :String,
    location: String,
    capacity: Number
});

//userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });

const User = new mongoose.model("User", userSchema);
const Vehicle = new mongoose.model("Vehicle", VehicleSchema);
const Station = mongoose.model('Station', StationSchema);




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
app.get("/vehicle", function (req, res) {
    res.render("vehicle");
});
app.get("/station", function (req, res) {
    res.render("station");
});
app.get("/assignstation", function (req, res) {
    res.render("AssignStation");
});
//app.get("/getstation", function (req, res) {
//    res.render("getStation");
//});



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


app.post("/station/register", function (req, res) {
    Station.findOne({ location: req.body.location }, function (err, foundUser) {
        if (foundUser) {
            console.log(foundUser)
            res.send('<script>alert("station already exist, redirecting to station adding page!!!"); window.location.href = "/station";</script>');
        } else {
            const newStation = new Station({
                name: req.body.station_name,
                location: req.body.location,
                capacity: req.body.capacity
            });
            newStation.save(function (err) {
                if (err) {
                    console.log(err);
                } else {
                    res.send('<script>alert("station successfully added!!!"); window.location.href = "/station" </script>')
                }
            });
        }
    });
});

app.post("/vehicle/register", function (req, res) {
    Vehicle.findOne({ licensePlate: req.body.license_Plate }, function (err, foundUser) {
        if (foundUser) {
            res.send('<script>alert("vehicle already exist, redirecting to vehicle adding page!!!"); window.location.href = "/vehicle";</script>');
        } else {
            const newVehicle = new Vehicle({
                model: req.body.model,
                licensePlate: req.body.license_Plate,
                qrCode: req.body.QR_code
            });
            newVehicle.save(function (err) {
                if (err) {
                    console.log(err);
                } else {
                    res.send('<script>alert("vehicle successfully added!!!"); window.location.href = "/vehicle" </script>')
                }
            });
        }
    });
});

app.get("/station/list", async (req, res) => {
    const stations = await mongoose.model("Station").find();
    res.render("getStation", { stations });
});


const port = 3000;
app.listen(port, function () {
    console.log("Server is running on Port: " + port);
});
