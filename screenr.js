var tests = require('./tests/tests.js');
var database = require('./database.js');


// interface to contact notifyr
function generateNotification(anomaly) {

}



function flagTestResult(testResult, errorMessage) {
    console.log('test result flagged!!',errorMessage)
      testResult.anomaly = errorMessage;
      testResult.save(function(err) { 
        if (err !== null) {
          throw err; 
        }
      });
}

var healthiness = {};
var healthinessThreshhold = 0.75;// TODO think about the counting method
var windowWidth = 5;
function evaluateTest(testResult) {
    
  var testRoutine = tests[testResult.serviceName][testResult.testId];

  console.log('begin evaluation')

  try {
      testRoutine.criteria(testResult,function() { 
        database.TestResult
          .find({'testId': testResult.testId})
          .limit(windowWidth) /* the size of the interval */
          .sort('-timeStart')
          .exec(function(err, docs) {

            var numTooSlow = 0;// Counting method
            var averageTime = 0;// Average method
            if (docs.length < windowWidth) return;

            // iterate over rest of documents and find average
            // also count the number of individual documents aver the threshold
            for (var i = 0; i < docs.length; i++) {
              if (docs[i].responseTime > testRoutine.config.responseTimeThreshold) {
                numTooSlow++;
              }
              // aggregate time to find average later
              averageTime += docs[i].responseTime;
            }

            // determine average
            averageTime /= docs.length;

            console.log('average time',averageTime)
            if (averageTime > testRoutine.config.responseTimeThreshold) {
              flagTestResult( testResult, "Service Response Time Too Long! (Average of last "+docs.length+" exceeded threshold)" );
            } 
            if (numTooSlow > Math.ceil( ( 1 - healthinessThreshhold ) * docs.length ) ) {
              // if healthiness threshold is .75 then 0.25 of the elements are 
              // invalid
              flagTestResult( testResult, "Service Response Time Too Long! (Count of failures in last "+docs.length+" over "+healthinessThreshhold*100+"%)" )
            }
          })
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
