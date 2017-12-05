'use strict';
var _ = require('lodash');

var mongoose = require('mongoose');

var TweetCollection = require('../models/tweet.js')

exports.list_tweets_in_timerange = function(req, res) {
      TweetCollection.find({start: {
          $gte: new Date(req.params.from),
          $lt: new Date(req.params.to)
      }}, function(err, tweets) {
        if (err)
          res.send(err);
        res.json({
            count: _.reduce(tweets, function(sum, n){return sum + n.count}, 0),
            follower: _.reduce(tweets, function(sum, n){return sum + n.follower_count}, 0)
        });
      });
};