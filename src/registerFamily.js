const {generateFamilyId, generatePin} = require('./utils');
const {Family, FamilyMember} = require('../models')
const Shuffle = require('shuffle-array')

module.exports.registerFamily = async function(familyNamesAndInterests, budget, due) {
    Shuffle(familyNamesAndInterests);
    const family = new Family({
        familyId: generateFamilyId(),
        budget: budget,
        due: due
    });
    const familyMembers = familyNamesAndInterests.map(familyMember => {
        return new FamilyMember({
            name: familyMember.name,
            pin: generatePin(),
            interests: familyMember.interests,
            family: family._id
        });
    });
    familyMembers.forEach((familyMember, i) => {
        familyMember.giftee = familyMembers[(i + 1) % familyMembers.length]._id;
    });
    family.members = familyMembers.map(familyMember => familyMember._id);
    const familyMemberSavePromises = familyMembers.map(familyMember => familyMember.save());
    await family.save();
    await Promise.all(familyMemberSavePromises);
    return await Family.find({_id: family._id}).populate({
        path: 'members',
        model: 'FamilyMember',
        populate: {
            path: 'giftee',
            model: 'FamilyMember'
        }
    }).exec();
}