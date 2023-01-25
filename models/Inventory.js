const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
    vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
    station: { type: mongoose.Schema.Types.ObjectId, ref: 'Station' },
    available: { type: Boolean, default: true },
    //booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }
});

const Inventory = mongoose.model('Inventory', InventorySchema);

module.exports = Inventory;
