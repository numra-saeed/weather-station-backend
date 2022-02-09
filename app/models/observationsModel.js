const dbModel = require('./dbModel');
const promiseAdapter = require('../adapters/promiseAdapter');

exports.saveWeatherObservation = async function (weatherData) {

    try {
        let models = await dbModel.Models();
        const result = await models.observations.create(weatherData);
        return result;

    } catch (error) {
        return promiseAdapter.reject({ 'code': error.code || 100, 'message': error.message })
    }
}

exports.getWeatherObservation = async function (data) {
    try {
        let models = await dbModel.Models();
        let result = await models.observations.findOne(
            {
                where: {
                    'city': data.city
                }
            }
        );
            console.log(result);
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