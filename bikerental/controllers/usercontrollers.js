const User = require('../models/user');

exports.register = (req, res) => {
    const { phoneNumber, name, email } = req.body;
    // Implement OTP generation and sending here...
    const user = new User({ phoneNumber, name, email });
    user.save((err, user) => {
        if (err) return res.status(500).send(err);
        return res.status(201).send(user);
    });
};

exports.verify = (req, res) => {
    const { phoneNumber, otp } = req.body;
    User.findOneAndUpdate({ phoneNumber, otp }, { isVerified: true }, (err, user) => {
        if (err) return res.status(500).send(err);
        if (!user) return res.status(404).send({ message: 'Invalid OTP or phone number' });
        return res.status(200).send({ message: 'Account verified' });
    });
};

