var mongoose = require('mongoose');

mongoose.connect ('mongodb://localhost/my_database');

var Schema = mongoose.Schema;

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

var EventSchema = new Schema({
  description: String,
  updates: [],
  resolved: Boolean,
  createdDate: Date,
  resolvedDate: Date
});

module.exports.TestResult = mongoose.model('TestResult', TestResultSchema);
module.exports.Event = mongoose.model('Event',EventSchema);

