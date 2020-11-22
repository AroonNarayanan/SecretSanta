module.exports.generateFamilyId = function() {
    return Math.floor(Math.random() * 100000).toString();
}

module.exports.generatePin = function() {
    return Math.floor(Math.random() * 100000).toString();
}