var tests = require('tests/tests.js');

// function TestResult {
//  this.testId =  null;
//	this.error = null;
// 	this.timeStart = null;
// 	this.timeEnd = null;
// 	this.responseTime = null;
// 	this.responseCode = null;
// 	this.response = {
// 		code: null,
// 		body: null,
// 		headers: null
// 	};
//  this.serviceName = null;
//  this.id = null;
// }

function Anomaly() {
	this.testId = null;
	this.testDatabaseId = null;
	this.details = {
		this.message = null;
		// other things?
	};
}

// interface to contact notifyr
function generateNotification() {

}

function flagTestResult() {

}

function evaluateTest(testResult) {
    
    var testRoutine = tests[testResult.serviceName][testResult.id];
    
    testRoutine.criteria(testResult, function( successStatus, failureMessage ) {
    	if (successStatus === false) {
    		

    	} 
    	else if (successStatus === true) {
    		// 
    	} 
    	else {
    		// bad programming get's us here
    	}
    })

}

var startScreenr = function(queue) {
	queue.on('push',function() {
		var testResult = queue.pop();
		evaluateTest( test_result );
	})
};

module.exports = {
  startScreenr: startScreenr
};
