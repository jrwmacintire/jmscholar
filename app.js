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

    AWS.config.region = process.env.AWS_REGION;

    const validateItem = require('./lib/validateItem');

    const sns = new AWS.SNS({ region: 'us-west-2' });
    const ddbTableName = 'jmscholar-db';
    const ddb = new AWS.DynamoDB({ region: 'us-west-2' });

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
        // console.log('\nreq.body:\n', req.body);

        const validItem = validateItem(req.body);

        if(validItem.valid){
            const { name, email, phone, participating } = req.body;
            // console.log(`name: ${name} | email: ${email} | phone: ${phone} | participating: ${participating}`);

            const queryParams = {
                TableName: 'jmscholar.db',
                KeyConditionExpression: '#dbEmail = :inputEmail',
                ExpressionAttributeNames: {
                    '#dbEmail': 'email'
                },
                ExpressionAttributeValues: {
                    ':inputEmail': { 'S': email }
                }
            };
            ddb.query(queryParams, (err, data) => {
                if(err) {
                    if(err.code == 'ResourceNotFoundException') {
                        console.log(`'${email}' not found in DB!`);
                        ddb.putItem({
                            'TableName': ddbTableName,
                            'Item': validItem.item
                            // 'Expected': { email: { Exists: false } }
                        }, function(err, data) {
                            if (err) {
                                let returnStatus = 500;
                                console.log(err);

                                if (err.code === 'ConditionalCheckFailedException') {
                                    returnStatus = 409;
                                }

                                console.log('DDB Error: ' + err);
                                res.status(returnStatus).send(err);
                            } else {
                                // Item was saved to the database!
                                res.status(200).send(validItem.item);
                            }
                        });
                    }
                }
                else {
                    console.log('Query succeeded!');
                    data.Items.forEach(item => console.log(' -', item.email + ': ' + item.name));
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

    const port = process.env.PORT || 8081;

    const server = app.listen(port, function () {
        console.log('Server running at http://127.0.0.1:' + port + '/');
    });
}
