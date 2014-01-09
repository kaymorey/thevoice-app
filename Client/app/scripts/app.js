$(function() {

    var socket = io.connect('http://localhost:9001');

    var SCREEN_WIDTH = window.innerWidth,
        SCREEN_HEIGHT = window.innerHeight;

    // Colors
    var yellow = "#fab13b",
    red = "#d10000",
    green = "#70ad88",
    blue = "#4bcddd",
    red = "#d10000";

    // Raphael objects
    paperCirclesWidth = SCREEN_WIDTH * 66/100;
    paperCirclesHeight = SCREEN_HEIGHT / 2;

    paperChartWidth = paperCirclesWidth;
    paperChartHeight = paperCirclesHeight;

    // Create paper Raphael
    var paperCircles = Raphael(document.getElementById("circles"), paperCirclesWidth, paperCirclesHeight);
    var paperChart = Raphael(document.getElementById("linechart"), paperChartWidth, paperChartHeight);

    /***************************
     *        PARTICLES        *
     ***************************/

    var particles = [];

    var Particle = function (data) {
        // Velocity
        this.velX = Math.random() * 4 - 2;
        this.velY = Math.random() * 2 + 0.5;

        // Position
        this.x = paperCirclesWidth / 2;
        this.y = paperCirclesHeight;

        // Random color
        var color = Math.floor(Math.random() * 3 + 1);
        switch(color) {
            case 1: this.color = yellow; break;
            case 2: this.color = blue; break;
            case 3: this.color = green; break;
            default: this.color = yellow;
        }

        if(this.color == blue)
            this.colorName = 'blue'
        else if(this.color == green)
            this.colorName = 'green'
        else
            this.colorName = 'yellow'

        // Length
        this.radius = data.text.length / 3;

        this.move = true;

        this.data = data;
    }

    Particle.prototype = {
        render: function() {
            var text = this.data.text;
            var id = this.data.id;
            var data = this.data;
            var colorName = this.colorName;

            var circle = paperCircles.circle(this.x, this.y, this.radius)
            .attr('fill', this.color)
            .attr('stroke', '#FFF')
            .attr('stroke-width', 2);

            var cx = Math.floor(Math.random() * paperCirclesWidth);
            var cy = 0 - this.radius;
            var speed = Math.floor(Math.random() * 2500 + 3000);
            circle.animate({cx: cx, cy: cy}, speed, 'linear', function() {
                circle.remove();
            });
            circle.toBack();

            circle.hover(function() {
                circle.pause();
                circle.attr('stroke', '#FFF');
                circle.toFront();
            },
            function() {
                circle.animate({cx: cx, cy: cy}, speed, 'linear', function() {
                    circle.remove();
                });
                circle.attr('stroke', '#FFF');
                $.fancybox.close();
            })

            circle.click(function() {
                var user = data.user;
                var template = '<div class="tweet '+colorName+'">';
                    template += '<img src ="'+user.profile_image_url+'" alt="" />';
                    template += '<div class="user">';
                        template += '<span class="name">'+user.name+'</span><br />';
                        template += '<span class="screen-name">@'+user.screen_name+'</span>';
                    template += '</div>';
                    template += '<div class="clear"></div>';
                    template += '<p class="text">'+data.text+'</p>';
                template += '</div>';
                $.fancybox.open({
                    content: template,
                    closeBtn: false,
                    autoSize: false,
                    width: 500,
                    height: 'auto',
                    padding: 0,
                    helpers: {
                        overlay: null
                    }
                });
            });
        },
        update: function() {
            this.x += this.velX;
            this.y -= this.velY;
        }
    }

    /***************************
     *          STATS          *
     ***************************/

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
        data: function(data) {
            this.total = data.total;
            this.mostRetweeted = data.mostRetweeted;
            this.coachs = data.coachs;
        },
        render: function() {
            $('#stats .total .number').html(this.total);
        }

    }

    var stats = new Stats();

    /***************************
     *      SOCKET TWEET       *
     ***************************/

    socket.on('tweet', function (tweet, dataStats) {
        var p = new Particle(tweet);
        //particles.push(p);
        p.render();

        stats.data(dataStats);
        stats.render();
    });


});
