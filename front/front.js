if (Meteor.isClient) {
  // counter starts at 0
  Session.setDefault("counter", 0);

  TestResult = new Meteor.Collection("testresults");
  NitpickerEvent = new Meteor.Collection("events");

  Template.testResults.helpers({
    testResults: function() {
      return TestResult.find({}, {limit: 5, sort: {timeStart: -1}});
    }
  });

  Template.nitpickerEvents.helpers({
    getEvents: function() {
      return NitpickerEvent.find({}, {sort: {createdDate: -1}, limit: 5});
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

}

// MONGO_URL=mongodb://localhost/my_database meteor --port 8888