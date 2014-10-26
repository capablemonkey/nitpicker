var mongoose = require('mongoose');

mongoose.connect ('mongodb://localhost/nitpicker');

var Schema = mongoose.Schema;

/* TestResults are generated for every test against the API,
   every problematic TestResult has an anomaly */
var TestResultSchema = new Schema({
  environmentName : String,
  endpointName :  String, 
  testName: String,
  error : String, 
  timeStart : Date,
  timeEnd : Date,
  responseTime: Number,
  response : {
    code: Number,
    body: Schema.Types.Mixed,
    headers: String
  },
  anomaly : String
});

/* Events are used to represent
 problems currently happening */
var EventSchema = new Schema({
  description: String,
  environmentName: String,
  endpointName : String,
  testName: String,
  updates: [],
  resolved: Boolean,
  createdDate: Date,
  resolvedDate: Date,
  testResults: []
});

/* expose the mongoose models

these guys can be used like...
var database = require('./database.js');
var event = new database.Event({ ...initializers... });

 */
module.exports.TestResult = mongoose.model('TestResult', TestResultSchema);
module.exports.Event = mongoose.model('Event', EventSchema);
