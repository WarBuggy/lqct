let Common = require('../common/common.js');
let DB = require('../db/db.js');

module.exports = function (app) {
    app.post('/data/save', async function (request, response) {
        let requestIp = Common.getReadableIP(request);
        let saveMatchResult = await saveMatch(request, requestIp);
        console.log(saveMatchResult);
        if (saveMatchResult.success == false) {
            response.json(saveMatchResult);
            return;
        }
        response.json({
            success: true,
            result: 0,
            id: saveMatchResult.id,
        });
    });

    async function saveMatch(request, requestIp) {
        let purpose = 'save match data';
        Common.consoleLog('(' + requestIp + ') Received request for ' + purpose + '.');
        let params = [
            request.body.date,
            request.body.hour,
            request.body.minute,
            request.body.matchType,
            request.body.matchResult,
            request.body.matchCalculation,
        ];
        let logInfo = {
            username: '',
            source: '`lqct_data`.`SAVE_MATCH_DATA`',
            userIP: requestIp,
        };
        try {
            let result = await DB.query(params, logInfo);
            if (result.resultCode != 0) {
                let errorCode = result.resultCode;
                Common.consoleLogError('Database error when ' + purpose + '. Error code ' + errorCode + '.');
                return {
                    success: false,
                    result: errorCode,
                };
            }
            Common.consoleLog('(' + requestIp + ') Request for ' + purpose + ' was successfully handled.');
            return {
                success: true,
                id: result.sqlResults[1][0].lastId,
            };
        } catch (error) {
            Common.consoleLog(`(${requestIp}) Unexpected error when ${purpose}: ${error}.`);
            return {
                success: false,
                result: 800,
            };
        }
    };
};