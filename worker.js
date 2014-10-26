var tests = require('./tests/tests.js');
var config = require('./config.js');
var _ = require('underscore');
var db = require('./database');
var async = require('async');

// worker runs a batch of tests (categorized by environment: sandbox, production)
// in series every config.testInterval milliseconds
var startWorker = function(queue) {
  _.each(tests, function(environment, environmentName) {

    setInterval(function() {
      runTestsInSeries(environment, environmentName, queue);
    }, config.testInterval);

  });
};

// runs tests in series, waiting for each response to come back
// before calling the next one.

function runTestsInSeries(environment, environmentName, screenrQueue) {
  endpointNames = Object.keys(environment);

  var tests = [];

  endpointNames.forEach(function(endpointName) {
    testNames = Object.keys(environment[endpointName]);
    testNames.forEach(function(testName) {
      tests.push(
        function(cb) { 
          runTest(environment[endpointName][testName], 
            environmentName, endpointName, testName, screenrQueue, cb); 
        }
      );
    });
  });

  async.series(tests);
}

// runs .execute() on a test, stores response time and response
// in a new TestResult

function runTest(test, environmentName, endpointName, testName, screenrQueue, callback) {
  // first, run test.before(), and pass results (before) to test.execute()
  
  if (test.before) {
    test.before(function(results) {execute(results);});
  }
  else {
    execute(null);
  }

  function execute(before) {
    var beginTime = Date.now();
    console.log(beginTime, 'running test:', endpointName, testName);

    test.execute(function(err, response) {
      var endTime = Date.now();
      var responseTime = (endTime - beginTime); // time delta in ms

      // save err, response in new TestResult object.

      var testResult = new db.TestResult({
        environmentName: environmentName, //production or sandbox
        endpointName: endpointName,
        testName: testName,
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

      console.log(testResult);

      // notify screenr of this new TestResult
      screenrQueue.push(testResult);

      callback();
    }, before);
  }
}

module.exports = {
  startWorker: startWorker
};