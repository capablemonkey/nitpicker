var tests = require('./tests/tests.js');
var config = require('./config.js');
var _ = require('underscore');
var db = require('./database');
var async = require('async');

// worker runs a batch of tests (called a Service)
// in series every config.testInterval milliseconds
var startWorker = function(queue) {
  _.each(tests, function(service, serviceName) {

    setInterval(function() {
      runTestsInSeries(service, serviceName, queue);
    }, config.testInterval);

  });
};

// runs tests in series, waiting for each response to come back
// before calling the next one.

function runTestsInSeries(service, serviceName, screenrQueue) {
  testNames = Object.keys(service);
  var tests = testNames.map(function(testName) {
    return function(cb) {runTest(service[testName], testName, serviceName, screenrQueue, cb);};
  });

  async.series(tests);
}

// runs .execute() on a test, stores response time and response
// in a new TestResult

function runTest(test, name, serviceName, screenrQueue, callback) {
  // first, run test.before(), and pass results (before) to test.execute()
  
  if (test.before) {
    test.before(function(results) {execute(results);});
  }
  else {
    execute(null);
  }

  function execute(before) {
    var beginTime = Date.now();
    console.log(beginTime, 'running test:', name);

    test.execute(function(err, response) {
      var endTime = Date.now();
      var responseTime = (endTime - beginTime); // time delta in ms

      // save err, response in new TestResult object.

      var testResult = new db.TestResult({
        testId: name,
        serviceName: serviceName, //production or sandbox
        error: err,
        timeStart: Date(beginTime),
        timeEnd: Date(endTime),
        responseTime: responseTime,
        response: {
          code: null,
          body: response,
          headers: null
        }
      });

      testResult.save();

      // console.log(testResult);

      // notify screenr of this new TestResult
      screenrQueue.push(testResult);

      callback();
    }, before);
  }
}

module.exports = {
  startWorker: startWorker
};