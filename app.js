'use strict';
//require('dotenv').config()
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

//userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });

const User = require("./models/user");
const Vehicle = require("./models/vehicle");
const Station = require("./models/station");
const Inventory = require("./models/inventory");

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

    User.findOne({ phone: phone }, async (err, foundUser) => {
        if (foundUser) {
            const inventory = await mongoose.model("Inventory").find().populate(['station', 'vehicle']);
            if (foundUser.password === password) {
                if (foundUser.role === 1) {
                    res.render("adminLanding", { inventory });
                } else {
                    res.render("landing", { inventory });
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
                make: req.body.make,
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

app.get("/station/assign", async (req, res) => {
    let stations = await mongoose.model("Station").find();
    let vehicles = await mongoose.model("Vehicle").find();
    res.render("assign", { stations, vehicles });
});

app.post("/inventory", async (req, res) => {
    try {
        const { vehicle, station } = req.body;
        const stationData = await mongoose.model("Station").findOne({ _id: station });
        if (!station) {
            return res.status(404).send("Station not found");
        }
        let stationCapacity = stationData.capacity;
        let vehicleCount = await mongoose.model("Inventory").countDocuments({ station: req.body.station });
        const inventoryData = await Inventory.findOne({ vehicle });
        if (!inventoryData) {
            if (stationCapacity > vehicleCount) {
                const inventory = new Inventory({
                    vehicle,
                    station
                });
                inventory.save(function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.send('<script>alert("inventory successfully added!!!"); window.location.href = "/station/assign" </script>')
                    }
                });
            } else {
                res.send('<script>alert("Station limit reached!!!"); window.location.href = "/station/assign" </script>')
            }
        } else {
            res.send('<script>alert("Vehicle already assigned to a station!!!"); window.location.href = "/station/assign" </script>')
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
});




app.get("/station/list", async (req, res) => {
    let stations = await mongoose.model("Station").find();
    const inventory = [];
    const selectedStation = { location: '' };
    res.render("bookVehicle", { inventory, stations, selectedStation });
});

app.post("/station/list", async (req, res) => {
    if (!req.body.station) {
        res.send('<script>alert("please select an option from the dropdown menu!!!"); window.location.href = "/station/list" </script>')
    }
    let stations = await mongoose.model("Station").find();
    const inventory = await mongoose.model("Inventory").find({ available: true, station: req.body.station }).populate(['station', 'vehicle']);
    const selectedStation = await mongoose.model("Station").findOne({ _id: req.body.station });
    res.render("bookVehicle", { inventory, stations, selectedStation });
});



const port = 3000;
app.listen(port, function () {
    console.log("Server is running on Port: " + port);
});
