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

    const validateItem = require('./lib/validateItem');

    AWS.config.region = process.env.REGION;

    const sns = new AWS.SNS();
    const ddb = new AWS.DynamoDB({ region: 'us-west-2' });

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

        const { name, email, phone, participating } = req.body;

        const validItem = validateItem(req.body);

        if(validItem.valid){
            ddb.putItem({
                'TableName': 'jmscholar-db', // changed from 'ddbTable' to 'jmscholar-db' string
                'Item': validItem.item,
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
                        'Message': 'Name: ' + name + "\r\nEmail: " + email
                                            + "\r\nParticipating: " + participating,
                        'Subject': 'New High School Request Form - JMScholar.org',
                        'TopicArn': snsTopic
                    }, function(err, data) {
                        if (err) {
                            res.status(500).end();
                            console.log('SNS Error: ' + err);
                        } else {
                            res.status(201).end({
                                message: 'Success?!',
                                data: data
                            });
                        }
                    });
                }
            });
        } else {
            res.status(400).send({
                errorMessage: 'Validation failed. Name, email, or phone number are invalid.',
                body: req.body
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
