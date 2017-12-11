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


var close = (msg) => {
    log.info(msg);
    mongoose.disconnect();
}

var run = () => {
    TweetCollection.find(
        {tweets: {$elemMatch: {sentiment: undefined}}},
        ['tweets'],
        {limit: 300},
        (err, tweetCollections) => {
            if (err)
                log.error(err);
            var size = _.size(tweetCollections);
            if (size == 0) close("nothing found");

            for (var i = 0; i < size; i++) {
                log.info(`${i + 1}/${size}`);
                if (_.size(tweetCollections[i].tweets) != 0 && _.last(tweetCollections[i].tweets).sentiment != undefined) {
                    TweetCollection.update(
                        {_id: tweetCollections[i]._id},
                        {$set: {tweets: analysis.callSentimentalAnalysis(tweetCollections[i].tweets)}},
                        (err, t) => {
                            if (err) log.error("Error on save: " + err);
                            if (size == i+1) close("last element processed");
                        }
                    );
                }
        }
    })
};


run();

