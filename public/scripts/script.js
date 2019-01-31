const submitEssayButton = document.getElementById('#essaySubmit');
const tester = document.getElementById('input#test');

tester.addEventListener('click', event => {
    console.log(`Registered click on 'tester'`, event);
});
