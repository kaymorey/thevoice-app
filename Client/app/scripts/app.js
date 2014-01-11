$(function() {

    var socket = io.connect('http://localhost:9001');

    var SCREEN_WIDTH = window.innerWidth,
        SCREEN_HEIGHT = window.innerHeight;

    // Colors
    var yellow = "#fab13b",
    red = "#d10000",
    green = "#70ad88",
    blue = "#4bcddd",
    darkenBlue = "#2c3e50",
    red = "#d10000";

    // Raphael objects
    paperCirclesWidth = SCREEN_WIDTH * 66/100;
    paperCirclesHeight = SCREEN_HEIGHT / 2;

    paperChartWidth = paperCirclesWidth;
    paperChartHeight = paperCirclesHeight;

    // Create paper Raphael
    var paperCircles = Raphael(document.getElementById("circles"), paperCirclesWidth, paperCirclesHeight);
    var paperChart = Raphael(document.getElementById("linechart"), paperChartWidth, paperChartHeight);
    var paperPie = Raphael(document.getElementById("pie"), 200, 200);

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
                var template = tweetTemplate(data, colorName);

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

    tweetTemplate = function(data, elmtClass) {
         var template = '<div class="tweet '+elmtClass+'">';
            template += '<img src ="'+data.user.profile_image_url+'" alt="" />';
            template += '<div class="user">';
                template += '<span class="name">'+data.user.name+'</span><br />';
                template += '<span class="screen-name">@'+data.user.screen_name+'</span>';
            template += '</div>';
            template += '<div class="clear"></div>';
            template += '<p class="text">'+data.text+'</p>';
        template += '</div>';

        return template;
    }

    /***************************
     *        LINECHART        *
     ***************************/

    valuesX = [];
    for(var i = 0; i <= 160; i++) {
        valuesX.push(i);
    }

    var Linechart = function(width, height, intervals, max) {
        this.width = width;
        this.height = height;
        this.valuesX = valuesX;
        this.valuesY = [];
        this.intervals = intervals;
        this.tweetMinutes = 0;
        this.smallInterval = 0;
        this.max = max;
    }

    Linechart.prototype = {
        update: function(tweetMinutes) {
            /*this.smallInterval += 1;
            this.tweetMinutes = tweetMinutes;*/
        },
        data: function(data) {
            this.valuesY = data.valuesY;
        },
        render: function(path) {
            var i = 0;
            var length = this.intervals.length;

            // X Axis
            paperChart.path("M0,"+this.height+"L"+this.width+","+this.height)
                .attr('stroke', red)
                .attr('stroke-width', 3);

            // Intervals
            for(i = 0; i < length; i++) {
                paperChart.path("M"+this.intervals[i]*this.width/this.intervals[length-1]+","+(this.height-10)+"L"+this.intervals[i]*this.width/this.intervals[length-1]+","+this.height)
                .attr('stroke', red)
                .attr('stroke-width', 3);
            }

            // Graph path
            paperChart.linechart(0, 0, this.width, this.height, this.valuesX, this.valuesY, {
                smooth: true, 
                colors: ['#FFF']
            });
        }
    }


    var linechartWidth = 700;
    var linechartHeight = 270;
    var linechartMax = 0;
    var intervals = [0, 40, 70, 100, 130, 160];

    var linechart = new Linechart(linechartWidth, linechartHeight, intervals, linechartMax);
    linechart.render();

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
            // Total tweets
            $('div#stats .total .number').html(this.total);

            // Most retweeted
            var template = tweetTemplate(this.mostRetweeted, 'rt');
            $('div#stats .rt .data').html(template);
            $('div#stats .rt .number').html(this.mostRetweeted.retweet_count);

            var total = this.coachs['total'];
            var florent = this.coachs['florent']['total'] / total * 100;
            var jenifer = this.coachs['jenifer']['total'] / total * 100;
            var mika = this.coachs['mika']['total'] / total * 100;
            var garou = this.coachs['garou']['total'] / total * 100;

            var pie = paperPie.piechart(100, 100, 90, [florent, jenifer, garou, mika], {
                donut : true, 
                donutFill : '#f7f4e3',
                colors: [darkenBlue, yellow, green, blue],
                sort: false
            });

            pie.hover(function() {
                this.sector.stop();
                this.sector.scale(1.1, 1.1, this.cx, this.cy);

                var value = this.sector.value.value;
                value = Math.round(value);
                tooltip = paperPie.text(100, 100, value+'%').attr({'font-size': 35, "fill":'#000'});
            },
            function() {
                this.sector.animate({ transform: 's1 1 ' + this.cx + ' ' + this.cy }, 500, 'bounce');
                tooltip.remove();
            });
        }
    }

    var stats = new Stats();

    /***************************
     *      SOCKET EVENTS      *
     ***************************/

    socket.on('tweet', function (tweet, dataStats) {
        var p = new Particle(tweet);
        //particles.push(p);
        p.render();

        stats.data(dataStats);
        stats.render();
    });

    socket.on('smallInterval', function (dataLinechart) {
        linechart.data(dataLinechart);
        linechart.render();
    });


});
