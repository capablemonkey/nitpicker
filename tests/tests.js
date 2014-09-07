var config = require('./keys.js');
var dwolla = require('dwolla-node')(config.appKey, config.appSecret);
var should = require('should');

dwolla.sandbox = config.sandbox;

module.exports.sandbox = {
	'get balance': {
		config: {
			responseTimeThreshold: 5000
		},
		execute: function(done) {
			dwolla.setToken(config.accessToken);
      dwolla.balance(done);
		},
		criteria: function(testResult, done) {
			(testResult.error == null).should.be.true;

			// sample balance: 28041.6
			response = testResult.response.body;
			response.should.be.a.Number
        .and.above(0);

      done(true);
		}
	}
};

module.exports.production = {
	'id': {
		config: {

		},
		execute: function(done) {

		},
		criteria: function(testResult, done) {

		}
	}
};