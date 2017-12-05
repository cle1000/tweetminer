var moment = require('moment');
var _ = require('lodash');
var TwitterApi = require('twitter');
var mongoose = require('mongoose');
var config = require('./config.js');
var TweetCollection = require('./api/models/tweet.js');

var TweetMiner = function() {
    _.bindAll(this);

    mongoose.connect(config.mongo_server);


    var client = new TwitterApi({
        consumer_key: config.twitter.consumer_key,
        consumer_secret: config.twitter.consumer_secret,
        access_token_key: config.twitter.access_token_key,
        access_token_secret: config.twitter.access_token_secret
    });

    this.stream = client.stream('statuses/filter', {track: config.twitter.track});
    this.stream.on('data', this.processTweets);
    this.stream.on('error', this.processTweetsError);

}

TweetMiner.prototype.processTweets = function (event){
     if (!this.tweetCollection || moment(this.tweetCollection.start).add(1, 'minute').isBefore(moment())){
         if (this.tweetCollection)
            this.tweetCollection.save(function(err, tweet) {
                console.log("saved tweet collection");
                if (err)
                    console.log("error: " +  err);
            });

         this.tweetCollection = new TweetCollection({
            count: 0,
            follower_count: 0,
            start: moment().second(0).milliseconds(0),
            tweets: []
         });
     }


     if (event){
         try {
             this.tweetCollection.tweets.push({
                 id: event.id,
                 created_date: moment(event.created_date),
                 text: event.text,
                 followers: event.user.followers_count,
                 user_id: event.user.screen_name,
                 hashtags: event.entities.hashtags.map(function (h) {
                     return h.text
                 })
             });

             this.tweetCollection.count++;
             this.tweetCollection.follower_count += event.user.followers_count;
         }catch(err){
             console.log(err);
         }
     }
};

TweetMiner.prototype.processTweetsError = function (error){
  console.log(error);
};


new TweetMiner();

