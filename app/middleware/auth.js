const apiResponseService = require('../services/apiResponseService');
const userModel = require('../models/userModel');

exports.validateAccessKey = async function (req, res, next) {
    try {
        if (!req.headers['x-api-key']) {
            throw new Error('Invalid authorization parameter');
        }

        const key = await userModel.getUser({ key: req.headers['x-api-key'] });
        if (!key) {
            throw new Error('Invalid authorization parameter');
        }

        /* if(!req.headers['authorization']){
            throw new Error('Invalid authorization parameter');
        }

        if(req.headers['authorization'] !== process.env.MICROSERVICE_ACCESS_KEY){
            throw new Error('Invalid authorization key');
        }
         */
        next();

    } catch (error) {
        let response = apiResponseService.generateResponse(error.code || '401', error.message, '', {});
        res.status(401).send(response);
    }
}