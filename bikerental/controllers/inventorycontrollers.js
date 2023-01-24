const Inventory = require('../models/inventory');
const Station = require('../models/station');
const Vehicle = require('../models/vehicle');
const Booking = require('../models/booking');

exports.add = (req, res) => {
    const { vehicleId, stationId } = req.body;
    // Implement admin authentication here...
    Vehicle.findById(vehicleId, (err, vehicle) => {
        if (err) return res.status(500).send(err);
        if (!vehicle) return res.status(404).send({ message: 'Vehicle not found' });
        Station.findById(stationId, (err, station) => {
            if (err) return res.status(500).send(err);
            if (!station) return res.status(404).send({ message: 'Station not found' });
            const inventory = new Inventory({ vehicle: vehicleId, station: stationId });
            inventory.save((err, inventory) => {
                if (err) return res.status(500).send(err);
                return res.status(201).send(inventory);
            });
        });
    });
};

exports.list = (req, res) => {
    Inventory.find({}, (err, inventories) => {
        if (err) return res.status(500).send(err);
        return res.status(200).send(inventories);
    });
};

exports.get = (req, res) => {
    const { id } = req.params;
    Inventory.findById(id, (err, inventory) => {
        if (err) return res.status(500).send(err);
        if (!inventory) return res.status(404).send({ message: 'Inventory not found' });
        return res.status(200).send(inventory);
    });
};

exports.update = (req, res) => {
    const { id } = req.params;
    const { vehicleId, stationId } = req.body;
    // Implement admin authentication here...
    Inventory.findById(id, (err, inventory) => {
        if (err) return res.status(500).send(err);
        if (!inventory) return res.status(404).send({ message: 'Inventory not found' });
        Vehicle.findById(vehicleId, (err, vehicle) => {
            if (err) return res.status(500).send(err);
            if (!vehicle) return res.status(404).send({ message: 'Vehicle not found' });
            Station.findById(stationId, (err, station) => {
                if (err) return res.status(500).send(err);
                if (!station) return res.status(404).send({ message: 'Station not found' });
                inventory.vehicle = vehicleId;
                inventory.station = stationId;
                inventory.save((err, inventory) => {
                    if (err) return res.status(500).send(err);
                    return res.status(200).send({ message: 'Inventory updated' });
                });
            });
        });
    });
};

exports.remove = (req, res) => {
    const { id } = req.params;
    // Implement admin authentication here...
    Inventory.findByIdAndDelete(id, (err, inventory) => {
        if (err) return res.status(500).send(err);
        if (!inventory) return res.status(404).send({ message: 'Inventory not found' });
        return res.status(200).send({ message: 'Inventory removed' });
    });
};

exports.book = (req, res) => {
    const { id, userId, startDate, endDate } = req.body;
// Implement user authentication here...
    () => {
        if (err) return res.status(500).send(err);
        if (!inventory) return res.status(404).send({ message: 'Inventory not found' });
        if (!inventory.available) return res.status(400).send({ message: 'Vehicle not available' });
        inventory.available = false;
        inventory.booking = new Booking({ user: userId, startDate, endDate });
        inventory.save((err, inventory) => {
            if (err) return res.status(500).send(err);
            return res.status(200).send({ message: 'Vehicle booked successfully' });
        });
    };
};

exports.return = (req, res) => {
    const { id } = req.params;
    const { returnStationId } = req.body;
    // Implement user authentication here...
    Inventory.findById(id, (err, inventory) => {
        if (err) return res.status(500).send(err);
        if (!inventory) return res.status(404).send({ message: 'Inventory not found' });
        if (inventory.available) return res.status(400).send({ message: 'Vehicle not booked' });
        Station.findById(returnStationId, (err, station) => {
            if (err) return res.status(500).send(err);
            if (!station) return res.status(404).send({ message: 'Station not found' });
            inventory.station = returnStationId;
            inventory.available = true;
            inventory.booking = null;
            inventory.save((err, inventory) => {
                if (err) return res.status(500).send(err);
                return res.status(200).send({ message: 'Vehicle returned successfully' });
            });
        });
    });
};