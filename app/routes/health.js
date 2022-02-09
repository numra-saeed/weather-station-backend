var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    res.send('health check ok');
});

router.get('/postgres', function(req, res){
    let dbModel = require('../models/dbModel');
    
});

module.exports = router;