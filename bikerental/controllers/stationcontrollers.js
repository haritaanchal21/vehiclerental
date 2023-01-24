const Station = require('../models/station');

exports.create = (req, res) => {
    const { location, capacity } = req.body;
    // Implement admin authentication here...
    const station = new Station({ location, capacity });
    station.save((err, station) => {
        if (err) return res.status(500).send(err);
        return res.status(201).send(station);
    });
};

exports.list = (req, res) => {
    Station.find({}, (err, stations) => {
        if (err) return res.status(500).send(err);
        return res.status(200).send(stations);
    });
};

exports.get = (req, res) => {
    const { id } = req.params;
    Station.findById(id, (err, station) => {
        if (err) return res.status(500).send(err);
        if (!station) return res.status(404).send({ message: 'Station not found' });
        return res.status(200).send(station);
    });
};

exports.update = (req, res) => {
    const { id } = req.params;
    const { location, capacity } = req.body;
    // Implement admin authentication here...
    Station.findByIdAndUpdate(id, { location, capacity }, (err, station) => {
        if (err) return res.status(500).send(err);
        if (!station) return res.status(404).send({ message: 'Station not found' });
        return res.status(200).send({ message: 'Station updated' });
    });
};

exports.delete = (req, res) => {
    const { id } = req.params;
    // Implement admin authentication here...
    Station.findByIdAndDelete(id, (err, station) => {
        if (err) return res.status(500).send(err);
        if (!station) return res.status(404).send({ message: 'Station not found' });
        return res.status(200).send({ message: 'Station deleted' });
    });
};
