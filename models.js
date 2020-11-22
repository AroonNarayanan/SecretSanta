const mongoose = require('mongoose');

const santaSchema = new mongoose.Schema({
    name: String,
    pin: String,
    familyId: String,
    giftee: String,
    budget: String
    // gifteeInterests: String
});

module.exports.Santa = mongoose.model('Santa', santaSchema);

const familySchema = new mongoose.Schema({
    familyId: String,
    budget: String,
    due: Date,
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FamilyMember'
    }]
});

module.exports.Family = mongoose.model('Family', familySchema);

const familyMemberSchema = new mongoose.Schema({
    name: String,
    pin: String,
    giftee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FamilyMember'
    },
    interests: String,
    family: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Family'
    }
});

module.exports.FamilyMember = mongoose.model('FamilyMember', familyMemberSchema);