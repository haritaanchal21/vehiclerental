const mongoose = require('mongoose');

const StationSchema = new mongoose.Schema({
    name: String,
    location: String,
    capacity: Number
});

const Station = mongoose.model('Station', StationSchema);

module.exports = Station;
