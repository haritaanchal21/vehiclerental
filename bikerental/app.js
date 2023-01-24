'use strict';
const express = require("express");
const mongoose =require("mongoose");

var uri = "mongodb://127.0.0.1:27017/details";


mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
    if (err) {
        console.log(err);
        return;
    }
    console.log('Successfully connected to the database');
});

mongoose.connection.on('connected', () => {
    console.log('Mongoose default connection open');
});

console.log("hello world")
const port = 3000;
const app = express();
app.listen(port, function () {
    console.log("Server is running on Port: " + port);
});
