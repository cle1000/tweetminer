var moment = require('moment');
var _ = require('lodash');
var TwitterApi = require('twitter');
var mongoose = require('mongoose');
var config = require('./config.js');
var log = require('./log/log.js')
var TweetCollection = require('./api/models/tweet.js');


class TweetMiner {
    constructor() {
        mongoose.Promise = require('bluebird');
        mongoose.connect(config.mongo_server, {useMongoClient: true});

        var client = new TwitterApi({
            consumer_key: config.twitter.consumer_key,
            consumer_secret: config.twitter.consumer_secret,
            access_token_key: config.twitter.access_token_key,
            access_token_secret: config.twitter.access_token_secret
        });

        this.resetTweetCollection();

        this.stream = client.stream('statuses/filter', {track: config.twitter.track});
        this.stream.on('data', this.processTweets.bind(this));
        this.stream.on('error', (error) =>  log.error( `Twitter reports error: ${error}`) );
        this.stream.on('end', () => {
            log.info("Twitter stream end, try restart");
            new TweetMiner();
        } );

        log.info(`Tweetminer tracks now all tweet belonging to [${config.twitter.track}]`);
    }

    processTweets(event) {
        var collectionOlderThanOneMinute = moment(this.tweetCollection.start).add(1, 'minute').isBefore(moment());
        if (collectionOlderThanOneMinute) {
            //save collection to db
            this.saveTweetCollection();
            this.resetTweetCollection();
        }
        if (event) {
            this.tweetCollection.tweets.push({
                id: event.id,
                created_date: moment(event.created_date),
                text: event.text,
                followers: event.user ? event.user.followers_count : 0,
                user_id: event.user ? event.user.screen_name : 'unknown',
                hashtags: event.entities ? event.entities.hashtags.map((h) => h.text) : []
            });

            this.tweetCollection.count++;
            this.tweetCollection.follower_count += event.user ? event.user.followers_count : 0;
        }
    }

    saveTweetCollection() {
        this.tweetCollection.save(function(err, t){
            if (err)
                log.error ("Error on save: " + err);
            log.info(`TweetCollection [${t.count}] stored, last tweet on ${moment(_.last(t.tweets).created_date).format()}`);
        });
    }

    resetTweetCollection(){
         this.tweetCollection = new TweetCollection({
            count: 0,
            follower_count: 0,
            start: moment().second(0).milliseconds(0),
            tweets: []
         });
    }
}

new TweetMiner();

