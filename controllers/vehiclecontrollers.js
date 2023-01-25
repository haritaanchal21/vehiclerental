const Vehicle = require('../models/vehicle');

exports.create = (req, res) => {
    const { make, model, licensePlate } = req.body;
    // Implement admin authentication here...
    const vehicle = new Vehicle({ make, model, licensePlate });
    vehicle.save((err, vehicle) => {
        if (err) return res.status(500).send(err);
        // Generate QR code for vehicle here...
        return res.status(201).send(vehicle);
    });
};

exports.list = (req, res) => {
    Vehicle.find({}, (err, vehicles) => {
        if (err) return res.status(500).send(err);
        return res.status(200).send(vehicles);
    });
};

exports.get = (req, res) => {
    const { id } = req.params;
    Vehicle.findById(id, (err, vehicle) => {
        if (err) return res.status(500).send(err);
        if (!vehicle) return res.status(404).send({ message: 'Vehicle not found' });
        return res.status(200).send(vehicle);
    });
};

exports.update = (req, res) => {
    const { id } = req.params;
    const { make, model, licensePlate } = req.body;
    // Implement admin authentication here...
    Vehicle.findByIdAndUpdate(id, { make, model, licensePlate }, (err, vehicle) => {
        if (err) return res.status(500).send(err);
        if (!vehicle) return res.status(404).send({ message: 'Vehicle not found' });
        return res.status(200).send({ message: 'Vehicle updated' });
    });
};

exports.delete = (req, res) => {
    const { id } = req.params;
    // Implement admin authentication here...
    Vehicle.findByIdAndDelete(id, (err, vehicle) => {
        if (err) return res.status(500).send(err);
        if (!vehicle) return res.status(404).send({ message: 'Vehicle not found' });
        return res.status(200).send({ message: 'Vehicle deleted' });
    });
};
