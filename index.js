'use strict';

var Alexa = require('alexa-sdk');
var APP_ID = undefined; //OPTIONAL: replace with 'amzn1.echo-sdk-ams.app.[your-unique-value-here]';
var SKILL_NAME = 'Alexa Ding Dong';
var sendRequest = require('./src/Requests.js');

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var speechOutput = 'You can ask questions like who is at my door, or what do you see, or add a person named Ian.';
var repromptSpeech = 'You can ask questions like who is at my door, or what do you see, or add a person named Ian.'+
    ' Now, what can I help you with?';

var handlers = {
    'NewSession': function () {
      this.attributes = {};
      this.emit('QueryIntent');
    },
    'QueryIntent': function () {
      try {
        var querySlot = this.event.request.intent.slots.QueryType.value.toLowerCase();
        var response = "";
        switch (querySlot) {
          case 'who':
          case 'who is':
            sendRequest('whois', 'get', undefined, (err, data)=> {
              this.emit(':tell', err || data, err || data);
            });
            break;
          case 'what':
          case 'describe what':
            sendRequest('what', 'get', undefined, (err, data)=> {
              this.emit(':tell', err || data, err || data);
            });
            break;
          case 'is there a package':
          case 'is my package here':
            sendRequest('package', 'get', undefined, (err, data)=> {
              this.emit(':tell', err || data, err || data);
            });
            break;
          case 'who was here':
            sendRequest('whowas', 'get', undefined, (err, data)=> {
              if (!err) {
                var parsedData = JSON.parse(data);
                var phrase = parsedData.length == 0 ? "No one was here today" : "The following people were here today: "
                for (var i in parsedData) {
                  phrase += parsedData[i].name + ' at ' + parsedData[i].time + ', ';
                }
              }
              this.emit(':tell', err || phrase, err || phrase);
            });
            break;
          case 'anyone':
            response = "You asked if anyone";
            this.emit(':tell', response, response);
            break;
          case 'add a person':
            var nameSlot = this.event.request.intent.slots.FirstName;
            if (nameSlot && nameSlot.value) {
              sendRequest('add', 'post', {name: nameSlot.value}, (err, data)=> {
                if (data === 200) {
                  this.emit(':tell', nameSlot.value + " succesfully added", nameSlot.value + " succesfully added");
                } else {
                  this.emit(':tell', "Adding person failed","Adding person failed");
                }
              });
            } else {
              this.emit(':tell', 'Invalid name', 'Invalid name');
            }
            break;
          case 'here':
            var nameSlot = this.event.request.intent.slots.FirstName;
            if (nameSlot && nameSlot.value) {
              sendRequest('whenwas', 'post', {name: nameSlot.value}, (err, code, data)=> {
                this.emit(':tell', err || nameSlot.value + ' was last here on ' + data, err || nameSlot.value + ' was last here on '  + data);
              });
            } else {
              this.emit(':tell', 'Invalid name', 'Invalid name');
            }
            break;
          case 'update a person':
            var nameSlot = this.event.request.intent.slots.FirstName;
            if (nameSlot && nameSlot.value) {
              sendRequest('update', 'post', {name: nameSlot.value}, (err, code, data)=> {
                this.emit(':tell', err || data, err || data);
              });
            } else {
              this.emit(':tell', 'Invalid name', 'Invalid name');
            }
            break;
          default:
            this.emit(':ask', 'You said: '+ querySlot + ' ' +  speechOutput, repromptSpeech);
            break;
        }
      } catch (err) {
        this.emit(':ask', err, repromptSpeech)
      }
    },
    'AMAZON.HelpIntent': function () {
        this.emit(':ask', speechOutput, repromptSpeech)
    },
    'AMAZON.RepeatIntent': function () {
        this.emit(':ask', speechOutput, repromptSpeech);
    },
    'AMAZON.StopIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'AMAZON.CancelIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'SessionEndedRequest':function () {
        this.emit(':tell', 'Goodbye!');
    }
};
