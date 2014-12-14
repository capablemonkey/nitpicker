if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    NitpickerEvent = new Meteor.Collection("events");
    TestResult = new Meteor.Collection("testresults");
  });

  Meteor.publish('testResultz', function(limit) {
    return TestResult.find({}, { limit: limit, sort: {timeStart: -1}});
  });

  Meteor.publish('events', function(limit) {
    return NitpickerEvent.find({}, { limit: limit, sort: {createdDate: -1}});
  });

  /*
   * Server-side methods:
   */

  Meteor.methods({
    getAverageResponseTime: function(endpointName, timeWindow) {
      // TODO: consider using mapreduce here...
      // TODO: consider caching this calulation for windows greater than 24 hours...

      var timeThreshold = new Date(new Date() - timeWindow);
      var results = TestResult.find({
        endpointName: endpointName, 
        timeStart: {$gte: timeThreshold},
        error: null
      }, {});

      var responseTimes = results.map(function(result, index) {
        return result.responseTime;
      });

      var averageResponseTime = responseTimes.reduce(function(prev, current) {
        return prev + current;
      }, 0) / responseTimes.length;

      return averageResponseTime;
    },
    getMaxResponseTime: function(endpointName, timeWindow) {
      var timeThreshold = new Date(new Date() - timeWindow);
      var result = TestResult.findOne({
        endpointName: endpointName, 
        timeStart: {$gte: timeThreshold},
        error: null
      }, {
        sort: {responseTime: -1}
      });

      return result.responseTime;
    }
  });
}