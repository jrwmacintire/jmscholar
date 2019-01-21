const assert = require('assert');
const validateMimetype = require('../lib/validateMimetype.js');

describe('validateMimetype.js', () => {
     it(`return true, mimetype is VALID. - type: 'text/plain'`, () => {
         const mimetype = 'text/plain';
         assert.equal(true, validateMimetype(mimetype));
     });

     it(`return true, mimetype is VALID. - type: 'application/vnd.oasis.opendocument.text'`, () => {
         const mimetype = 'application/vnd.oasis.opendocument.text';
         assert.equal(true, validateMimetype(mimetype));
     });

     it(`return true, mimetype is VALID. - type: 'application/rtf'`, () => {
         const mimetype = 'application/rtf';
         assert.equal(true, validateMimetype(mimetype));
     });

     it(`return true, mimetype is VALID. - type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'`, () => {
         const mimetype = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
         assert.equal(true, validateMimetype(mimetype));
     });

     it(`return true, mimetype is VALID. - type: 'application/msword'`, () => {
         const mimetype = 'application/msword';
         assert.equal(true, validateMimetype(mimetype));
     });

     it(`return true, mimetype is VALID. - type: 'application/pdf'`, () => {
         const mimetype = 'application/pdf';
         assert.equal(true, validateMimetype(mimetype));
     });

     it(`return false, mimetype is INVALID. - type: 'text/plain'`, () => {
         const mimetype = 'sxeerert/plaiewewern';
         assert.equal(false, validateMimetype(mimetype));
     });
 });
