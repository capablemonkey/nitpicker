var config = require('./config.js');
var worker = require('./worker.js');
var screenr = require('./screenr.js');
var frontend = require('./frontend/app.js');
var EventEmitter = require('events').EventEmitter;

queue = new EventEmitter();
queue.array = [];
console.log(queue);

queue.push = function(element) {
	this.array.push(element)
	this.emit('push');
}
queue.pop = function() {
	var popped_element = this.array.pop();
	this.emit('pop');
	return popped_element;
}

worker.startWorker(queue);
screenr.startScreenr(queue);

// start front end (express)
frontend.set('port', config.port);
frontend.listen(frontend.get('port'));