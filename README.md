# nitpicker

# Getting started

`node app.js`

### TestResult

```js
testResult = {
	testId: null,
	timeStart: null,
	timeEnd: null,
	responseTime: null,
	response: {
		code: null,
		body: null,
		headers: null
	}
};
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
		criteria: function(error, response, done) {

		}
	}
};
```
In the example above, we define the `get balance` test.