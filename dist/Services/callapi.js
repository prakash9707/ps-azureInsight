"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var requestPromise = require('request-promise');
var restify = require('./serverconf');
const logger = require('../logger');
function callApi(filteredData) {
    var options = {
        method: 'POST',
        uri: 'http://localhost:3000/azureData',
        body: {
            filteredData
        },
        json: true
    };
    return new Promise((resolve, reject) => {
        try {
            requestPromise(options)
                .then((parsedBody) => {
                resolve(parsedBody);
            })
                .catch((err) => {
                reject(err);
            });
        }
        catch (err) {
            logger.info(err + "occurs on calling localhost api");
        }
    });
}
exports.callApi = callApi;
