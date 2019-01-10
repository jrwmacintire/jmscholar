// Include the cluster module
var cluster = require('cluster');

// Code to run if we're in the master process
if (cluster.isMaster) {

    // Count the machine's CPUs
    var cpuCount = require('os').cpus().length;

    // Create a worker for each CPU
    for (var i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }

    // Listen for terminating workers
    cluster.on('exit', function (worker) {

        // Replace the terminated workers
        console.log('Worker ' + worker.id + ' died :(');
        cluster.fork();

    });

// Code to run if we're in a worker process
} else {
    var AWS = require('aws-sdk');
    var express = require('express');
    var bodyParser = require('body-parser');
    var path = require('path');

    const validateName = require('./lib/validateName');
    const validateEmail = require('./lib/validateEmail');
    const validatePhoneNumber = require('./lib/validatePhoneNumber');

    AWS.config.region = process.env.REGION;

    var sns = new AWS.SNS();
    var ddb = new AWS.DynamoDB({ region: 'us-west-2' });

    // console.log('process.env.REGION: ', process.env.REGION);

    var ddbTable =  process.env.STARTUP_SIGNUP_TABLE;
    // console.log(`process.env.STARTUP_SIGNUP_TABLE: ${process.env.STARTUP_SIGNUP_TABLE}`);
    // console.log(process.env.TEST);
    var snsTopic =  process.env.NEW_SIGNUP_TOPIC;
    var app = express();

    app.set('view engine', 'pug');
    app.set('views', './public/views');
    app.use(express.static(__dirname + '/public'));
    app.use(bodyParser.urlencoded({extended:false}));

    app.get('/', function(req, res) {
        res.render('index', {
            static_path: 'static',
            theme: process.env.THEME || 'flatly',
            flask_debug: process.env.FLASK_DEBUG || 'false'
        });
    });

    app.post('/register-hs', function(req, res) {
        console.log('\nreq.body:\n', req.body);

        const { name, email, phone } = req.body;

        function validateItem(obj) {
            const validName = validateName(name);
            const validEmail = validateEmail(email);
            const validPhone = validatePhoneNumber(phone);

            if(validName && validEmail && validPhone) {
                console.log('\nName, email, and phone number are valid!!');
                res.status(200).send({
                    message: 'Success - name, email, and phone number are all valid!',
                    name: name,
                    email: email,
                    phone: phone
                });
            } else {
                console.error('Error: validation failed.', `name: ${validName} | email: ${validEmail} | phone: ${validPhone}`);
                res.status(400).send({
                    errorMessage: 'Validation failed. Name, email, or phone number are invalid.',
                    name: name,
                    validName: validName,
                    email: email,
                    validEmail: validEmail,
                    phone: phone,
                    validPhone: validPhone
                });
            }

        }

        var item = {
            'email': {'S': req.body.email },
            'name': {'S': req.body.name },
            'participating': { 'S': req.body.participating },
            'phone': {'S': req.body.phone },
            'hsName': { 'S': req.body.hsName },
            'hsCode': { 'S': req.body.hsCode },
            'title': { 'S': req.body.title },
            'city': { 'S': req.body.city },
            'state': { 'S': req.body.state },
            'ac1Name': { 'S': req.body.ac1Name },
            'ac1Title': { 'S': req.body.ac1Title },
            'ac1Email': { 'S': req.body.ac1Email },
            'ac1Phone': { 'S': req.body.ac1Phone},
            'ac2Name': { 'S': req.body.ac2Name },
            'ac2Title': { 'S': req.body.ac2Title },
            'ac2Email': { 'S': req.body.ac2Email },
            'ac2Phone': { 'S': req.body.ac2Phone}
        };

        console.log('\nitem:\n',item);

        const validItem = validateItem(req.body);

        if(validItem){
            ddb.putItem({
                'TableName': 'jmscholar-db', // changed from 'ddbTable' to 'jmscholar-db' string
                'Item': item,
                'Expected': { email: { Exists: false } }
            }, function(err, data) {
                if (err) {
                    var returnStatus = 500;
                    // console.log(err);

                    if (err.code === 'ConditionalCheckFailedException') {
                        returnStatus = 409;
                    }

                    console.log('DDB Error: ' + err);
                    res.status(returnStatus).send(err);
                } else {
                    sns.publish({
                        'Message': 'Name: ' + req.body.name + "\r\nEmail: " + req.body.email
                                            + "\r\nParticipating: " + req.body.participating
                                            + "\r\nTheme: " + req.body.theme,
                        'Subject': 'New High School Request Form - JMScholar.org',
                        'TopicArn': snsTopic
                    }, function(err, data) {
                        if (err) {
                            res.status(500).end();
                            console.log('SNS Error: ' + err);
                        } else {
                            res.status(201).end();
                        }
                    });
                }
            });}
    });

    app.post('/register-student', (req, res) => {
        console.log(`\nReceived POST request at '/register-student'!`, '\nreq.body:\n', req.body);
        res.status(201).send(`Response from '/register-student'!`)
    });

    var port = process.env.PORT || 3000;

    var server = app.listen(port, function () {
        console.log('Server running at http://127.0.0.1:' + port + '/');
    });
}
