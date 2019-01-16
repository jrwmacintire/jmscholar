function deleteDDBTable(ddb, tableName) {

    const params = {
        TableName: tableName
    };

    ddb.deleteTable(params, (err, data) => {
        if(err && err.code == 'ResourceNotFoundException') console.log('Error: Table not found.');
        else if(err && err.code == 'ResourceInUseException') console.log('Error: Table in use.');
        else console.log('Success deleting table.', data);
    });
}

module.exports = deleteDDBTable;
