const dbModel = require('./dbModel');
const promiseAdapter = require('../adapters/promiseAdapter');
const { v4: uuidv4 } = require('uuid');

exports.createUser = async function (userData) {

    try {
        let models = await dbModel.Models();
        const result = await models.user.create({
            key: uuidv4()
        });

        return { key: result.key };

    } catch (error) {
        return promiseAdapter.reject({ 'code': error.code || 100, 'message': error.message })
    }
}

exports.getUser = async function (data) {
    try {
        let models = await dbModel.Models();
        let result = await models.user.findOne(
            {
                where: {
                    'key': data.key
                }
            }
        );

        if (result && result.dataValues) {
            return result.dataValues;
        } else {
            return false;
        }

    } catch (error) {
        console.log(error);
        return false;
    }
}