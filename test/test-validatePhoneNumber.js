const assert = require('assert');
const validatePhoneNumber = require('../lib/validatePhoneNumber');

describe('validatePhoneNumber.js', () => {
     it('returns true on phone number with hyphens.', () => {
         const number = '520-200-0000';
         const result = validatePhoneNumber(number);
         assert.equal(result, true);
     });

     it('returns true on phone number without symbols.', () => {
         const number = '5202000000';
         const result = validatePhoneNumber(number);
         assert.equal(result, true);
     });

     it('returns true on phone number with parentheses and hyphens.', () => {
         const number = '(520)-200-0000';
         const result = validatePhoneNumber(number);
         assert.equal(result, true);
     });

     it('returns false on phone number without area code.', () => {
         const number = '2000000';
         const result = validatePhoneNumber(number);
         assert.equal(result, false);
     });

     it('returns false on phone number with letters.', function(){
         const number = '520-a00-0000';
         const result = validatePhoneNumber(number);
         assert.equal(result, false);
     });

 });
