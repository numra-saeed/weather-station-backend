const axios = require('axios');
const redis = require('redis');
const observationsModel = require('../models/observationsModel');
const publisher = redis.createClient(process.env.REDIS_URL);
let interval = null;

const startPolling = () => {
    console.log('Polling Started');
    interval = setInterval(async () => {

        try {
            var options = {
                'method': 'GET',
                'url': `${process.env.WEATHER_URL}?q=Islamabad&appid=${process.env.APP_ID}`,
            };
            const result = await axios(options);
            const data = {
                timestamp: result.data.dt.toString(),
                city: result.data.name,
                temperature: result.data.main.temp,
                humidity: result.data.main.humidity,
                pressure: result.data.main.pressure,
                lat: result.data.coord.lat,
                lon: result.data.coord.lon
            };
            
            const oldObservation = await observationsModel.getWeatherObservation({ city: data.city });

            if(!oldObservation || (oldObservation.timestamp != data.timestamp)) {
                await observationsModel.saveWeatherObservation(data);  // save data in database
                publisher.publish("app:weatherStation", JSON.stringify({ ...data, type: "weather_update" })); // send data to redis
            }
            
        }
        catch (ex) {
            console.log(ex);
            clearInterval(interval);
            throw ex;

        }
    }, 60000);
}

module.exports.startReceivingWeatherUpdate = startPolling;