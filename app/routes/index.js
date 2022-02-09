var express = require('express');
var router = express.Router();
const userModel = require('../models/userModel');
const apiResponseService = require('../services/apiResponseService');

/* GET home page. */
router.get('/', function(req, res) {
  let response = {
    'statusCode':'200',
    'message':'Health check ok'
  }
  res.send(response);
});

router.post('/generate-key', async function (req, res) {
  console.log("generate key called");
  try {
      const user = await userModel.createUser();
      console.log(user);
      let response = apiResponseService.generateResponse('200', 'Success', '', user);
      res.send(response);
  } catch (error) {
      let response = apiResponseService.generateResponse('412', error.message, '', {});
      res.send(response);
  }
});

module.exports = router;
