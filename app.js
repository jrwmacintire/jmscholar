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
    const expressFileUploader = require('express-fileupload');
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
    app.use(expressFileUploader());
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
        const hsReqFormTable = 'HSReqForms';
        const validItem = validateItem(req.body);

        if(validItem.valid){
            const { name, email, phone, participating } = req.body;
            // console.log(`name: ${name} | email: ${email} | phone: ${phone} | participating: ${participating}`);

            const queryParams = {
                TableName: hsReqFormTable,
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
                    console.error(`Error while reading '${hsReqFormTable}'`, err);
                } else {
                    console.log('Query succeeded!');
                    const queryLength = data.Items.length;
                    if(queryLength == 0) {
                        console.log('Current email not found in query. PUTting item to database.');
                        const putParams = {
                            TableName: hsReqFormTable,
                            Item: validItem.item
                        };
                        ddb.putItem(putParams, (err, data) => {
                            if(err) console.error(`Error while putting item in ${hsReqFormTable}`, err);
                            // Added item to database!
                            else console.log(`Success adding ${email} into ${hsReqFormTable}!\n`, data);
                        });
                    } else {
                        // TODO: Send notification of duplicate 'email' in database
                        console.log(`Query returned ${queryLength} queries from ${hsReqFormTable}.`);
                        data.Items.forEach(item => console.log(item));
                    }
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
        // console.log(`\nReceived POST request at '/register-student'!`, '\nreq.body:\n', req.body);

        const studentFormsTable = 'StudentForms';
        const validItem = validateItem(req.body);

        if(validItem.valid) {
            const { name, email, phone, participating } = req.body;
            // console.log(`Item appears to be valid!\nvalidItem.item:\n`, validItem.item);
            const queryParams = {
                TableName: studentFormsTable,
                KeyConditionExpression: '#dbEmail = :inputEmail',
                ExpressionAttributeNames: {
                    '#dbEmail': 'email'
                },
                ExpressionAttributeValues: {
                    ':inputEmail': { 'S': email }
                }
            };
            ddb.query(queryParams, (err, data) => {
                if(err) console.error(`Error querying ${studentFormsTable}`, err);
                else {
                    // console.log(`Query returned!\ndata.Items:\n`, data.Items);
                    const queryLength = data.Items.length;
                    if(queryLength == 0) {
                        console.log(`Query for ${email} returned no existing items.`);
                        const putParams = {
                            TableName: studentFormsTable,
                            Item: validItem.item
                        }
                        ddb.putItem(putParams, (err, data) => {
                            if(err) console.error(`Error adding ${email} to database!\n`, err);
                            else console.log(`Added ${email} to database!`);
                        });
                    } else {
                        console.log(`Query returned ${queryLength} results.`);
                        data.Items.forEach(item => console.log(item));
                    }
                }
            });
        } else {
            console.log('Trouble validating the item for StudentForms!');
        }
        // res.status(201).send(`Response from '/register-student'!`)
    });

    app.post('/upload-essay', (req, res) => {
        console.log(`Received POST at '/upload-essay'!`, req.files.file);
        res.status(200).send(req.files);
    });

    const port = process.env.PORT || 8081;

    const server = app.listen(port, function () {
        console.log('Server running at http://127.0.0.1:' + port + '/');
    });
}
