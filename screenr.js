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

var healthiness = {};
var healthinessThreshold = 3;
var periodLength = 5;
var periodCounter = 0;
function evaluateTest(testResult) {
    
  var testRoutine = tests[testResult.serviceName][testResult.id];
  try {
      testRoutine.criteria(testResult,function() {

        if (healthiness[testResult.testId] === undefined) {
          healthiness[testResult.testId] = {
              periodCounter : 0,
              score : 0
          };
        }
        
        var curTestHealthiness = healthiness[testResult.testId];
        curTestHealthiness.periodCounter++;
        
        if ( testResult.responseTime > testRoutine.config.responseTimeThreshold) {
            curTestHealthiness.score++; // fails one health check
        }
        if (curTestHealthiness.score > healthinessThreshold) {
            // create an event AND flag an anomaly
            
            flagTestResult( testResult, "Service Response Time Too Long!" );
            console.log("Service Response Time Too Long!")
        }

        if (curTestHealthiness.periodCounter > periodLength) {// interval has ended, reset
            curTestHealthiness.periodCounter = 0;
            curTestHealthiness.score = 0;
        }
      });
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
