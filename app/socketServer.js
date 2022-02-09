var redis = require('redis');
var WebSocket = require('ws');
var url = require('url');
const userModel = require('./models/userModel');
require('dotenv').config({ path: '../.env' });

const isValidClient = async(key) => {
  const userKey = await userModel.getUser({ key: key }); // verify key exist in database or not
  if (!userKey) {
    return false;
  }
  return true;
}

try {
  var subscriber = redis.createClient(process.env.REDIS_URL);
  subscriber.subscribe('app:weatherStation');

  const socketServer = new WebSocket.Server({ port: process.env.WEB_SOCKET_PORT });
  console.log("Socket Server Listening");
  socketServer.on('connection', function connection(ws, req) {

    const parameters = url.parse(req.url, true);
    console.log("Client Connection Received: " + parameters.query.key);

    if (!isValidClient(parameters.query.key)) {
      ws.close();
      return;
    } else {
      subscriber.on('message', function (channel, message) {
        console.log(channel);
        console.log(message);
        ws.send(message);
      })
    }



  });
}
catch (ex) {
  console.log(ex);
  throw ex;
}


