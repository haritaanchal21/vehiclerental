'use strict';
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const session = require('express-session');
const flash = require('connect-flash');
const multer = require('multer');
const qrcode = require('qrcode');
const qrcodeR = require('qrcode-reader');
var Jimp = require("jimp");
var fs = require('fs')
var qrCode1 = require('qrcode-reader');

//const MongoStore = require('connect-mongo');
const accountSid = "ACf06fa06dddd719cb7e4a9b79e150dfc1";
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = "VAb16aa86f57f53474d36cc4b67b5490e6";
const client = require("twilio")(accountSid, authToken);
const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.static("public"));
app.use(flash());
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

app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: false,
    //store: MongoStore.create({ mongooseConnection: mongoose.connection })
}));


//userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });

const User = require("./models/user");
const Vehicle = require("./models/vehicle");
const Station = require("./models/station");
const Inventory = require("./models/inventory");
const Booking = require("./models/booking");

function checkAuthentication(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect("/login");
    }
}
app.get("/", function (req, res) {
    res.render("home");
});
app.get("/login", function (req, res) {
    let errorMessage = req.session.errorMessage;
    req.session.errorMessage = null;
    res.render("login", { errorMessage, phone: '' });
});
app.get("/landing", checkAuthentication, function (req, res) {
    res.render("landing", { inventory: req.session.user.inventory ? req.session.user.inventory : {} });
});
app.get("/adminLanding", checkAuthentication, function (req, res) {
    res.render("adminLanding", { inventory: req.session.user.inventory ? req.session.user.inventory : {} });
});
app.get("/vehicle", checkAuthentication, function (req, res) {
    let errorMessage = req.session.errorMessage;
    req.session.errorMessage = null;
    res.render("vehicle", { errorMessage });
});
app.get("/station", checkAuthentication, function (req, res) {
    let errorMessage = req.session.errorMessage;
    req.session.errorMessage = null;
    res.render("station", { errorMessage });
});
app.get("/station/list", checkAuthentication, async (req, res) => {
    let errorMessage = req.session.errorMessage;
    console.log(errorMessage)
    req.session.errorMessage = null;
    let stations = await mongoose.model("Station").find();
    const inventory = [];
    const selectedStation = { location: "" };
    res.render("bookVehicle", { inventory, stations, selectedStation, errorMessage });
});
app.get("/booking/list", checkAuthentication, async (req, res) => {
    let stations = await mongoose.model("Station").find();
    let whereFilter = {};
    if (req.session.user.role !== 1) {
        whereFilter['userId'] = req.session.user.id;
    }
    let booking = await mongoose.model("Booking").find(whereFilter).populate(['userId', 'returnStationId', 'bookingStationId', 'vehicleId']);
    let errorMessage = req.session.errorMessage;
    req.session.errorMessage = null;
    res.render("bookingList", { booking, stations, errorMessage });
});
app.get("/logout", async (req, res) => {
    req.session.destroy();
    res.redirect("login");
});
app.get("/station/assign", checkAuthentication, async (req, res) => {
    let errorMessage = req.session.errorMessage;
    req.session.errorMessage = null;
    let stations = await mongoose.model("Station").find();
    let vehicles = await mongoose.model("Vehicle").find();
    res.render("assign", { stations, vehicles, errorMessage });
});

app.post("/generateOtp", function (req, res) {
    let errorMessage = req.session.errorMessage;
    req.session.errorMessage = null;
    client.verify.v2
        .services(verifySid)
        .verifications.create({ to: `+91${req.body.phone}`, channel: "sms" })
        .then((verification) => {
            console.log('OTP sent successfullty', verification.status);
            res.render("login", { errorMessage, phone: req.body.phone });
        })
});
app.post("/login", function (req, res) {
    const phone = req.body.phone;
    const otp = req.body.otp;

    User.findOne({ phone: phone }, async (err, foundUser) => {
        if (!foundUser) {
            const newUser = new User({
                phone: req.body.phone,
                role: 2
            });
            newUser.save(function (err) {
                if (err) {
                    console.log(err);
                } else {
                    if (!req.session.user) {
                        req.session.user = { phone: req.body.phone, id: newUser._id, errorMessage: '', role: newUser.role };
                    }
                    foundUser = newUser;
                }
            });
        }
        const inventory = await mongoose.model("Inventory").find().populate(['station', 'vehicle']);
        client.verify.v2
            .services(verifySid)
            .verificationChecks.create({ to: `+91${phone}`, code: otp })
            .then((verification_check) => {
                console.log('OTP verification status', verification_check.status);
                if (verification_check.status === 'approved') {
                    if (!req.session.user) {
                        req.session.user = { phone: phone, id: foundUser._id, errorMessage: '', role: foundUser.role, inventory: inventory };
                    }
                    if (foundUser.role === 1) {
                        res.redirect("/adminLanding");
                    } else {
                        res.redirect("/landing");
                    }
                } else {
                    req.session.errorMessage = "Wrong Otp";
                    return res.redirect('/login');
                }
            })
            .catch(err => console.log(err ? err : 'errored'));
    });
});

app.post("/station/register", function (req, res) {
    Station.findOne({ location: req.body.location }, function (err, foundUser) {
        if (foundUser) {
            req.session.errorMessage = "station already exist, redirecting to station adding page!!!";
            return res.redirect('/station');
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
                    req.session.errorMessage = "station successfully added!!!";
                    return res.redirect('/station');
                }
            });
        }
    });
});

