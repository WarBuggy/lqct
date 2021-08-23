let Common = require('../common/common.js');

module.exports = function (app) {
    app.post('/data/save', async function (request, response) {
        let requestIp = Common.getReadableIP(request);
        let saveMatchResult = await saveMatch(request, requestIp);
        if (saveMatch.success == false) {
            response.json(saveMatchResult);
            return;
        }
        console.log(saveMatchResult);
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
            let result = await db.query(params, logInfo);
            if (result.resultCode != 0) {
                let errorCode = result.resultCode;
                common.consoleLogError('Database error when ' + purpose + '. Error code ' + errorCode + '.');
                return {
                    success: false,
                    errorCode,
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
                errorCode: 800,
            };
        }
    };
};