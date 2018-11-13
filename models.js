const mongoose = require('mongoose');

const santaSchema = new mongoose.Schema({
    name: String,
    pin: String,
    familyId: String,
    giftee: String,
    budget: Number
    // gifteeInterests: String
});

module.exports.Santa = mongoose.model('Santa', santaSchema);