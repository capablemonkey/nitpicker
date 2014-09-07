var tests = require('./tests/tests.js');
var database = require('./database.js');


var unhealthyTests = {};

function flagTestResult(testResult, errorMessage) {
    //flag
    if (unhealthyTests[testResult.testId] === undefined) {
      console.log('Event Begun!!',errorMessage);
      createEvent(testResult, function(doc) {
        unhealthyTests[testResult.testId] = doc;
      })
    }
      testResult.anomaly = errorMessage;
      testResult.save(function(err) { 
        if (err !== null) {
          throw err; 
        }
      });
}

function createEvent(testResult, done) {
  var testEvent = new database.Event({
    description: testResult.anomaly,
    updates: [],
    resolved: false,
    createdDate: new Date()
  });
  testEvent.save(function(err){
    if (err !== null) throw err;
  });
  done(testEvent);
}

function resolveEvent(testResult) {
  console.log('Event resolved!!');
  testEvent = unhealthyTests[testResult.testId];
  testEvent.resolved = true;
  testEvent.resolvedDate = new Date();
  delete unhealthyTests[testResult.testId];
}

/* checks average of last five iterations of this test type,
 if the average is above the configured threshold then scream */
function validateTiming(testResult, done) {
  var testRoutine = tests[testResult.serviceName][testResult.testId];
  var windowWidth = 5;

  database.TestResult
  .find({'testId': testResult.testId}) 
  .limit(windowWidth) // the size of the interval 
  .sort('-timeStart') // get the latest entries 
  .exec(function(err, docs) {
    var averageTime = 0;
    if (docs.length < windowWidth) return;

    for (var i = 0; i < docs.length; i++) {
      averageTime += docs[i].responseTime;
    }
    averageTime /= docs.length;

    console.log(averageTime , testRoutine.config.responseTimeThreshold)
    if (averageTime > testRoutine.config.responseTimeThreshold) {
      flagTestResult( testResult, "Service Response Time Too Long! (Average of last " + docs.length + " exceeded threshold)");
    } else {
      done();// no problems *always* called on successful test case
    }

  })
}

function evaluateTest(testResult) {
  var testRoutine = tests[testResult.serviceName][testResult.testId];

  try {
    testRoutine.criteria(testResult,function() { 
      validateTiming(testResult, function() {
        if (unhealthyTests[testResult.testId] !== undefined) {
          resolveEvent(testResult);
        }
      })
    });
  } catch (e) {
    flagTestResult( testResult, e ); // logic error 
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
