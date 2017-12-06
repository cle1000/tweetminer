'use strict';
var _ = require('lodash');
var moment = require('moment');

var mongoose = require('mongoose');

var TweetCollection = require('../models/tweet.js')

exports.get_timerange_list = function(req, res) {
      //size in minutes
      var size = req.params.size;
      var from = req.params.from;
      var to = req.params.to;

      TweetCollection.find(
          {
              start: {
                  $gte: new Date(from),
                  $lt: new Date(to)
              },
          },
          ['start', 'follower_count', 'count'],
          {
              sort: {
                  start: 1
              }
          }
      , function(err, tweets) {
            if (err) {
                res.send(err);
                return;
            }

            var data = [];
            var m = moment(req.params.from);
            while (m.isBefore(moment(req.params.to))){
                var to = moment(m).add(size, 'minutes');
                var tweetGroup = _.takeWhile(tweets, function(t) { return moment(t.start).isBefore(to);});
                tweets = _.dropWhile(tweets, function(t) { return moment(t.start).isBefore(to);});

                data.push({
                    start: moment(m),
                    count: _.reduce(tweetGroup, function(sum, n){return sum + n.count}, 0),
                    follower: _.reduce(tweetGroup, function(sum, n){return sum + n.follower_count}, 0)
                });
                m.add(parseInt(size), 'minutes');
            }
            res.json(data);
      });
};


exports.get_timerange = function(req, res) {
      //size in minutes
      var size = parseInt(req.params.size);
      var from = moment(req.params.from);
      var end = moment(from).add(size, "minutes");

      TweetCollection.find(
          {start: {
            $gte: from,
            $lt: end
          },
          },
          ['start', 'follower_count', 'count'],
          {sort: {
              start: 1
          }
      }, function(err, tweets) {
            if (err) {
                res.send(err);
                return;
            }
            res.json(
                {
                    start: moment(from),
                    count: _.reduce(tweets, function(sum, n){return sum + n.count}, 0),
                    follower: _.reduce(tweets, function(sum, n){return sum + n.follower_count}, 0)
                }
            );
      });
};
