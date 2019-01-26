const validateMimetype = require('./validateMimetype');

function validateEssaySubmission(file) {
    // console.log(`\n\tValidating Essay Submission -`);
    const { name, mimetype, data } = file;
    console.log(`\tname: ${name} | mimetype: ${mimetype} | data: ${typeof data}`);

    const fileNameRegex = /([a-zA-Z0-9\s_\\.\-\(\):])+(.doc|.docx|.pdf|.rtf|.odt|.txt)$/i;
    const validName = fileNameRegex.test(name);
    const validMimetype = validateMimetype(mimetype);

    console.log(`\tvalid name: ${validName} | valid mimetype: ${validMimetype}`);
    if(validName && validMimetype && file.data) {
        // console.log(`valid name - ${name} - valid mimetype - ${mimetype}`);
        return true;
    } else {
        // console.log(`Invalid name - ${name}`);
        return false;
    }
}

module.exports = validateEssaySubmission;
