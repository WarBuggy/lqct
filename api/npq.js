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
        let success = true;
        let id = null;
        let result = null;
        try {
            let result = await DB.query(params, logInfo);
            if (result.resultCode != 0) {
                let errorCode = result.resultCode;
                common.consoleLogError('Database error when ' + purpose + '. Error code ' + errorCode + '.');
                success = false;
                result = errorCode;
            } else {
                Common.consoleLog('(' + requestIp + ') Request for ' + purpose + ' was successfully handled.');
                result = 0;
                id = result.sqlResults[1][0].lastId;
            }
        } catch (error) {
            Common.consoleLog(`(${requestIp}) Unexpected error when ${purpose}: ${error}.`);
            success = false;
            result = 800;
        } finally {
            return {
                success,
                result,
                id,
            };
        }
    };
};