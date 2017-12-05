'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TweetSchema = new Schema({
  count: Number,
  follower_count: Number,
  start: Date,
  tweets: [{
      id: String,
      created_date: Date,
      text: String,
      hashtags: [String],
      followers: Number,
      user_name: String,
  }]
});


module.exports = mongoose.model('Tweet', TweetSchema);
