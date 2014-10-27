var should = require('should');

// Dwolla API specific modules:
var helper = require('./helper.js');
var config = require('./keys.js');
var dwolla = require('dwolla-node')(config.appKey, config.appSecret);
dwolla.sandbox = config.sandbox;

var tests = {};

var counter = 0;

/* Test structure:

tests.environment = {
	'endpointName': {
		'test1': {
			config: {},
			before: function(done) { },
			execute: function(done, before) { },
			criteria: function(testResult, done) { }
		},
		'test2': {
			config: {},
			before: function(done) { },
			execute: function(done, before) { },
			criteria: function(testResult, done) { }
		}
	}
};

*/

/* Maybe consider a structure like this...
sandbox = tests.newService('Sandbox');

balance = sandbox.addEndpoint('Balance');
test1 = balance.addTest('Request is successful', {
	responseTimeThreshold: 5000,
	before: function(done) {},
	execute: function(done, before) { },
	criteria: function(testResult, done) { }
});
*/

tests.sandbox = {
	'Balance': {
		'Request is successful and response is valid': {
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
		}
	},

	'Send Money': {
		'Request is successful and response is valid': {
			config: {
				responseTimeThreshold: 5000
			},
			execute: function(done, before) {
				dwolla.setToken(config.accessToken);
	      dwolla.send(config.pin, config.merchantDwollaID, '0.01', done);
			},
			criteria: function(testResult, done) {
				(testResult.error == null).should.be.true;
				response = testResult.response.body;

				response.should.be.a.Number
          .above(0);
        done();
			}
		}
	},

	'Basic Account Info': {
		'Request is successful and response is valid': {
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
		}	
	},

	'Full Account Info': {
		'Request is successful and response is valid': {
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
		}
	},

	// 'cause screenr to report an Error': {
	// 	'Request is successful and response is valid': {
	// 		config: {
	// 			responseTimeThreshold: 5000
	// 		},
	// 		execute: function(done) {
	// 			dwolla.setToken(config.accessToken);
	//       /* 
	//       	causes the first five calls to be very slow.
	//       	This is to test the functionality in screenr
	//       	to create and resolve Events 
	//       */
	//       if (counter < 5) {
	//         counter++;
	//         setTimeout(function() {
	//           dwolla.balance(done);
	//         },6000);
	//       } 
	//       else {
	//         dwolla.balance(done);
	//       }
	// 		},
	// 		criteria: function(testResult, done) {
	// 			(testResult.error == null).should.be.true;

	// 			// sample balance: 28041.6
	// 			response = testResult.response.body;
	// 			response.should.be.a.Number
	//         .and.above(0);

	//       done();
	// 		}
	// 	}
	// }
	
};

tests.production = {
	
};

module.exports = tests;