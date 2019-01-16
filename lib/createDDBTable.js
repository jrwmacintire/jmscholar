const AWS = require('aws-sdk');

function createDDBTable(ddb, tableName) {
    // console.log('ddb:\n',ddb);
    const tableParams = {
        AttributeDefinitions: [
            {
                AttributeName: 'email',
                AttributeType: 'S'
            },
            {
                AttributeName: 'id',
                AttributeType: 'S'
            }
        ],
        KeySchema: [
            {
                AttributeName: 'email',
                KeyType: 'HASH'
            },
            {
                AttributeName: 'id',
                KeyType: 'RANGE'
            }
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 8,
            WriteCapacityUnits: 8
        },
        TableName: tableName,
        StreamSpecification: {
            StreamEnabled: false
        }
    };
    ddb.createTable(tableParams, (err, data) => {
        if(err) console.error('Failed to create table in DB.\n', err);
        else console.log('Success creating table!', data);
    })
}

module.exports = createDDBTable;
