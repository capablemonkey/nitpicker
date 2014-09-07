var tests = require('./tests/tests.js');
var database = require('./database.js');


// interface to contact notifyr
function generateNotification(anomaly) {

}

function flagTestResult(testResult, errorMessage) {
    database.TestResult.findById(testResult.id, function(err, doc) {
        if (err !== null) {
            throw err;
        } 
        else if (doc !== null) {
            doc.anomaly = errorMessage;
            doc.save(function(err) {
                throw err;
            });
        } else  {
            throw 'somehow there was not an error, and not a doc from the db';
        }
    })
}

function evaluateTest(testResult) {
    

    var testRoutine = tests[testResult.serviceName][testResult.id];
    try {
        testRoutine.criteria(testResult,function() {});

    } catch (e) {
        flagTestResult( testResult, e );        
    }


}

var startScreenr = function(queue) {
	queue.on('push',function() {
		var testResult = queue.pop();
		evaluateTest( testResult );
	})
};

module.exports = {
  startScreenr: startScreenr
};
