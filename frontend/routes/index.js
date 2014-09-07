var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', {
  	prodOk: true,
  	prodMessage: 'Smooth sailing!',
  	sandboxOk: false,
  	sandboxMessage: 'Experiencing issues...'
  });
});

module.exports = router;
