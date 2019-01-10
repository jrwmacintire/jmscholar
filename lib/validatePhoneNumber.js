const phoneNumberRegExp = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;

function validatePhoneNumber(string) {
    if(string === undefined || string.length === 0) return false;
    return phoneNumberRegExp.test(string);
}

module.exports = validatePhoneNumber;
