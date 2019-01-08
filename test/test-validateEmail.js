const assert = require('assert');
const validateEmail = require('../lib/validateEmail');

describe('validateEmail.js', () => {
    it('return true when a valid email is given.', () => {
        const validEmail = 'test@testing.com';
        const result = validateEmail(validEmail);
        assert.equal(result, true);
    });

    it('returns false when @ symbol is missing from given email.', () => {
        const invalidEmail = 'testtesting.com';
        const result = validateEmail(invalidEmail);
        assert.equal(result, false);
    });

    it('returns false when all symbols are missing from given email.', () => {
        const invalidEmail = 'testtestingcom';
        const result = validateEmail(invalidEmail);
        assert.equal(result, false);
    });

 });
