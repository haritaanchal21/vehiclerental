const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  bookingDate: { type: Date, required: true },
  returnDate: { type: Date, default: null },
  returnStationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', default: null },
  bookingStationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Station' },
  isReturned: { type: Boolean, default: false }
});

const Booking = mongoose.model('Booking', BookingSchema);

module.exports = Booking;
