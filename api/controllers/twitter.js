'use strict';
var _ = require('lodash');
var moment = require('moment');

var mongoose = require('mongoose');

var analysis = require('../../sentimental/sentimental.js')

var tweetCollections = require('../models/tweet.js')

var sentimentalAnalysis = (tweetCollection) => {
    if (analysis.newVersion(tweetCollection.version)) {
        tweetCollection.tweets = analysis.callSentimentalAnalysis(tweetCollection.tweets);
        tweetCollection.version = analysis.version;
        tweetCollection.positive = _.reduce(tweetCollection.tweets, function(sum, t){return sum + t.sentiment.pos}, 0);
        tweetCollection.negative =_.reduce(tweetCollection.tweets, function(sum, t){return sum + t.sentiment.neg}, 0);
        //console.log(JSON.stringify(tweetCollection));
        tweetCollection.save();
    }
}

exports.get_timerange_list = function(req, res) {
      //size in minutes
      var size = req.params.size;
      var from = req.params.from;
      var to = req.params.to;

      tweetCollections.find(
          {
              start: {
                  $gte: new Date(from),
                  $lt: new Date(to)
              },
          },
          ['start', 'follower_count', 'count', 'version', 'positive', 'negative', 'tweets'],
          {
              sort: {
                  start: 1
              }
          }
      , function(err, tweetCollections) {
            if (err) {
                res.send(err);
                return;
            }


            //call for each tweets sentimental analysis
            _.each(tweetCollections, (tc) => sentimentalAnalysis(tc));

            var data = [];
            var m = moment(req.params.from);
            while (m.isBefore(moment(req.params.to))){
                var to = moment(m).add(size, 'minutes');
                var tweetGroup = _.takeWhile(tweetCollections, function(t) { return moment(t.start).isBefore(to);});
                tweetCollections = _.dropWhile(tweetCollections, function(t) { return moment(t.start).isBefore(to);});

                data.push({
                    start: moment(m),
                    count: _.reduce(tweetGroup, function(sum, n){return sum + n.count}, 0),
                    follower: _.reduce(tweetGroup, function(sum, n){return sum + n.follower_count}, 0),
                    positive: _.reduce(tweetGroup, function(sum, n){return sum + n.positive}, 0),
                    negative: _.reduce(tweetGroup, function(sum, n){return sum + n.negative}, 0),
                    //tweets: _.reduce(tweetGroup, function(list, n){return list.concat(n.tweets)}, []),
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

      tweetCollections.find(
          {start: {
            $gte: from,
            $lt: end
          },
          },
          ['start', 'follower_count', 'count', 'version', 'positive', 'negative', 'tweets'],
          {sort: {
              start: 1
          }
      }, function(err, tweetCollections) {
            if (err) {
                res.send(err);
                return;
            }
            _.each(tweetCollections, (tc) => sentimentalAnalysis(tc));

            res.json(
                {
                    start: moment(from),
                    count: _.reduce(tweetCollections, function(sum, n){return sum + n.count}, 0),
                    follower: _.reduce(tweetCollections, function(sum, n){return sum + n.follower_count}, 0),
                    positive: _.reduce(tweetCollections, function(sum, n){return sum + n.positive}, 0),
                    negative: _.reduce(tweetCollections, function(sum, n){return sum + n.negative}, 0),
                }
            );
      });
};
