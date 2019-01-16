const validateName = require('./validateName');
const validateEmail = require('./validateEmail');
const validatePhoneNumber = require('./validatePhoneNumber');
const shortid = require('shortid');

function validateItem(obj) {
    if(obj !== null) {
        const { name, email, phone } = obj;

        obj['id'] = shortid.generate();

        const objAttributes = Object.keys(obj);
        // console.log(`\nobjAttributes:\n`, objAttributes);

        let validatedItem = {};

        objAttributes.forEach(attr => {
            // console.log(`\nattr: ${attr}`);

            // Change empty strings into 'no user input' values
            if(obj[attr] == '') {
                validatedItem[attr] = { 'S': 'no user input' };
            } // change obj.participating value to boolean
            else if(attr == 'participating') {
                if(obj[attr] == 'participating') validatedItem[attr] = { 'BOOL': true };
                else validatedItem[attr] = { 'BOOL': false };
            } else { // valid item, add to validated object
                validatedItem[attr] = { 'S': obj[attr] };
            }
        });

        console.log('\nvalidatedItem:\n', validatedItem);

        const validName = validateName(name);
        const validEmail = validateEmail(email);
        const validPhone = validatePhoneNumber(phone);

        if(validName && validEmail && validPhone) {
            console.log('\nName, email, and phone number are valid!!');
            return {
                valid: true,
                item: validatedItem
            };
        } else {
            console.error('Error: validation failed.', `name: ${validName} | email: ${validEmail} | phone: ${validPhone}`);
            return {
                valid: false,
                item: obj
            };
        }
    } else {
        return {
            valid: false,
            message: 'Object to be validated was null or empty.',
            item: obj
        }
    }
}

module.exports = validateItem;