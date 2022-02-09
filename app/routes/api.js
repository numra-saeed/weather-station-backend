var express = require('express');
var router = express.Router();
const context = require('../utils/context');
const cacheModel = require('../models/cacheModel');
const userModel = require('../models/userModel');
const apiResponseService = require('../services/apiResponseService');
const axios = require('axios');
const auth = require('../middleware/auth');

router.use(auth.validateAccessKey);

router.get('/', async function (req, res) {
    try {
        let traceID = context.vars.get('req:x-requestID');
        await cacheModel.setValueInRedisCache('redis-testkey', { requestID: traceID }, 60);
        let response = apiResponseService.generateResponse('200', 'API Router functional', '', { id: traceID });
        res.send(response);
    } catch (error) {
        let response = apiResponseService.generateResponse('412', error.message, '', {});
        res.send(response);
    }
});

router.get('/weather', async function (req, res) {
    try {

        var options = {
            'method': 'GET',
            'url': `https://api.openweathermap.org/data/2.5/weather?q=${req.query.city}&appid=97c92b528351d3495bbc38f169c5542a`,
            //'headers': {
            //'X-API-KEY': 'E6xwOg2BY4RbmiJogfyegrt746r7te',
            //    'Content-Type': 'application/json'
            // }
        };
        const result = await axios(options);
        console.log(result.data);
        const data = {
            timestamp: result.data.dt.toString(),
            city: result.data.name,
            temperature: result.data.main.temp,
            humidity: result.data.main.humidity,
            pressure: result.data.main.pressure,
            lat: result.data.coord.lat,
            lon: result.data.coord.lon
        };
        let response = apiResponseService.generateResponse('200', 'API Router functional', '', [data]);
        res.send(response);
    } catch (error) {
        let response = apiResponseService.generateResponse('412', error.message, '', {});
        res.send(response);
    }
});



module.exports = router;