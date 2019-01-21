const validateMimetype = require('./validateMimetype');

function validateEssaySubmission(file) {
    // console.log(`\n\tValidating Essay Submission -`);
    const { name, mimetype, data } = file;
    // console.log(`\tname: ${name} | mimetype: ${mimetype} | data: ${typeof data}`);

    const fileNameRegex = /^[\w,\s-_]+\.[a-zA-Z]{3}$/;
    const validName = name.match(fileNameRegex);

    const validMimetype = validateMimetype(mimetype);

    if(validName) {
        // console.log(`Name - ${name} - is valid, so far`);
        return true;
    } else {
        // console.log(`Invalid name - ${name}`);
        return false;
    }

}

module.exports = validateEssaySubmission;
