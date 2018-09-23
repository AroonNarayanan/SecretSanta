const mongoose = require('mongoose');

const santaSchema = new mongoose.Schema({
    name: String,
    pin: String,
    giftee: String
});

module.exports.Santa = mongoose.model('Santa', santaSchema);
