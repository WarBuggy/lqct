let Common = require('../common/common.js');

module.exports = function (app) {
    //#region /api/data/core 
    // get core data for index.html
    app.post('/data/save', function (request, response) {
        let requestIp = Common.getReadableIP(request);
        let purpose = 'save match data';
        common.consoleLog('(' + requestIp + ') Received request for ' + purpose + '.');
        let resJson = {
            success: true,
            result: 0,
        };
        response.json(resJson);
        common.consoleLog('(' + requestIp + ') Request for ' + purpose + ' was successfully handled.');
    });
};