var requestPromise = require('request-promise');
var restify = require('./serverconf');
const logger = require('../logger');
export function callApi(filteredData: any, userToken : any ) {
    var options : any = {
        method: 'POST',
        uri: 'http://localhost:3000/azureData',
        body: {
            filteredData,
            userToken

        },
        json: true
    };


    return new Promise((resolve, reject) => {
        try{
        requestPromise(options)
            .then((parsedBody : any) => {
                resolve(parsedBody);
            })
            .catch((err) => {
                reject(err);
            })
        }
        catch(err){
            logger.info(err+"occurs on calling localhost api");
        }
    });



}

