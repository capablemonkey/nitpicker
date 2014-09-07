var mongoose = require('mongoose');

mongoose.connect ('mongodb://localhost/my_database');

var Schema = mongoose.Schema;

var TestResultSchema = new Schema({
     this.testId :  String, // actual type of test
     this.error : String, 
     this.timeStart : Date,
     this.timeEnd : Date,
     this.timeResponse: Number,
     this.response : {
         code: Number,
         body: String,
         headers: String,
     },
     this.serviceName : String,
     this.id : Schema.Types.ObjectId
     this.anomaly : {
        errorMessage: String,
        attributesThatFailed: [String]
     }
});

module.exports.TestResult = mongoose.model('TestResult', TestResultSchema);

