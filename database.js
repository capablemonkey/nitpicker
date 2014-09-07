var mongoose = require('mongoose');

mongoose.connect ('mongodb://localhost/my_database');

var Schema = mongoose.Schema;

var TestResultSchema = new Schema({
     testId :  String, // actual type of test
     error : String, 
     timeStart : Date,
     timeEnd : Date,
     timeResponse: Number,
     response : {
         code: Number,
         body: Schema.Types.Mixed,
         headers: String
     },
     serviceName : String,
     anomaly : String
});

module.exports.TestResult = mongoose.model('TestResult', TestResultSchema);

