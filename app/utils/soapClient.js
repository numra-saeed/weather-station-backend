const soap = require('soap');
const logger = require('../utils/logger');
const promiseAdapter = require('../adapters/promiseAdapter');
const customError = require('../adapters/customError');
const strongSoap = require('strong-soap').soap;

exports.getNodeSoapClient = function (url) {

    //return node soap client. this client offers improved features including custom namespace support 

    return new Promise((resolve, reject) => {
        soap.createClient(url, (err, client) => {

            if (err) {
                logger.error(`Soapclient error: url: ${url} + error: ${err.message}`);
                return reject(err);
            }

            return resolve(client);
        });
    });
}


exports.getStrongSoapClient = function (url, options) {
    //return strong soap client
    //@ali naqi

    return new Promise((resolve, reject) => {
        try{
            strongSoap.createClient(url, options, (err, client) => {
                if (err) {
                    logger.error("strongSoap error: " + err);
                    if(err.code === 'ECONNREFUSED'){
                        err.message = "The requested My Telenor service is currently not available. Please try again in a few minutes, we apologize for the inconvenience. (ECONNREFUSED)";
                    };
                    return reject(err);
                }
                return resolve(client);
            });
        }catch(error){
            logger.error("strongSoap error: " + error.message);
            return reject(error);
        }
        
    });
}

const createAsyncClient = async (url) => {
    try {
        let client = await this.getStrongSoapClient(url , {});
        return promiseAdapter.resolve(client);
        //return await soap.createClientAsync( url, {} );
    } catch (error) {
        return promiseAdapter.reject(error);
    }
}

exports.runJbossOperation = async (url, method, args, expectedSuccessCode = "EIL000") => {
    try {
        
        let client = await createAsyncClient(url);
        
        let func = eval("client" + method);
        let {result, envelope, soapHeader} = await func(args, {timeout: 15000});
        if(!result.ResultHeader){
            throw new Error('JBOSS error. No result header found in response');
        }

        if(result.ResultHeader.ExternalError){
            throw new customError(result.ResultHeader.ExternalError.code, result.ResultHeader.ExternalError.message);
        }

        if(result.ResultHeader.ResultCode !==  expectedSuccessCode ){ ///"EIL000"
            throw new customError(result.ResultHeader.ResultCode, result.ResultHeader.ResultMsg || result.ResultHeader.ResultDescription);
        }

        return promiseAdapter.resolve(result);
    } catch (error) {
        logger.error('JBOSS Error' + error.message);
        return promiseAdapter.reject({code: error.code || '412', message: error.message });
    }
}