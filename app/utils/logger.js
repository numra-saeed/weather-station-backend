const winston = require('winston');
require('winston-logstash');
require('winston-daily-rotate-file');
const path = require('path');
const context = require('../utils/context'); 
 
var logstashTransport = new (winston.transports.Logstash)({
        level: 'debug',
        port: process.env.LOGSTASH_PORT,
        host: process.env.LOGSTASH_HOST,
        max_connect_retries : -1,
        timeout_connect_retries : 60000
    }).on('error', function(err) {
        console.log("Error Connecting to logstash " , err);
        //logger.error("Error Connecting to logstash " + err);
    });

var transport = new (winston.transports.DailyRotateFile)({
        filename: 'app-log-%DATE%.log',
        dirname:path.join(__dirname, '../logs'),
        datePattern: 'DD-MM-YYYY-HH-MM',
        zippedArchive: true,
        maxSize: '100m',
        maxFiles: '30d',
        level: 'debug',
        json:true
    });

var consoleTransport = new (winston.transports.Console)({

    level: 'debug',
    timestamp: true,
    json:true,
    format: true,
    handleExceptions: true,
    stringify: (obj) => JSON.stringify(obj)
});

var winstonLogger = new (winston.Logger)({
    transports: [
        transport,
        //consoleTransport,
        logstashTransport
    ],
    exitOnError : false
    });

var logger = {
    log: function(level, message) {
        winstonLogger.log(level, formatMessage(message));
    },
    error: function(message) {
        winstonLogger.error(formatMessage(message));
    },
    warn: function(message) {
        winstonLogger.warn(formatMessage(message));
    },
    verbose: function(message) {
        winstonLogger.verbose(formatMessage(message));
    },
    info: function(message) {
        winstonLogger.info(formatMessage(message));
    },
    debug: function(message) {
        winstonLogger.debug(formatMessage(message));
    },
    silly: function(message) {
        winstonLogger.silly(formatMessage(message));
    },
    captureReportData: function(data) {
        try {
            winstonLogger.info(data);
        } catch (error) {
            winstonLogger.error(formatMessage(`Error in ${process.env.MICROSERVICE_NAME} report logging`));
        }
        
    }
};    

var formatMessage = function(message) {
    //var reqId = httpContext.get('reqId');
    var reqId = context.vars.get('req:x-requestID');
    var msisdn = context.vars.get('req:msisdn');
    var channel = context.vars.get('req:channel');
    let microservice = process.env.MICROSERVICE_NAME
    var date = new Date();
    var index_name = 'app_log_' + date.getFullYear() + '_' + (date.getMonth() + 1)  ; // 1 is added in month because getMonth() method returns 0 to 11
    message = {reqId:reqId, msisdn:msisdn, message: message, index : index_name , channel: channel, microservice: microservice};
    return message;
};

module.exports = logger;