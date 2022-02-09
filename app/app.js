var createError = require('http-errors');
var cors = require('cors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');

var indexRouter = require('./routes/index');
var apiRouter = require('./routes/api');
var healthRouter = require('./routes/health');

var cls = require('./utils/context');
var reqLogger = require('./middleware/reqLogger');

require('dotenv').config({path:'../.env'});
var app = express();

//Database
const dbModel =  require('./models/dbModel');
dbModel.dbsync(); //set and sync database models

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(cls.clsMiddleware);
app.use(reqLogger.log);

app.use('/', indexRouter);
app.use('/api', apiRouter);
app.use('/health', healthRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});



// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500).send({
    statusCode: err.status,
    message: err.message,
    data: {}
  });
  
});

module.exports = app;
