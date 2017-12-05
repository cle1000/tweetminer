var config = require('./config.js');


var express = require('express'),
  app = express(),
  port = config.port,
  mongoose = require('mongoose'),
  Tweet = require('./api/models/tweet'),
  bodyParser = require('body-parser');



mongoose.Promise = global.Promise;
mongoose.connect(config.mongo_server);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


var routes = require('./api/routes/twitter');
routes(app);

app.use(function(req, res) {
  res.status(404).send({url: req.originalUrl + ' not found'})
});

app.listen(port);

console.log('tweet miner RESTful API started on: ' + port);
