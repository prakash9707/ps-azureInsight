var winston = require('winston')
var moment = require('moment');

winston.add(
    winston.transports.File, {
      dirname:'./logs',
      filename: 'azure.log',
      level: 'info',
      json: false,
      timestamp: function () {
        return moment().format();
    },
      formatter: customFileFormatter
    });
 


export const info:any = function (value,displayObject) {
        
        if(displayObject !== undefined ){
        winston.info(value,displayObject)
           }
        else
        winston.info(value);
    
        return winston;
       }
export const error:any = function (value,displayObject) {
    
    if(displayObject !== undefined ){
        winston.error(value,displayObject)
           }
        else
        winston.error(value)
        return winston;
       }
export const debug:any = function (value,displayObject) {
        
    if(displayObject !== undefined ){
        winston.debug(value,displayObject)
           }
        else
        winston.debug(value)
        return winston;
       }       

function customFileFormatter(options: any) {
     return (options.timestamp() + ' [' + options.level.toUpperCase() + '] ' + ' ' + (undefined !== options.message ? options.message : '') +
            (options.meta && Object.keys(options.meta).length ? JSON.stringify(options.meta) : ''));
    }     
