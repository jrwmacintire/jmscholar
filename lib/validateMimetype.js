const validMimetypes = [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/rtf',
    'application/vnd.oasis.opendocument.text',
    'application/pdf'
];

function validateMimetype(mimetype) {
    // console.log(`mimetype received: ${mimetype}`);
    const index = validMimetypes.indexOf(mimetype);
    // console.log(`index of received mimetype - ${index}`);
    if(index >= 0) return true;
    else return false;
}

module.exports = validateMimetype;
