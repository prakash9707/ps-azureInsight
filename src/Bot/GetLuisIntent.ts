import * as request from 'request';
import * as querystring from 'querystring';

let config : any = require('../../config/default.json');

export function getLuisIntent(utterance: string): object {
    var endpoint = config.luis.endPoint;
    var luisAppId = config.luis.luisAppId;
    var endpointKey = config.luis.endPointKey;
    var queryParams = {
        "verbose": true,
        "q": utterance,
        "subscription-key": endpointKey
    }
    var luisRequest =
        endpoint + luisAppId +
        '?' + querystring.stringify(queryParams);
    return new Promise((resolve, reject) => {
        try {
            request(luisRequest, function (err: any,
                response: any, body: any) {
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