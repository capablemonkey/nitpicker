var dwolla = require('dwolla-node');

module.exports.sandbox = {
	'get balance': {
		config: {
			responseTimeThreshold: 5000
		},
		code: function(done) {
			
		},
		criteria: function(error, response, done) {
			
		}
	}
};

module.exports.production = {
	'id': {
		config: {

		},
		code: function(done) {

		},
		criteria: function(error, response, done) {

		}
	}
};