"use strict";

var EventEmitter = require('./EventEmitter');

/**
  Websocket server implementation for client-side development of protocols
*/

function MessageQueue(options) {
  options = options || {};
  MessageQueue.super.apply(this);

  this.clients = {};
  this.messages = [];

  // If manual processing is on user must call tick to process the next message
  if (!options.manualProcess) {
    setInterval(this._processMessage.bind(this), 100);  
  }
}

MessageQueue.Prototype = function() {
  /**
    A new client connects to the message queue
  */
  this.connectClient = function(ws) {
    this.clients[ws.clientId] = ws;
    this.emit('connection:requested', ws.clientId);
  };

  /*
    This is called by the server as a response to
    connection:requested. ws is the server-side end of
    the communication channel
  */
  this.connectServerClient = function(ws) {
    this.clients[ws.clientId] = ws;
  };

  /*
    Adds a message to the queue
  */
  this.pushMessage = function(message) {
    this.messages.push(message);
  };

  this.tick = function() {
    this._processMessage();
  };

  /*
    Takes one message off the queue and delivers it to the recepient
  */
  this._processMessage = function() {
    var message = this.messages.shift();
    if (!message) return; // nothing to process
    var to = message.to;
    // var from = message.from;
    this.clients[to]._onMessage(message.data);
  };
};

EventEmitter.extend(MessageQueue);

module.exports = MessageQueue;