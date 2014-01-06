/*
 * social-app
 * https://github.com/kaymorey/social-app
 *
 * Copyright (c) 2014 Katia Moreira
 * Licensed under the MIT license.
 */

'use strict';

var twitter = require('ntwitter');
var io = require('socket.io').listen(9001);
var EventEmitter = require('events').EventEmitter;
var pubsub = new EventEmitter();

var twitterClient = new twitter({
        consumer_key: '6OhjJFiJmb2OiFVO6y6DA',
        consumer_secret: 'ejjrUeibzVE3VDjuumXydK6yk6QUcbUAhAXAO7ZXvQ',
        access_token_key: '514231459-4u3QktBkFT8t6jQ15U7wZW97B0dmLqSG5qOM5I9D',
        access_token_secret: 'qtMhkuXiWRLjcKRku5eMEANQp3JmKCturbIrp5x1U'
});

twitterClient.stream('statuses/filter', {'track' : '#music'}, function (stream) {
    stream.on('data', function (data) {
            console.log(data.text);
            pubsub.emit('tweet', data);
    });
});

io.sockets.on('connection', function (socket) {
        pubsub.on('tweet', function (tweet) {
            socket.emit('tweet', tweet);         
        });
});