app.post("/vehicle/register", function (req, res) {
    Vehicle.findOne({ licensePlate: req.body.license_Plate }, function (err, foundUser) {
        if (foundUser) {
            req.session.errorMessage = "vehicle already exist, redirecting to vehicle adding page!!!";
            return res.redirect('/vehicle');
        } else {
            qrcode.toDataURL(req.body.license_Plate, (err, url) => {
                const newVehicle = new Vehicle({
                    make: req.body.make,
                    model: req.body.model,
                    licensePlate: req.body.license_Plate,
                    qrCode: url
                });
                newVehicle.save(function (err) {
                    if (err) {
                        console.log(err);
                    } else {
                        req.session.errorMessage = "vehicle successfully added!!!";
                        return res.redirect('/vehicle');
                    }
                });
            });
        }
    });
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
                        req.session.errorMessage = "inventory successfully added!!!";
                        return res.redirect('/station/assign');
                    }
                });
            } else {
                req.session.errorMessage = "Station limit reached!!!";
                return res.redirect('/station/assign');
            }
        } else {
            req.session.errorMessage = "Vehicle already assigned to a station!!!";
            return res.redirect('/station/assign');
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.post("/station/list", async (req, res) => {
    let errorMessage = req.session.errorMessage;
    req.session.errorMessage = null;
    if (!req.body.station) {
        req.session.errorMessage = "please select an option from the dropdown menu!!!";
        return res.redirect('/station/list');
    }
    let stations = await mongoose.model("Station").find();
    const inventory = await mongoose.model("Inventory").find({ available: true, station: req.body.station }).populate(['station', 'vehicle']);
    const selectedStation = await mongoose.model("Station").findOne({ _id: req.body.station });
    res.render("bookVehicle", { inventory, stations, selectedStation, errorMessage });
});


app.post("/vehicle/book", upload.single("file"), async (req, res) => {

    try {

        let uploadedImage = await new Promise((resolve, reject) => {
            Jimp.read(req.file.buffer, function (err, image) {
                if (err) {
                    console.error(err);
                }
                let qr = new qrCode1();
                qr.callback = function (err, value) {
                    if (err) reject(err);
                    resolve(value.result);
                };
                qr.decode(image.bitmap);
            });
        });

        const { selectedStationId } = req.body;
        let url = await new Promise((resolve, reject) => {
            qrcode.toDataURL(uploadedImage, (err, url) => {
                if (err) reject(err);
                resolve(url);
            });
        });

        const vehicleData = await mongoose.model("Vehicle").findOne({
            qrCode: url
        });
        if (!vehicleData) {
            req.session.errorMessage = "Vehicle does not exist!!!";
            return res.redirect('/station/list');
        }
        const inventory = await mongoose.model("Inventory").findOne({ station: selectedStationId, vehicle: vehicleData._id });
        if (!inventory) {
            req.session.errorMessage = "Inventory does not exist!!!";
            return res.redirect('/station/list');
        }
        if (inventory.available) {
            console.log(req.session.user.id)
            console.log(req.session.user.phone)
            const booking = new Booking({
                userId: req.session.user.id,
                vehicleId: vehicleData._id,
                bookingDate: new Date,
                bookingStationId: selectedStationId,
            });
            booking.save(async (err, bookingData) => {
                if (bookingData) {
                    await Inventory.updateOne({ _id: inventory._id }, { $set: { booking: bookingData._id, available: false } });
                    req.session.errorMessage = "Vehicle booked successfully!!!";
                    return res.redirect('/booking/list');
                } else {
                    console.log(err);
                }
            });
        } else {
            req.session.errorMessage = "Vehicle already booked!!!";
            return res.redirect('/station/list');
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
});


app.post("/booking/return", async (req, res) => {
    try {
        const { bookingId, returnStationId } = req.body;
        if (!bookingId) {
            res.send('<script>alert("Booking not found!!!"); window.location.href = "/booking/list" </script>')
        }
        const inventory = await mongoose.model("Inventory").findOne({ booking: bookingId });
        if (!inventory) {
            res.send('<script>alert("Inventory does not exist!!!"); window.location.href = "/booking/list" </script>')
        }
        let vehicleCount = await mongoose.model("Inventory").countDocuments({ station: returnStationId });
        let stationData = await Station.findOne({ _id: returnStationId });
        if (stationData.capacity <= vehicleCount) {
            res.send('<script>alert("Station fully occupied, please return through some other station !!!"); window.location.href = "/booking/list" </script>')
        } else {
            await Booking.updateOne({ _id: bookingId }, { $set: { returnDate: new Date, returnStationId: returnStationId, isReturned: true } });
            await Inventory.updateOne({ _id: inventory._id }, { $set: { booking: null, station: returnStationId, available: true } });
        }
        return res.redirect('/booking/list');
    } catch (err) {
        res.status(500).send(err.message);
    }
});
app.post("/land", async (req, res) => {
    if (req.session.user.role === 1) {
        res.redirect("/adminLanding");
    } else {
        res.redirect("/landing");
    }
});

const port = 3000;
app.listen(port, function () {
    console.log("Server is running on Port: " + port);
});
