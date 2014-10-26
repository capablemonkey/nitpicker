var config = require('./config.js');
var worker = require('./worker.js');
var screenr = require('./screenr.js');
var EventEmitter = require('events').EventEmitter;

//TODO decouple the screenr from the worker, maybe package the
// screenr with the notifier
queue = new EventEmitter();
queue.array = [];

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

console.log('*** Started worker and screenr.');