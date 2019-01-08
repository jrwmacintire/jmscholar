const assert = require('assert');
const validateName = require('../lib/validateName');

describe('validateName.js', () => {

     it('returns true when given a valid name.', () => {
         const validName = 'John McTest';
         const result = validateName(validName);
         assert.equal(result, true);
     });

     it('returns false when given invalid symbols.', () => {
         const invalidName = 'Jo^hn McTes^t';
         const result = validateName(invalidName);
         assert.equal(result, false);
     });
 });
