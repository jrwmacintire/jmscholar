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

        var item = {
            'email': {'S': req.body.email},
            'name': {'S': req.body.name},
            'participating': {'S': req.body.participating},
        };

        console.log('\nitem:\n',item);

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
        });
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
