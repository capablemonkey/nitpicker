var tests = require('./tests/tests.js');
var database = require('./database.js');


var unhealthyTests = {};

function flagTestResult(testResult, errorMessage) {
    //flag
    if (unhealthyTests[TestResult.testId] === undefined) {
      createEvent(TestResult, function(doc) {
        unhealthyTests[testResult.testId] = doc;
      })
    }
    console.log('test result flagged!!',errorMessage);
      testResult.anomaly = errorMessage;
      testResult.save(function(err) { 
        if (err !== null) {
          throw err; 
        }
      });
}

function createEvent(testResult) {
  var testEvent = new database.Event({
    description: testResult.anomaly,
    updates: [],
    resolved: false,
    createdDate: new Date()
  });
  testEvent.save(function(err){
    if (err !== undefined) throw err;
  });
}

function resolveEvent(testResult) {
  if (unhealthyTests[testResult.testId] === undefined) return;
  console.log('test result resolved!!');
  testEvent = unhealthyTests[testResult.testId];
  testEvent.resolved = true;
  testEvent.resolvedDate = new Date();
  delete unhealthyTests[TestResult.testId];
}



function evaluateTest(testResult) {
  var windowWidth = 5;
  var testRoutine = tests[testResult.serviceName][testResult.testId];

  try {
    testRoutine.criteria(testResult,function() { 
      database.TestResult
      .find({'testId': testResult.testId}) 
      .limit(windowWidth) // the size of the interval 
      .sort('-timeStart') // get the latest entries 
      .exec(function(err, docs) {
        var averageTime = 0;// Average method
        if (docs.length < windowWidth) return;

        // iterate over rest of documents and find average
        // also count the number of individual documents aver the threshold
        for (var i = 0; i < docs.length; i++) {
          // aggregate time to find average later
          averageTime += docs[i].responseTime;
        }

        // determine average
        averageTime /= docs.length;

        if (averageTime > testRoutine.config.responseTimeThreshold) {
          throw "Service Response Time Too Long! (Average of last " + docs.length + " exceeded threshold)"
        } else {
          resolveEvent(testResult);
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
