const validateName = require('./validateName');
const validateEmail = require('./validateEmail');
const validatePhoneNumber = require('./validatePhoneNumber');

function validateItem(obj) {
    const { name, email, phone } = obj;
    const validName = validateName(name);
    const validEmail = validateEmail(email);
    const validPhone = validatePhoneNumber(phone);

    if(validName && validEmail && validPhone) {
        console.log('\nName, email, and phone number are valid!!');
        return true;
    } else {
        console.error('Error: validation failed.', `name: ${validName} | email: ${validEmail} | phone: ${validPhone}`);
        return false;
    }
}

module.exports = validateItem;
