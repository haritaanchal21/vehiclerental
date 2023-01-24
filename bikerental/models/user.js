var mongoose = require("mongoose");
//const { DateTime } = require("luxon"); // for date handling

var Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema({
    phoneNumber: String,
    name: String,
    email: String,
    isVerified: { type: Boolean, default: false },
    otp: Number
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
