if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault("counter", 0);

  Meteor.subscribe('testResultz', 5);
  Meteor.subscribe('events', 5);

  TestResult = new Meteor.Collection("testresults");
  NitpickerEvent = new Meteor.Collection("events");

  Template.testResults.helpers({
    results: function() {
      return TestResult.find({}, {limit: 5});
    }
  });

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
}

// MONGO_URL=mongodb://localhost/my_database meteor --port 8888