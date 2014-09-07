# nitpicker

# Getting started

`node app.js`

### TestResult

```js
 testResult : {
    this.testId : null;
	this.error : null;
 	this.timeStart : null;
 	this.timeEnd : null;
 	this.responseTime : null;
 	this.responseCode : null;
 	this.response : {
 		code: null,
 		body: null,
 		headers: null
 	};
 	this.serviceName: null;//production or sandbox
 	this.id : null; // database id
 }
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