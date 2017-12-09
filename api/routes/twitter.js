'use strict';

module.exports = function(app) {
	var twitterList = require('../controllers/twitter');

	app.route('/twitter/:size/:from/:to')
		.get(twitterList.get_timerange_list);
	app.route('/twitter/:size/:from')
		.get(twitterList.get_timerange);
	app.route('/twitter/last')
		.get(twitterList.get_last);
};
