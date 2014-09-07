var mongoose = require('mongoose');

mongoose.connect ('mongodb://localhost/my_database');

var Schema = mongoose.Schema;

/* TestResults are generated for every test against the API,
   every problematic TestResult has an anomaly */
var TestResultSchema = new Schema({
  testId :  String, // actual type of test
  error : String, 
  timeStart : Date,
  timeEnd : Date,
  responseTime: Number,
  response : {
  code: Number,
  body: Schema.Types.Mixed,
  headers: String
  },
  serviceName : String,
  anomaly : String
});

/* Events are used to represent
 problems currently happening */
var EventSchema = new Schema({
  description: String,
  testId : String,
  serviceName: String,
  updates: [],
  resolved: Boolean,
  createdDate: Date,
  resolvedDate: Date
});

/* expose the mongoose models

these guys can be used like...
var database = require('./database.js');
var event = new database.Event({ ...initializers... });

 */
module.exports.TestResult = mongoose.model('TestResult', TestResultSchema);
module.exports.Event = mongoose.model('Event', EventSchema);
