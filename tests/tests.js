var helper = require('./helper.js');
var config = require('./keys.js');
var dwolla = require('dwolla-node')(config.appKey, config.appSecret);
var should = require('should');

dwolla.sandbox = config.sandbox;

var counter = 0;

module.exports.sandbox = {
	'Balance': {
		config: {
			responseTimeThreshold: 5000
		},
		before: function(done) {
			done(5);
		},
		execute: function(done, before) {
			console.log(before);
			dwolla.setToken(config.accessToken);
      dwolla.balance(done);
		},
		criteria: function(testResult, done) {
			(testResult.error == null).should.be.true;

			// sample balance: 28041.6
			response = testResult.response.body;
			response.should.be.a.Number
        .and.above(0);

      done();
		}
	},
	'Basic Account Info': {
		config: {
			responseTimeThreshold: 5000
		},
		execute: function(done, before) {
			dwolla.setToken(config.accessToken);
      dwolla.basicAccountInfo('gordon@dwolla.com', done);
		},
		criteria: function(testResult, done) {
			(testResult.error == null).should.be.true;

			response = testResult.response.body;

			// valdidate fields
			response.should.have.properties('Id', 'Name', 'Latitude', 'Longitude');
      response.Id.should.be.a.String
        .and.match(helper.patterns.dwollaId);
      response.Name.should.be.a.String;
      response.Latitude.should.be.a.Number;
      response.Longitude.should.be.a.Number;

      done();
		}
	},
	'Full Account Info': {
		config: {
			responseTimeThreshold: 5000
		},
		execute: function(done, before) {
			dwolla.setToken(config.accessToken);
      dwolla.fullAccountInfo(done);
		},
		criteria: function(testResult, done) {
			(testResult.error == null).should.be.true;

			response = testResult.response.body;

			// valdidate fields
			response.should.have.properties('City', 'State', 'Type', 'Id', 'Name', 'Latitude', 'Longitude');
      response.City.should.be.a.String;
      response.State.should.be.a.String;
      response.Type.should.be.a.String;
      response.Id.should.match(helper.patterns.dwollaId);
      response.Name.should.be.a.String;
      response.Latitude.should.be.a.Number;
      response.Longitude.should.be.a.Number;

      done();
		}
	},
	'cause screenr to report an Error': {
		config: {
			responseTimeThreshold: 5000
		},
		execute: function(done) {
			dwolla.setToken(config.accessToken);
      /* 
      	causes the first five calls to be very slow.
      	This is to test the functionality in screenr
      	to create and resolve Events 
      */
      if (counter < 5) {
        counter++;
        setTimeout(function() {
          dwolla.balance(done);
        },6000);
      } 
      else {
        dwolla.balance(done);
      }
		},
		criteria: function(testResult, done) {
			(testResult.error == null).should.be.true;

			// sample balance: 28041.6
			response = testResult.response.body;
			response.should.be.a.Number
        .and.above(0);

      done();
		}
	}
};

module.exports.production = {
	'id': {
		config: {

		},
		execute: function(done) {
			done();
		},
		criteria: function(testResult, done) {
			done();
		}
	}
};