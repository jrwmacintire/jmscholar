const nameRegExp = /^[a-zA-Z0-9 ]*$/;

function validateName(string) {
    if(string == undefined || string.length === 0) return false;
    return nameRegExp.test(string);
}

module.exports = validateName;
