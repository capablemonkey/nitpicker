var tests = require('./tests/tests.js');
var config = require('./config.js');
var _ = require('underscore');

var startWorker = function() {
  _.each(tests, function(service) {
    _.each(service, function(test, name) {
      
      setInterval(function() {
        runTest(test, name);
      }, config.testInterval);

    });
  });
};

function runTest(test, name) {
  console.log(new Date(), 'running test:', name);

  test.execute(function(err, response) {
    // save err, response in new TestResult object.
    console.log(err);
    console.log(response);

    var testResult = {
      
    };

  });
}

module.exports = {
  startWorker: startWorker
};