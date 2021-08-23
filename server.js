const DB = require('./db/db.js');
const Common = require('./common/common.js');

const express = require('express');
const cors = require('cors');
const http = require('http');
const systemConfig = require('./systemConfig.js');
const app = express();

start();

async function start() {
    let prepareDbConnectionResult = await prepareDbConnection();
    if (prepareDbConnectionResult == false) {
        return;
    }
    rssCrawler.start();

    prepareHttpServer();
};

async function prepareDbConnection() {
    Common.consoleLog('Begin to establish database connection...');
    let dbConnection = await DB.getConnection();
    if (dbConnection == null) {
        common.consoleLogError('Cannot establish database conneciton. Program is now terminated.');
        return false;
    }
    common.consoleLog('Established database connection.');
    return true;
};

function prepareHttpServer() {
    app.use(express.json());
    app.use(express.urlencoded({ limit: '10mb', extended: false, }));
    app.use(cors());
    http.createServer(app).listen(systemConfig.httpPort, function () {
        common.consoleLog('HTTP Server started on port ' + systemConfig.httpPort + '.');
        require('./api/nqp.js')(app);
    });
};