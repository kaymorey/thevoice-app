$(function() {

	var socket = io.connect('http://localhost:9001');

	socket.on('tweet', function (tweet, dataStats) {
        $('.jumbotron .lead').html(tweet.text);
    });


});
