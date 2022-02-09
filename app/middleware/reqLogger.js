const logger = require('../utils/logger');
const interceptor = require('express-interceptor');
const context = require('../utils/context'); 

exports.log = interceptor((req, res) => {

    try {
        const start = process.hrtime();
        
        return {
            // Only json responses will be intercepted
            isInterceptable: function(){
              return /application\/json/.test(res.get('Content-Type'));
            },
            // intercept res.send and writes status code and message to the logs
            intercept: function(body, send) {
                try {
                    const date = new Date();
                    let thisMonth = date.getMonth() + 1; 
                    jsonbody = JSON.parse(body);
                    var data = {
                        index : `requests_${thisMonth}_${date.getFullYear()}_${process.env.MICROSERVICE_NAME}`,
                        msisdn : getMsisdnFromUrl(req.url) || req.body.msisdn,
                        url: getUrlWthoutMsisdn(req.url),
                        rawUrl: req.url,
                        method : req.method,
                        body: filterReqBody(req.body),
                        statusCode: res.statusCode,
                        TAT :  getActualRequestDurationInMilliseconds(start), //duration in ms
                        body_statusCode: jsonbody.statusCode,
                        message: jsonbody.message || '',
                        responseSize: req.socket.bytesRead,
                        microservice: process.env.MICROSERVICE_NAME,
                        channel : req.get('x-request-channel') || '',
                        priceplan : req.get('x-user-price-plan') || '',
                        segment : req.get('x-user-segment') || '',
                        reqIp : req.headers['x-forwarded-for'] || req.connection.remoteAddress,
                        reqId : req.id || context.vars.get('req:x-requestID'),
                        browser : req.get('x-request-browser') || '',
                        browserVersion : req.get('x-browser-version') || '',
                        os : req.get('x-request-os') || '',
                        osVersion : req.get('x-os-version') || '',
                        appVersion : req.get('x-app-version') || '',
                        deviceMake : req.get('x-device-make') || '',
                        deviceModel : req.get('x-device-model') || '',
                        packagePlan : req.get('x-user-package-plan') || '',
                        planType : req.get('x-user-plan-type') || '',
                        segmentType : req.get('x-user-segment-type') || '',
                        locale : req.get('x-app-language') || 'EN'
                    }
                    logger.captureReportData(data)
                    send(body);
                } catch (error) {
                    logger.error('interceptor error -> ' + error.message);
                    send(body);
                }
               
            }
        }
        
    } catch (error) {
        logger.debug("Error logging request " + error.message);
    }
   
})

exports.logResponseBody = (req, res, next) => {
    var oldWrite = res.write,
        oldEnd = res.end;
  
    var chunks = [];
  
    res.write = function (chunk) {
      chunks.push(chunk);
  
      return oldWrite.apply(res, arguments);
    };
  
    res.end = function (chunk) {
      if (chunk)
        chunks.push(chunk);
  
      var body = JSON.parse(Buffer.concat(chunks));
  
      oldEnd.apply(res, arguments);
    };
  
    next();
  }


const getActualRequestDurationInMilliseconds = start => {
    const NS_PER_SEC = 1e9; // convert to nanoseconds
    const NS_TO_MS = 1e6; // convert to milliseconds
    const diff = process.hrtime(start);
    return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
  };

  
var getUrlWthoutMsisdn = function (inputUrl) {

    try {
        let lastIndexOfSlash = inputUrl.lastIndexOf('/');
        let urlWithoutMsisdn = inputUrl;
        if (inputUrl.substr(lastIndexOfSlash + 1).startsWith('0') || inputUrl.substr(lastIndexOfSlash + 1).startsWith('92')) {
            urlWithoutMsisdn = inputUrl.substr(0, lastIndexOfSlash + 1);
        }

        return urlWithoutMsisdn;
    } catch (error) {
        logger.error('Error in getUrlWthoutMsisdn() ' + error);
        return inputUrl;
    }

}

var getMsisdnFromUrl = function (inputUrl) {

    try {
        let lastIndexOfSlash = inputUrl.lastIndexOf('/');
        let msisdn = null;
        if (inputUrl.substr(lastIndexOfSlash + 1).startsWith('0') || inputUrl.substr(lastIndexOfSlash + 1).startsWith('92')) {
            msisdn = inputUrl.substr(lastIndexOfSlash + 1);
        }

        return msisdn;
    } catch (error) {
        logger.error('Error in getUrlWthoutMsisdn() ' + error);
        return null;
    }

}

var filterReqBody = function (body) {

    // remove attributes that are sensitive and not to be logged 

    let removeAttributes = ['otp'];  //Add more attributes as they are identified 

    removeAttributes.forEach(element => {
        if (body[element]) {
            logger.debug('Removing key ' + element + ' before logging');
            delete body[element];
        }
    });
    return JSON.stringify(body);
}
