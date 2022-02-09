const logger = require('../utils/logger');
const redisClient = require('../utils/redisClient');

/*  
    Following keys deleted in WPSyncModel.js and set in appconfigurationModel.js
    redis_keys_config ttl defined for holding app configuration keys defined in postgres database. 
    the key names must correspond to configype values stored in app configurations database 
*/
exports.redis_keys_config = {
    'test_key': {ttl:240}, // 4 mins
}

exports.setValueInRedisCache = async function (cacheKey, cacheObject, ttl, clientName = 'redisClient' ) {
    try {
        return new Promise((resolve, reject) => {

                redisClient.setex(cacheKey, ttl, JSON.stringify(cacheObject), function (err) {
                    //redisClient.quit();
                    if (err) {
                        logger.error('Error saving data to redis ' + JSON.stringify(err));
                        return reject(new Error("Redis Error: "+ err.message));
                    } else {
                        return resolve(true);
                    }
                });
        });
    } catch (err) {
        return new Promise((resolve, reject) => {
            logger.error('Error in setValueInRedisCache ' + JSON.stringify(err));
            return reject(err);
        });
    }
}

exports.getValueFromRedisCache = async function (cacheKey, clientName = 'redisClient') {
    try {
        //let redisClient = await clientService.createRedisClient();
        return new Promise((resolve, reject) => {
            if(process.env.ENABLE_CONNECT_CACHE === "0"){
                return resolve(null);
            }
                
            redisClient.get(cacheKey, function (err, cacheObject) {
                //redisClient.quit();
                if (err) {
                    logger.error('Error in getting value from redis cache ' + JSON.stringify(err));                   
                    return reject(new Error("Redis Error: "+ err.message));
                } else {
                    return resolve(JSON.parse(cacheObject));
                }
            });
        });
    } catch (err) {
        return new Promise((resolve, reject) => {
            logger.error('Error in getValueFromRedisCache ' + JSON.stringify(err));
            return reject(err);
        });
    }
}

exports.deleteValueInRedisCache = async function(cacheKey, clientName = 'redisClient') {
    try {
        //let redisClient = await clientService.createRedisClient();
        return new Promise((resolve, reject) => {
            
            
            redisClient.del(cacheKey, function (err, response) {
                //redisClient.quit();
                if (err) {
                    logger.error('Error in deleting from redis cache ' + JSON.stringify(err));
                    return reject(new Error("Redis Error: "+ err.message));
                } else {
                    return resolve(true);
                }
            });
            
            
        });
    } catch(err) {
        return new Promise((resolve, reject) => {
            logger.error('Error in deleteValueInRedisCache ' + JSON.stringify(err));
            return reject(err);
        });
    }
}

exports.updateValueInRedisCache = async function (cacheKey, cacheObject) {
    try {
        //let redisClient = await clientService.createRedisClient();
        let ttl = await exports.getTTL(cacheKey);
        return await exports.setValueInRedisCache(cacheKey,cacheObject, ttl);
    } catch (err) {
        return new Promise((resolve, reject) => {
            logger.error('Error in updateValueInRedisCache ' + JSON.stringify(err));
            return reject(err);
        });
    }
}

exports.getTTL = async function(cacheKey){
    try {
        return new Promise((resolve, reject) => {
            redisClient.ttl(cacheKey, function(err, result){
                if(err){
                    return reject(err.message);
                }else{
                    return resolve(result);
                }
            });

        });
    } catch (error) {
        return new Promise((resolve, reject) => {
            return reject(error.message);
        });
    }
}

exports.deleteCustomerInfoCache = function (key) {

    try {
        return new Promise(async (resolve, reject) => {
            let xenonTokenData = await exports.getValueFromRedisCache(key, 'redisTokenClient');
            xenonTokenData.phoneList.forEach(async (phoneNumber) => {

                let key = 'custinfo:'+phoneNumber;
                await exports.deleteValueInRedisCache(key);
            });
            return resolve(true);
        });
    } catch (error) {
        return new Promise((resolve, reject) => {
            logger.error('Error in deleteCustomerInfoCache() ' + error.message);
            return reject(error.message);
        });
    }

}