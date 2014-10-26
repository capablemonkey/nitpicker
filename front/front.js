var GRAPH_Y_AXIS_MAX_RESPONSE_TIME = 1500;
var GRAPH_Y_AXIS_MIN_RESPONSE_TIME = 0;
var TIME_WINDOW = {
  '24-hours': 1000 * 60 * 60 * 24,
  '7-days': 1000 * 60 * 60 * 24 * 7,
  '1-month': 1000 * 60 * 60 * 24 * 7
};
var SESSION_PREFIX_AVERAGE_RESPONSE_TIME = "avgResponseTime_";

if (Meteor.isClient) {
  Session.setDefault("timeWindow", '24-hours');

  Meteor.subscribe('testResultz', 100);
  Meteor.subscribe('events', 5);

  TestResult = new Meteor.Collection("testresults");
  NitpickerEvent = new Meteor.Collection("events");

  Template.testResults.helpers({
    results: function() {
      return TestResult.find({}, {limit: 10});
    }
  });

  Template.endpointsStats.helpers({
    endpoints: function() {
      return [
        {name: 'Basic Account Info'}, 
        {name: 'Balance'},
        {name: 'Full Account Info'}
      ];
    }
  });

  Template.endpointView.helpers({
    endpointName: function() {
      return Template.instance().data.endpointName;
    },
    DOMName: function() {
      // 'Basic Account Info' -> 'basic-account-info'
      return Template.instance().data.endpointName.toLowerCase().split(' ').join('-');
    },
    averageResponseTime: function() {
      var endpointName = Template.instance().data.endpointName;
      return Session.get(SESSION_PREFIX_AVERAGE_RESPONSE_TIME + endpointName) || "Loading";
    }
  });

  Tracker.autorun(function() {
    var latestTestResult = TestResult.findOne({}, { limit: 1, sort: {timeStart: -1}});
    if (typeof latestTestResult !== 'undefined') {
      Session.set('lastUpdated', latestTestResult.timeStart);
    }
  });

  Template.endpointView.rendered = function() {
    data = [{x: 0, y: 0}, {x: 1, y: 1}];

    var endpointName = this.data.endpointName;
    var DOMName = endpointName.toLowerCase().split(' ').join('-');
    var template = this;

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
      timeUnit: time.unit('hour')
    });
    var hoverDetail = new Rickshaw.Graph.HoverDetail({ graph: graph });
    var yAxis = new Rickshaw.Graph.Axis.Y({
        graph: graph,
        orientation: 'left',
        tickFormat: formatResponseTime,
        element: document.getElementById('y-' + DOMName),
    });

    graph.render();

    this.autorun(function() {
      // update graph: 
      results = TestResult.find({testId: endpointName}, {limit: 100});
      data = [];
      results.forEach(function(result) {
        data.push({
          x: result.timeStart.getTime() / 1000,
          y: result.responseTime
        });
      });

      data = _.sortBy(data, function(point) { return point.x; });

      console.log('new data,', data);

      graph.series[0].data = data;
      graph.render();

      var timeWindowInMS = TIME_WINDOW[Session.get("timeWindow")];

      // update avg response time:
      Meteor.call('getAverageResponseTime', endpointName, timeWindowInMS, function(err, result) {
        console.log('rt', endpointName, result);
        Session.set(SESSION_PREFIX_AVERAGE_RESPONSE_TIME + endpointName, formatResponseTime(result));
      });
    });
  };

  Template.endpointView.created = function() {
  };

  Template.nitpickerEvents.helpers({
    getEvents: function() {
      return NitpickerEvent.find({}, {limit: 5});
    }
  });

  Template.hello.helpers({
    timeWindow: function () {
      return Session.get("timeWindow");
    },
    lastUpdated: function(ISO) {
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
      // set time window
      Session.set("timeWindow", event.target.name);
    }
  });

  Template.hello.rendered = function() {
    jQuery.timeago.settings.strings.seconds = '%d seconds';
    jQuery.timeago.settings.refreshMillis = 1000;
    $("time.timeago").timeago();
  };

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

  Meteor.methods({
    getAverageResponseTime: function(endpointName, timeWindow) {
      // TODO: consider using mapreduce here...

      var timeThreshold = new Date(new Date() - timeWindow);
      var results = TestResult.find({testId: endpointName, timeStart: {$gte: timeThreshold}}, {});
      var responseTimes = results.map(function(result, index) {
        return result.responseTime;
      });

      var averageResponseTime = responseTimes.reduce(function(prev, current) {
        return prev + current;
      }, 0) / responseTimes.length;

      return averageResponseTime;
    }
  });

  // TODO: get list of tests
  // TODO: for each test, get average response times, testResults for the past hour
}

// MONGO_URL=mongodb://localhost/my_database meteor --port 8888

// Helper functions:

var formatResponseTime = function(y) {
  if (y < 1000) { return Math.floor(y) + ' ms'; }
  if (y >= 1000) { return (y / 1000) + 's'; }
};