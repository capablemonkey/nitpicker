var tests = require('./tests/tests.js');
var config = require('./config.js');
var _ = require('underscore');

var startWorker = function() {
  _.each(tests, function(service) {
    _.each(service, function(test, name) {

      setInterval(function() {
        runTest(test, name, service);
      }, config.testInterval);

    });
  });
};

// TODO: run an entire Service every interval secs, which consists of a async.

function runTest(test, name, service) {
  var beginTime = Date.now();
  console.log(beginTime, 'running test:', name);

  test.execute(function(err, response) {
    var endTime = Date.now();
    var responseTime = (endTime - beginTime); // should be in ms

    // save err, response in new TestResult object.
    console.log(err);
    console.log(response);

    var testResult = {
      id: null, // database id
      testId: name,
      serviceName: service, //production or sandbox
      error: err,
      timeStart: Date(beginTime),
      timeEnd: Date(endTime),
      responseTime: responseTime,
      response: {
        code: null,
        body: response,
        headers: null
      }
    };

    console.log(testResult);

  });
}

module.exports = {
  startWorker: startWorker
};