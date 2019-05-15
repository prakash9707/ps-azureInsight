"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request");
const querystring = require("querystring");
let config = require('../../config/default.json');
function getLuisIntent(utterance) {
    var endpoint = config.luis.endPoint;
    var luisAppId = config.luis.luisAppId;
    var endpointKey = config.luis.endPointKey;
    var queryParams = {
        "verbose": true,
        "q": utterance,
        "subscription-key": endpointKey
    };
    var luisRequest = endpoint + luisAppId +
        '?' + querystring.stringify(queryParams);
    return new Promise((resolve, reject) => {
        try {
            request(luisRequest, function (err, response, body) {
                if (err) {
                    reject(err);
                }
                else {
                    var data = JSON.parse(body);
                    resolve(data);
                }
            });
        }
        catch (err) {
            console.log(err + "happend while hitting luis");
        }
    });
}
exports.getLuisIntent = getLuisIntent;
