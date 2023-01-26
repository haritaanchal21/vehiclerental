var mongoose = require("mongoose");
//const { DateTime } = require("luxon"); // for date handling

var Schema = mongoose.Schema;

const VehicleSchema = new mongoose.Schema({
    make: String,
    model: String,
    licensePlate: String,
    qrCode: Buffer
});


const Vehicle = mongoose.model('Vehicle', VehicleSchema);

module.exports = Vehicle;
