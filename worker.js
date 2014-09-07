var tests = require('./tests/tests.js');
var config = require('./config.js');
var _ = require('underscore');
var db = require('./database');

var arrayOfTests = [];
var wrapFunctionCall = function(funcToWrap /*...args not including callback...*/) {
    var params = arguments;
    arrayOfTests.push(function(done) {
        params = Array.prototype.slice.call(params,1);
        Array.prototype.push.call(params, done)
        funcToWrap.apply(null, params);
    })
}

var startWorker = function(queue) {
  
  _.each(tests, function(service, serviceName) {
    _.each(service, function(test, name) {
      wrapFunctionCall(runTest, test, name, service, serviceName, queue);
    });
  });

  var series = new Series(arrayOfTests);
  series.runSeries();
  setInterval(series.runSeries, 60*1000*2);//two minutes

};

// TODO: run an entire Service every interval secs, which consists of a async.

function runTest(test, name, service, serviceName, queue, done) {
  var beginTime = Date.now();
  console.log(beginTime, 'running test:', name);
  test.execute(function(err, response) {
    var endTime = Date.now();
    var responseTime = (endTime - beginTime); // should be in ms

    // save err, response in new TestResult object.
    console.log(err);
    console.log(response);

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
    // TODO: tack on the document ID when you pass to queue.
    testResult.save();

    console.log(testResult)

    queue.push(testResult);
    done();
  });
}

module.exports = {
  startWorker: startWorker
};


var Series = function( arrayOfFunctions ) {
    var series = this;
    series.list = [];
    series.position = -1;
    series.timeout = 10000;//milliseconds to timeout any individual
    series._finishedCallback = null;
    series._startTime = null;
    series._endTime = null;
    series._duration = null;
    
    series.runSeries = function( timeout, doneAll ) {
        series._finishedCallback = doneAll;
        series._startTime = Date.now();
        series._next();
    }
    series._next = function() {
        series.position++;
        if (series.position >= series.list.length) {
            series.position = -1;
            if (series._finishedCallback) {
                series._finishedCallback()
            }
            series._endTime = Date.now();
            series._duration = series._endTime - series.startTime;
            //series finished
            console.log('series completed')
        } else {
            series.list[series.position]();
        }
    }

    series._wrapFunction = function(funcToWrap) {
        return function() {
            var finished = false;
            var func = funcToWrap;
            var done = function() {
                if (finished === true) {
                    return; //response is too late
                }
                else {
                    finished = true;
                    series._next();
                }
            }

            setTimeout(function(){
              if (finished === false){
                console.log('timeout, series proceeding')
                done();
              }
            }, series.timeout);
            var error = null;
            try{
              func(done);
            } catch (e) {
              done();
              throw e;
            }
        }
    }
    
    for (var i in arrayOfFunctions){
        var wrapperFunc = series._wrapFunction(arrayOfFunctions[i]);
        series.list.push(wrapperFunc);
    }

} 