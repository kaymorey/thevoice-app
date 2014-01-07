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

var Linechart = function() {
    this.tweetMinutes = 0;
    this.minutesCount = 0;

    this.width = 700;
    this.height = 250;
    this.max = 2500;
    this.intervals = [0, 40, 70, 100, 130, 160, 175];

    this.path = "M0,"+this.height;
}
Linechart.prototype = {
    update: function() {
            this.tweetMinutes+= 1;
    },
    interval: function() {
            this.minutesCount += 1;
            this.path += "L"+(this.minutesCount*this.width/this.intervals[this.intervals.length-1])+","+(this.height-(this.tweetMinutes*30*this.height/this.max));
    }
}


var Stats = function() {
    this.total = 0;

    this.mostRetweeted = '';

    this.coachs = {
        'florent': {
                'name': 'Florent',
                'total': 0
        },
        'jenifer': {
                'name': 'Jenifer',
                'total': 0
        },
        'mika': {
                'name': 'Mika',
                'total': 0
        },
        'garou': {
                'name': 'Garou',
                'total': 0
        },
        'total': 0
    }
}

Stats.prototype = {
    update: function(data) {
        this.total += 1;

        if(data.text.toLowerCase().indexOf('florent') != -1) {
            this.coachs['florent']['total'] += 1;
            this.coachs['total'] += 1;
        }
        if(data.text.toLowerCase().indexOf('jenifer') != -1) {
            this.coachs['jenifer']['total'] += 1;
            this.coachs['total'] += 1;
        }
        if(data.text.toLowerCase().indexOf('mika') != -1) {
            this.coachs['mika']['total'] += 1;
            this.coachs['total'] += 1;
        }
        if(data.text.toLowerCase().indexOf('garou') != -1) {
            this.coachs['garou']['total'] += 1;
            this.coachs['total'] += 1;
        }

    }
}

var linechart = new Linechart();
var stats = new Stats();

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
        stats.update(tweet);
        socket.emit('tweet', tweet);         
    });
});
