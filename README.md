# nitpicker

# Getting started

`node app.js`

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