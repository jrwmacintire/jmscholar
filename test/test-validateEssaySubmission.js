const assert = require('assert');
const validateEssaySubmission = require('../lib/validateEssaySubmission');
const fs = require('fs');

describe('validateEssaySubmission.js', () => {
    const validFile = {
        name: 'sample.txt',
        mimetype: 'text/plain',
    }
    const invalidFile = {
        name: 'sa@#$#ple.txt',
        mimetype: 'tortoise'
    }

     it('return true when file exists.', () => {
         assert.equal(true, validateEssaySubmission(validFile));
     });

     it('return false when mimetype is unsupported.', function(){
         assert.equal(false, validateEssaySubmission(invalidFile));
     });

     it('return true when name is valid.', function(){
         assert.equal(true, validateEssaySubmission(validFile));
     });

     it('return false when name is invalid - contains invalid characters.', function(){
         assert.equal(false, validateEssaySubmission(invalidFile));
     });

 });
