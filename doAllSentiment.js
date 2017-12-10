var moment = require('moment');
var _ = require('lodash');
var TwitterApi = require('twitter');
var mongoose = require('mongoose');
var config = require('./config.js');
var log = require('./log/log.js');
var TweetCollection = require('./api/models/tweet.js');
var analysis = require('./sentimental/sentimental.js');

mongoose.Promise = require('bluebird');
mongoose.connect(config.mongo_server, {useMongoClient: true});

TweetCollection.find({},['tweets'],{}, function(err, tweetCollections) {
    var size = _.size(tweetCollections);
    var i = 0;
    for (i = 0; i < size; i++){
        log.info(`${i}/${size}`);
        if (_.size(tweetCollections[i].tweets) != 0 && _.last(tweetCollections[i].tweets).sentiment != undefined) {
            tweetCollections[i].tweets = analysis.callSentimentalAnalysis(tweetCollections[i].tweets);
            tweetCollections[i].save();
        }
    }
    mongoose.disconnect();
});

