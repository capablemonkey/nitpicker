test({
	responseTimeThreshold: 5000
},
	function(done) {
	// code to run

}, function(err, response, done) {
	// check response

	response.code.should.be.200;

	var threshold = 100;  // consecutive failures

	response.failuresSoFar > threshold;
});

test(function(done) {
	// code to run

}, function(err, response, done) {
	// check response
});


test(function(done) {
	// code to run

}, function(err, response, done) {
	// check response
});


test(function(done) {
	// code to run

}, function(err, response, done) {
	// check response
});

module.exports.sandbox = {
	'id': {
		config: {

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

function TestResult {
	this.timeStart = null;
	this.timeEnd = null;
	this.responseTime = 

	this.response = {
		code: null,
		body: null,
		headers: null
	};

	this.testId = '';
};