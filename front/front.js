// Graph Y axis's max and min
var GRAPH_Y_AXIS_MAX_RESPONSE_TIME = 1500;
var GRAPH_Y_AXIS_MIN_RESPONSE_TIME = 0;

// conversion of time windows to milliseconds time delta
var TIME_WINDOW = {
  '1-hour': 1000 * 60 * 60,
  '24-hours': 1000 * 60 * 60 * 24,
  '7-days': 1000 * 60 * 60 * 24 * 7,
  '1-month': 1000 * 60 * 60 * 24 * 7
};

// session prefixes used to name Session variables
var SESSION_PREFIX_AVERAGE_RESPONSE_TIME = "avgResponseTime_";
var SESSION_PREFIX_MAX_RESPONSE_TIME = "maxResponseTime_";

if (Meteor.isClient) {
  Session.setDefault("timeWindow", '1-hour');

  // subscribe to data set published by server
  Meteor.subscribe('testResultz', 100);
  Meteor.subscribe('events', 100);

  TestResult = new Meteor.Collection("testresults");
  NitpickerEvent = new Meteor.Collection("events");

  Template.testResults.helpers({
    results: function() {
      return TestResult.find({}, {limit: 10});
    }
  });

  Template.endpointsStats.helpers({
    endpoints: function() {
      // TODO: get list of tests dynamically instead of hardcoding

      return [
        {name: 'Send Money'},
        {name: 'Balance'},
        {name: 'Basic Account Info'}, 
        {name: 'Full Account Info'}
      ];
    }
  });

  Template.endpointView.helpers({
    // TODO: show latest tests and results for endpoint
    endpointName: function() {
      return Template.instance().data.endpointName;
    },
    DOMName: function() {
      // 'Basic Account Info' -> 'basic-account-info'
      return Template.instance().data.endpointName.toLowerCase().split(' ').join('-');
    },
    // TODO: add max response time past hour
    // TODO: make sure we wait for each response time come back before trying again
    averageResponseTime: function() {
      var endpointName = Template.instance().data.endpointName;
      return Session.get(SESSION_PREFIX_AVERAGE_RESPONSE_TIME + endpointName) || "Loading";
    },
    maxResponseTime: function() {
      var endpointName = Template.instance().data.endpointName;
      return Session.get(SESSION_PREFIX_MAX_RESPONSE_TIME + endpointName) || "Loading";
    },
    getLatestTestResults: function() {
      var endpointName = Template.instance().data.endpointName;
      // NOTE: this is not the best way to retrieve the latest TestResult per test per endpoint.
      // We are plucking out the latest 10 TestResults for the endpoint and removing duplicates
      // on the key testName.  However, it is conceivable for an endpoint to have more than 10
      // different tests, in which case we would only return 10 or less tests.
      var results = TestResult.find({endpointName: endpointName}, {limit: 10, sort: {timeStart: -1}}).fetch();
      return _.uniq(results, false, function(result) { return result.testName; });
    },
    getEvents: function() {
      // Retrieve events for this endpoint within the past 24 hours, 7 days, etc.

      var endpointName = Template.instance().data.endpointName;
      // calculate (now - 24 hours, 7 days, etc.)
      var timeThreshold = new Date(new Date() - TIME_WINDOW[Session.get('timeWindow')]);

      return NitpickerEvent.find({
        endpointName: endpointName,
        createdDate: {$gte: timeThreshold}
      }, {
        limit: 5, 
        sort: {createdDate: -1}
      });
    }
  });

  // Set up graph and response times for endpoint:
  Template.endpointView.rendered = function() {
    // TODO: when timeWindow is changed, change the graph data points

    var endpointName = this.data.endpointName;
    
    // Create new blank graph and render it:
    var graph = setupGraph(endpointName);
    graph.render();

    // Every time a new test result for this endpoint is added,
    // update the graph and response times:
    this.autorun(function() {
      results = TestResult.find({endpointName: endpointName}, {limit: 100});

      data = results.map(function(result) {
        return {
          x: result.timeStart.getTime() / 1000,
          y: result.responseTime
        };
      });

      graph.series[0].data = _.sortBy(data, function(point) { return point.x; });
      graph.render();

      // calulate avg and max response times for the desired time window
      var timeWindowInMS = TIME_WINDOW[Session.get("timeWindow")];

      // have the server crunch numbers and pass it back to us via Session variable
      Meteor.call('getAverageResponseTime', endpointName, timeWindowInMS, function(err, result) {
        Session.set(SESSION_PREFIX_AVERAGE_RESPONSE_TIME + endpointName, formatResponseTime(result));
      });

      Meteor.call('getMaxResponseTime', endpointName, timeWindowInMS, function(err, result) {
        Session.set(SESSION_PREFIX_MAX_RESPONSE_TIME + endpointName, formatResponseTime(result));
      });
    });
  };

  // Events view Template

  Template.nitpickerEvents.helpers({
    getEvents: function() {
      return NitpickerEvent.find({}, {limit: 5});
    }
  });

  // Hello Template

  Template.hello.helpers({
    timeWindow: function () {
      return Session.get("timeWindow");
    },
    lastUpdated: function(ISO) {
      // Show time since last testResult 
      var lastUpdated = Session.get("lastUpdated");
      if (typeof lastUpdated === 'undefined') { return 'Loading...'; }
      if (ISO) { 
        $("time.timeago").data("timeago", { datetime: new Date() });
        $('time.timeago').css({backgroundColor: '#32CD32'});
        $('time.timeago').animate({backgroundColor: "#FFFFFF"}, 1500);
        return lastUpdated.toISOString(); 
      }
      return lastUpdated || 'Loading... ';
    }
  });

  Template.hello.events({
    'click button': function (event) {
      // set desired time window: 1 hour, 24 hours, etc.
      Session.set("timeWindow", event.target.name);
    }
  });

  Template.hello.rendered = function() {
    // set up JQuery timeago to count down time since last testresult
    jQuery.timeago.settings.strings.seconds = '%d seconds';
    jQuery.timeago.settings.refreshMillis = 1000;
    $("time.timeago").timeago();
  };

  // Whenever TestResult collection is updated, pass the time of the latest TestResult
  // to the hello template via Session variable 'lastUpdated'.
  Tracker.autorun(function() {
    var latestTestResult = TestResult.findOne({}, { limit: 1, sort: {timeStart: -1}});
    if (typeof latestTestResult !== 'undefined') {
      Session.set('lastUpdated', latestTestResult.timeStart);
    }
  });

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    NitpickerEvent = new Meteor.Collection("events");
    TestResult = new Meteor.Collection("testresults");
  });

  // TODO: implement server side methods to calculate average response time over 24 hours, 7 days, 1 month
  // use Meteor.call() on client side

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
      var results = TestResult.find({endpointName: endpointName, timeStart: {$gte: timeThreshold}}, {});
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
        timeStart: {$gte: timeThreshold}
      }, {
        sort: {responseTime: -1}
      });

      return result.responseTime;
    }
  });
}

