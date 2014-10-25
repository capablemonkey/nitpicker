# nitpicker

nitpicker is funtional API monitoring tool that doesn't just ping a machine; it runs integration tests against the API periodially, and provides a public, real time interface to hold you accountable to your users.

nitpicker detects anomalies in the form of failed tests or unusually high response times, and will send SMS, email, and twitter notifications to anyone that subscribes to them.

Uses node.js for test running / monitoring, mongodb to store test results and Meteor to expose that data in real time.

# Getting started

Make sure that MongoDB daemon is running locally:

`mongod`

Then run:

`./start.sh`

### TestResult

```js
var TestResultSchema = new Schema({
     this.testId :  String, // actual type of test
     this.error : String, 
     this.timeStart : Date,
     this.timeEnd : Date,
     this.timeResponse: Number,
     this.response : {
         code: Number,
         body: String,
         headers: String,
     },
     this.serviceName : String,
     this.id : Schema.Types.ObjectId
     this.Anomaly : {
        errorMessage: String,
        attributesThatFailed: [String]
     }
});
```

### Test
We define tests for a particular environment, which is in this case `sandbox`.

```js
module.exports.sandbox = {
	'get balance': {
		config: {
			responseTimeThreshold: 5000
		},
		code: function(done) {

		},
		criteria: function(testResult, done) {

		}
	}
};
```
In the example above, we define the `get balance` test.