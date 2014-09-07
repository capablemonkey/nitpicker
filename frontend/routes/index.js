var express = require('express');
var router = express.Router();
var db = require('../../database.js');

/* GET home page. */
router.get('/', function(req, res) {

	var testResults;
	var events;

	db.TestResult
		.find()
		.sort('-timeStart')
		.limit(10)
		.exec()

	.then(function(results){
		testResults = results;
		
		return db.Event
			.find()
			.sort('-createdDate')
			.limit(10)
			.exec();
	})

	.then(function(results) {
		events = results;
		console.log(events)
	})
	.then(function() {
		res.render('index', {
	  	prodOk: true,
	  	prodMessage: 'Smooth sailing!',
	  	sandboxOk: false,
	  	sandboxMessage: 'Experiencing issues...',
	  	events: events,
	  	results: testResults
	  });
	});

  
});

module.exports = router;
