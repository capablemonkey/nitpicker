var config = require('./config.js');
var worker = require('./worker.js');
var screenr = require('./screenr.js');
var frontend = require('./frontend/app.js');

worker.startWorker();
screenr.startScreenr();

// start front end (express)
frontend.set('port', config.port);
frontend.listen(frontend.get('port'));