// Helper functions:

function setupGraph(endpointName) {
  var DOMName = endpointName.toLowerCase().split(' ').join('-');

  // bogus data to supply to instantiate graph
  data = [{x: 0, y: 0}, {x: 1, y: 1}];

  var graph = new Rickshaw.Graph( {
    element: document.querySelector("#graph-" + DOMName),
    width: 580,
    height: 250,
    max: GRAPH_Y_AXIS_MAX_RESPONSE_TIME,
    min: GRAPH_Y_AXIS_MIN_RESPONSE_TIME,
    renderer: 'line',
    series: [ {
      color: 'steelblue',
      data: data,
      name: 'Response Time'
    } ]
  } );

  var time = new Rickshaw.Fixtures.Time();
  var xAxis = new Rickshaw.Graph.Axis.Time({ 
    graph: graph,
    timeUnit: time.unit('minute')
  });
  var hoverDetail = new Rickshaw.Graph.HoverDetail({ graph: graph });
  var yAxis = new Rickshaw.Graph.Axis.Y({
      graph: graph,
      orientation: 'left',
      tickFormat: formatResponseTime,
      element: document.getElementById('y-' + DOMName),
  });

  return graph;
}

var formatResponseTime = function(y) {
  if (y < 1000) { return Math.floor(y) + ' ms'; }
  if (y >= 1000) { return (y / 1000).toFixed(2) + ' s'; }
};