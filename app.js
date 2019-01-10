
// Include the cluster module
const cluster = require('cluster');

// Code to run if we're in the master process
if (cluster.isMaster) {

    // Count the machine's CPUs
    const cpuCount = require('os').cpus().length;

    // Create a worker for each CPU
    for (let i = 0; i < cpuCount; i += 1) {
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
    const AWS = require('aws-sdk');
    const express = require('express');
    const bodyParser = require('body-parser');
    const path = require('path');
    const validateEmail = require('./lib/validateEmail');
    const validateName = require('./lib/validateName');
    const validatePhoneNumber = require('./lib/validatePhoneNumber');

    AWS.config.update = { region: 'us-west-2' };

    const sns = new AWS.SNS();
    const ddb = new AWS.DynamoDB({ region: 'us-west-2' });

    // ddb.listTables({ Limit: 5 }, (err, data) => {
    //     if(err) console.log('Error:\n', err);
    //     else console.log('Tables names are:\n', data.TableNames);
    // })
    // console.log('process.env.REGION: ', process.env.REGION);

    const ddbTable =  process.env.STARTUP_SIGNUP_TABLE;
    // console.log(`process.env.STARTUP_SIGNUP_TABLE: ${process.env.STARTUP_SIGNUP_TABLE}`);
    // console.log(process.env.TEST);
    const snsTopic =  process.env.NEW_SIGNUP_TOPIC;
    const app = express();

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

        const item = {
            'email': {'S': req.body.email},
            'name': {'S': req.body.name},
            'participating': {'S': req.body.participating},
        };
        // console.log('\nitem:\n',item);

        function validateItem(obj) {
            console.log('\nValidate item:\n', obj);
            // Validating required fields:
            // name, email, phone, HS name, title, city, state, and 'Participating' status
            const validName = validateName(obj.name);
            const validEmail = validateEmail(obj.email);
            const validPhoneNumber = validatePhoneNumber(obj.phone);

            // console.log(`validName: ${validName} - validEmail: ${validEmail} - validPhoneNumber: ${validPhoneNumber}`);
            console.log(`obj.name: ${obj.name} | obj.email: ${obj.email} | obj.phone: ${obj.phone}`);

            // Checking for the non-required fields
            if(validName && validEmail && validPhoneNumber) {
                return true;
            } else {
                console.log('Failed to validate fields.', `validName: ${validName} - validEmail: ${validEmail} - validPhoneNumber: ${validPhoneNumber}`);
                return false;
            }
        }

        const validItem = validateItem(req.body);

        if(validItem){
            console.log('Item is valid. Validated email, name, and phone number!');
            ddb.putItem({
                'TableName': 'jmscholar-db', // changed from 'ddbTable' to 'jmscholar-db' string
                'Item': item,
                'Expected': { email: { Exists: false } }
            }, function(err, data) {
                if (err) {
                    const returnStatus = 500;
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
            });
        } else {
            res.status(400).send({
                error: 'Object contains validation errors.',
                item: item
            });
        }
    });

    app.post('/register-student', (req, res) => {
        console.log(`\nReceived POST request at '/register-student'!`, '\nreq.body:\n', req.body);
        res.status(201).send(`Response from '/register-student'!`)
    });

    const port = process.env.PORT || 3000;

    const server = app.listen(port, function () {
        console.log('Server running at http://127.0.0.1:' + port + '/');
    });
}
