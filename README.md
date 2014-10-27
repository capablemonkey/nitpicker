# nitpicker

nitpicker is functional API monitoring tool that doesn't just ping a machine; it runs functional tests against the API periodially, and provides a web interface for your users to scrutinize the health and performance of your system in real-time and in the past.

nitpicker detects anomalies in the form of failed tests or unusually high response times, and will send SMS, email, and twitter notifications to anyone that subscribes to them.

Tests use `should` (though, you're free to use other assertion libraries) and are designed to be flexible and simple to write.  If you already have node.js API bindings for your API, you can install the module and use it in your tests!

Uses node.js for test running / monitoring, mongodb to store test results and Meteor to expose that data in real time.

Demo: http://nitpicker.gordn.org/

## Setup

Install Meteor if you don't already have it:

`curl https://install.meteor.com | /bin/sh`

From the repo directory, install npm dependencies:

`sudo npm i`

From the `tests` directory, install required npm dependencies:

`sudo npm i`

## Getting started

Make sure that MongoDB daemon is running locally:

`mongod`

Then run:

`./start.sh`

## Writing tests

Here's the overall structure of tests:

```js
tests.production = {
    'Check Balance': {
      'Request is successful and response is valid': {
        config: {},
        before: function(done) { },
        execute: function(done, before) { },
        criteria: function(testResult, done) { }
      },
      'test2': {
        ...
      }
    },
    'endpointName2': {
      ...
    }
  }
};

tests.sandbox = { 
  ...
};
```

We define Environments for an API, for instance, `Production` and `Sandbox`.  Environments have Endpoints, and each Endpoint has one or more Tests.  In this example, the `"Check Balance"` endpoint has two tests named `'Request is successful and response is valid'` and `'test2'`.

Each Test has a `config` object, a `execute` function, a `criteria` function, and optionally, a `before` function.  Let's take a look at an example Test...

```js
'Balance': {
    'Request is successful and response is valid': {
      config: {
        responseTimeThreshold: 5000
      },
      before: function(done) {
        done(5);
      },
      execute: function(done, before) {
        console.log(before);
        dwolla.setToken(config.accessToken);
        dwolla.balance(done);
      },
      criteria: function(testResult, done) {
        (testResult.error == null).should.be.true;

        // sample balance: 28041.6
        response = testResult.response.body;
        response.should.be.a.Number
          .and.above(0);

        done();
      }
    }
  }
```

There is currently only one config option, and it's required.  `responseTimeThreshold` is a threshold in milliseconds for the response time of this API call.  When the average response time of 5 consecutive API calls exceeds this threshold, we'll create an Event -- more on this later.

`before` is an optional function that is analagous to a Setup function (in the Setup / Teardown pattern).  Anything that needs to be done before the API call, for instance, a separate API call to retrieve information needed for the actual test, should be done in `before` since it is important for the accuracy of response time measurement that `execute` be reserved for solely the API call to be tested.  This function will be passed a callback function, `done`, which it must call, optionally with a result, when `before` is done.  The result of `before` is then passed to the `execute` function.

TODO: describe execute and criteria...