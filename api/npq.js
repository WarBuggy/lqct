let Common = require('../common/common.js');
let DB = require('../db/db.js');

let fs = require('fs-extra');

module.exports = function (app) {
    app.post('/data/save', async function (request, response) {
        let requestIp = Common.getReadableIP(request);
        let saveMatchResult = await saveMatch(request, requestIp);
        if (saveMatchResult.success == false) {
            response.status(saveMatchResult.result);
            response.json({ success: false, });
            return;
        }
        let saveMatchImageResult = saveMatchImage(request.body.previewImageBase64, saveMatchResult.id);
        if (saveMatchImageResult == false) {
            response.status(801);
            response.json({ success: false, });
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
            request.body.season,
            request.body.date,
            request.body.hour,
            request.body.minute,
            request.body.matchType,
            request.body.matchResult,
            request.body.matchCalculation,
            request.body.mvp,
            request.body.sqlPart,
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

    function saveMatchImage(data, matchId) {
        try {
            let fullFileName = matchId + '.jpg';
            let pathToFile = 'public/res/img/match/' + fullFileName;
            let base64Image = data.split(';base64,').pop().replace(/%2B/g, '+');
            fs.outputFileSync(pathToFile, base64Image, { encoding: 'base64' });
            console.log('Image ' + pathToFile + ' was saved successfully.');
            return true;
        } catch (error) {
            console.log('Cannot save image ' + pathToFile + '. Error: ' + error);
            return false;
        }
    };

    app.post('/data/summary', async function (request, response) {
        let requestIp = Common.getReadableIP(request);
        let seasonMatchResult = await getSeasonMatch(request, requestIp);
        if (seasonMatchResult.success == false) {
            response.status(seasonMatchResult.result);
            response.json({ success: false, });
            return;
        }
        let objectMatch = createObjectMatch(seasonMatchResult.data);
        response.json({
            success: true,
            result: 0,
            data: objectMatch,
        });
    });

    function createObjectMatch(data) {
        let object = {
            data: {},
            summary: {
                total: 0,
                win: 0,
                lost: 0,
                totalK: 0,
                totalD: 0,
                totalA: 0,
            },
        };
        for (let i = 0; i < data.length; i++) {
            let record = data[i];
            let id = record.id;
            let date = record.date;
            let result = record.result;
            let type = record.type;
            let calculation = record.calculation;
            let mvp = record.mvp;
            let player = record.player;
            let nick = record.nick;
            let character = record.character;
            let role = record.role;
            let score = record.score;
            let k = record.k;
            let d = record.d;
            let a = record.a;

            let objectMatch = object.data[id];
            if (objectMatch == null) {
                objectMatch = {
                    id,
                    date,
                    result,
                    type,
                    calculation,
                    mvp,
                    detail: [],
                }
                object.data[id] = objectMatch;

                object.summary.total = object.summary.total + 1;
                if (result == 1) {
                    object.summary.win = object.summary.win + 1;
                } else {
                    object.summary.lost = object.summary.lost + 1;
                }
            }

            let objectScore = {
                player,
                nick,
                character,
                role,
                k, d, a,
                score,
            };
            objectMatch.detail.push(objectScore);
            object.summary.totalK = object.summary.totalK + k;
            object.summary.totalD = object.summary.totalD + d;
            object.summary.totalA = object.summary.totalA + a;
        }
        return object;
    };

    async function getSeasonMatch(request, requestIp) {
        let purpose = 'get season match data';
        Common.consoleLog('(' + requestIp + ') Received request for ' + purpose + '.');
        let seasonId = null;
        let params = [
            seasonId,
        ];
        let logInfo = {
            username: '',
            source: '`lqct_data`.`GET_SEASON_MATCH`',
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
                season: result.sqlResults[1][0].season,
                data: result.sqlResults[2],
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