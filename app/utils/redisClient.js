const redis = require('redis');
const REDIS_URL = process.env.REDIS_URL;
const logger = require('../utils/logger');

const redisClient = redis.createClient({
    url: REDIS_URL,
    retry_strategy: function (options) {

        logger.debug('Redis server retry strategy attempt number: ' + options.attempt);
            if (options.error && options.error.code === 'ECONNREFUSED') {
                // End reconnecting on a specific error and flush all commands with
                // a individual error
                logger.error('Redis server error: ' + options.error.code);
                return 5000; //new Error('The server refused the connection');
            }
            if (options.total_retry_time > 1000 * 60 * 60) {
                // End reconnecting after a specific timeout and flush all commands
                // with a individual error
                logger.debug('Redis server retry time exhausted' + options.error.code);
                return new Error('Retry time exhausted');
            }
            // Set total retry count for redis server
            if (options.attempt > 500) {
                logger.debug('Redis retry attempts exhausted');
                // End reconnecting with built in error
                return new Error('Retry attemts exhausted');
            }
            // reconnect after
            // retrty after every 5 seconds
            return 5000;
        }
});


redisClient.on("connect", function () {
    logger.debug("Redis Connection Successful ");
});

redisClient.on("error", function (err) {
    logger.error("Error in Redis connection :" + err);
});

redisClient.on("end", function () {
    logger.error("Redis Connection closed.");
});


module.exports = redisClient;