'use strict';

var mongoose = require('mongoose');
require('mongoose-double')(mongoose);

var Schema = mongoose.Schema;
var SchemaTypes = mongoose.Schema.Types;


var TweetSchema = new Schema({
  count: Number,
  follower_count: Number,
  start: Date,
  version: Number,
  positive: SchemaTypes.Double,
  negative: SchemaTypes.Double,
  tweets: [{
      id: String,
      created_date: Date,
      text: String,
      hashtags: [String],
      followers: Number,
      user_name: String,
      sentiment: {
          neg: SchemaTypes.Double,
          neu: SchemaTypes.Double,
          pos: SchemaTypes.Double,
          compound: SchemaTypes.Double
      }
  }]
});

TweetSchema.index({start: 1 });


module.exports = mongoose.model('Tweet', TweetSchema);
