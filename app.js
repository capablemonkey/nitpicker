var worker = require('./worker');
var screenr = require('./screenr');
var frontend = require('./frontend');

worker.startWorker();
screenr.startScreenr();
frontend.startFrontend();