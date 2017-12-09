var moment = require('moment');
var _ = require('lodash');
var TwitterApi = require('twitter');
var mongoose = require('mongoose');
var config = require('./config.js');
var log = require('./log/log.js')
var TweetCollection = require('./api/models/tweet.js');
var analysis = require('./sentimental/sentimental.js');

mongoose.Promise = require('bluebird');
mongoose.connect(config.mongo_server, {useMongoClient: true});

TweetCollection.find({},['tweets'],{}, function(err, tweetCollections) {
    var size = _.size(tweetCollections);
    var i = 0;
    tweetCollections.forEach((tc) => {
        i = i++;
        log.info(`${i}/${size}`);
        if (_.size(tc.tweets) != 0 && _.last(tc.tweets).sentiment != undefined) {
            tc.tweets = analysis.callSentimentalAnalysis(tc.tweets);
            tc.save();
        }
    });
    mongoose.disconnect();
});

