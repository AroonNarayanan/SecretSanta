module.exports.generateFamilyId = function() {
    return '9'+ Math.floor(Math.random() * 100000).toString().padStart(5,'0');
}

module.exports.generatePin = function() {
    return '9'+ Math.floor(Math.random() * 100000).toString().padStart(5,'0');
}

module.exports.isLegacyPin = function(pin) {
    return !(pin && pin.length === 6 && pin[0] === '9');
}