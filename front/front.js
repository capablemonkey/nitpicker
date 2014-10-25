var GRAPH_Y_AXIS_MAX_RESPONSE_TIME = 1500;
var GRAPH_Y_AXIS_MIN_RESPONSE_TIME = 0;

if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault("counter", 0);

  Meteor.subscribe('testResultz', 100);
  Meteor.subscribe('events', 5);

  TestResult = new Meteor.Collection("testresults");
  NitpickerEvent = new Meteor.Collection("events");

  Template.testResults.helpers({
    results: function() {
      return TestResult.find({}, {limit: 10});
    }
  });

  Template.endpointView.helpers({
    endpointName: function() {
      return Template.instance().data;
    },
    DOMName: function() {
      // 'Basic Account Info' -> 'basic-account-info'
      return Template.instance().data.toLowerCase().split(' ').join('-');
    }
  });

  Template.endpointView.rendered = function() {
    data = [{x: 0, y: 0}, {x: 1, y: 1}];

    var endpointName = this.data;
    var DOMName = endpointName.toLowerCase().split(' ').join('-');

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
        tickFormat: function(y) {
          if (y < 1000) { return y + ' ms'}
          if (y >= 1000) { return (y / 1000) + 's'}
        },
        element: document.getElementById('y-' + DOMName),
    });

    graph.render();

    this.autorun(function() {
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
    counter: function () {
      return Session.get("counter");
    }
  });

  Template.hello.events({
    'click button': function () {
      // increment the counter when button is clicked
      Session.set("counter", Session.get("counter") + 1);
    }
  });
}

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

  // TODO: get list of tests
  // TODO: for each test, get average response times, testResults for the past hour
}

// MONGO_URL=mongodb://localhost/my_database meteor --port 8888