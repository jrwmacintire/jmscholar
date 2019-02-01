const firstName = document.getElementById('firstName'),
      middleName = document.getElementById('middleName'),
      lastName = document.getElementById('lastName'),
      email = document.getElementById('email'),
      userId = document.getElementById('userId'),
      essaySubmit = document.getElementById('essaySubmit'),
      form = document.getElementById('essaySubmissionForm');

firstName.addEventListener('keyup', (event) => {
    // console.log(event);
    // console.log(validateName(`valid firstName: ${firstName.value}`));
    const validName = validateName(firstName.value);
    displayInputBorder('firstName', validName);
});

middleName.addEventListener('keyup', (event) => {
    // console.log(event);
    // console.log(validateName(`valid middleName: ${middleName.value}`));
    const validName = validateName(middleName.value);
    displayInputBorder('middleName', validName);
});

lastName.addEventListener('keyup', (event) => {
    // console.log(event);
    // console.log(validateName(`valid lastName: ${lastName.value}`));
    const validName = validateName(lastName.value);
    displayInputBorder('lastName', validName);
});

userId.addEventListener('keyup', (event) => {
    const validUserId = validateUserId(userId.value);
    displayInputBorder('userId', validUserId);
});

email.addEventListener('keyup', (event) => {
    // console.log(event);
    // console.log(validateEmail(`valid email: ${email.value}`));
    const validEmail = validateEmail(email.value);
    displayInputBorder('email', validEmail);
});

// essaySubmit.addEventListener('click', event => {
//     event.preventDefault();
//     console.log('Submit was clicked!');
//     // get value of the ID 'input' field
//     // send ID to server at new endpoint (?)
//     // if response says to go ahead, send formData
//     // error should highlight the ID field and prevent form submission!
//     const formData = new FormData(form);
//
//     fetch(`/validate-userid?inputUserId=${userId.value}&inputEmail=${email.value}`).then(response => {
//         console.log('Response from userId validation endpoint!\n', response.body);
//     });
});

function validateName(name) {
    console.log(`Validating name client-side! name: ${name}`);
    const nameRegExp = /^[a-zA-Z0-9 ]*$/;
    return nameRegExp.test(name);
}

function validateEmail() {
    console.log(`Validating email client-side! email: ${email.value}`);
    const emailRegExp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegExp.test(email.value);
}

function validateUserId(id) {
    return id.length > 8;
}

function displayInputBorder(inputId, validInput) {
    const input = document.querySelector(`input#${inputId}`);
    if(validInput) input.style.border = '2px lightgreen solid';
    else input.style.border = '2px red solid';
}
