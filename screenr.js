var tests = require('./tests/tests.js');
var database = require('./database.js');


var unhealthyTests = { /* tests which have open Events associated with them */
  'production':{},
  'sandbox':{}
};

/* triggers the beginning of an Event if one has not already begun for this
  test type. Also updates the testResult's anomaly message to the given text.*/
function flagTestResult(testResult, errorMessage) {
    //flag
    if (unhealthyTests[testResult.serviceName][testResult.testId] === undefined) {
      console.log('Event Begun!!',errorMessage);
      createEvent(testResult, function(doc) {
        unhealthyTests[testResult.serviceName][testResult.testId] = doc;
      })
    }
      testResult.anomaly = errorMessage;
      testResult.save(function(err) { 
        if (err !== null) {
          throw err; 
        }
      });
}
/* recieves a doc for a testResult and a callback,
 instantiates an Event for the given testResult's type of test
 and service. Saves the Event to the DB and passes the Event to
 the callback */
function createEvent(testResult, done) {
  var testEvent = new database.Event({
    description: testResult.anomaly,
    testId: testResult.testId,
    serviceName: testResult.serviceName,
    updates: [],
    resolved: false,
    createdDate: new Date()
  });
  testEvent.save(function(err){
    if (err !== null) throw err;
  });
  done(testEvent);
}

/* recieves a doc for a testResult, takes it's testId
 and finds if any Events exist for this type of test
 if so, then resolve the EVent */
function resolveEvent(testResult) {
  console.log('Event resolved!!');
  testEvent = unhealthyTests[testResult.serviceName][testResult.testId];
  /* there is a peculiarity available here... the Event
   object has an array of updates inside of it. The object stored
   here then *could* be out of date by the time the Event is resolved. In fact
   it is likely that a developer will push a note to the db in the meantime.
   To avoid issues from this, the testEvent is updated here before saving */
  database.Event.findById(testEvent._id,function(err, doc) {
    if (err !== null) {throw err;}
    testEvent = doc;
    testEvent.resolved = true;
    testEvent.resolvedDate = new Date();
    testEvent.save(function(err) {
      if (err !== null) {
        throw err;
      }
    })
    delete unhealthyTests[testResult.serviceName][testResult.testId];
  })
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
/* two part evaluation of the testResult,
  first - runs the criteria (throw will occur with any issues)
  second - runs the timing validation
          which averages the last several
          calls of this type and if the average
          is above the threshold then throws an error.
  if both steps pass without throwing anything, then
  the testResult will have it's type resolved (if an Event was open)
otherwise nothing will happen */
function evaluateTest(testResult) {
  var testRoutine = tests[testResult.serviceName][testResult.testId];

  try {
    testRoutine.criteria(testResult,function() { 
      validateTiming(testResult, function() {
        if (unhealthyTests[testResult.serviceName][testResult.testId] !== undefined) {
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
