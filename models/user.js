var mongoose = require("mongoose");
//const { DateTime } = require("luxon"); // for date handling

var Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
    phone: String,
    role: Number
});

const User = mongoose.model('User', userSchema);
module.exports = User;
