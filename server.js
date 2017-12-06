var express = require('express'),
  app = express(),
  mongoose = require('mongoose'),
  bodyParser = require('body-parser'),
  config = require('./config.js'),
  routes = require('./api/routes/twitter'),
  log = require('./log/log.js');

mongoose.Promise = require('bluebird');
mongoose.connect(config.mongo_server, {useMongoClient: true});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


routes(app);

app.use(function(req, res) {
  res.status(404).send({url: req.originalUrl + ' not found'})
});

app.listen(config.port);

log.info(`tweetminer RESTful API started on: ${config.port}`);
