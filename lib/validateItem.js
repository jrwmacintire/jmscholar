const validateName = require('./validateName');
const validateEmail = require('./validateEmail');
const validatePhoneNumber = require('./validatePhoneNumber');

function validateItem(obj) {
    const { name, email, phone } = obj;

    const item = {
        'email': {'S': obj.email },
        'name': {'S': obj.name },
        'participating': { 'S': obj.participating },
        'phone': {'S': obj.phone },
        'hsName': { 'S': obj.hsName },
        'hsCode': { 'S': obj.hsCode },
        'title': { 'S': obj.title },
        'city': { 'S': obj.city },
        'state': { 'S': obj.state },
        'ac1Name': { 'S': obj.ac1Name },
        'ac1Title': { 'S': obj.ac1Title },
        'ac1Email': { 'S': obj.ac1Email },
        'ac1Phone': { 'S': obj.ac1Phone},
        'ac2Name': { 'S': obj.ac2Name },
        'ac2Title': { 'S': obj.ac2Title },
        'ac2Email': { 'S': obj.ac2Email },
        'ac2Phone': { 'S': obj.ac2Phone}
    };
    // console.log('\nitem:\n',item);

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
        return false;
    }
}

module.exports = validateItem;
