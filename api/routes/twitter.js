'use strict';

module.exports = function(app) {
	var twitterList = require('../controllers/twitter');

	app.route('/twitter/:from/:to')
		.get(twitterList.list_tweets_in_timerange);
};
