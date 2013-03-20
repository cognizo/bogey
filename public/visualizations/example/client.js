// Example client

Bogey.on('start', function() {
    var canvas = Bogey.canvas;
    var ctx = canvas.getContext('2d');
    var colors = ['Orange', 'AntiqueWhite ', 'Aqua', 'Coral', 'Pink', 'GoldenRod', 'Khaki', 'LightSlateGray', 'MediumSeaGreen', 'Olive'],
        balls = [],
        RADIUS = 10,
        fps = 0;

    function randomColor() {
        return colors[Math.floor(Math.random() * colors.length)];
    }

    function randomIntegerBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function degreesToRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    function vectorAdd(pos, vector) {
        return [pos[0] + vector[0], pos[1] + vector[1]];
    }

    function vectorMultiply(pos, vector) {
        return [pos[0] * vector[0], pos[1] * vector[1]];
    }

    function vectorRotate(vector, degrees) {
        var rads = degreesToRadians(degrees);
        var x = vector[0],
            y = vector[1],
            cs = Math.cos(rads),
            sn = Math.sin(rads);

        return [x * cs - y * sn, x * sn + y * cs];
    }

    function outOfBounds(pos)
    {
        return pos[0] < RADIUS || pos[0] > canvas.width - RADIUS || pos[1] < RADIUS || pos[1] > canvas.height - RADIUS;
    }

    var Ball = function() { this.init.apply(this, arguments); };
    Ball.prototype = {

        pos: [RADIUS, RADIUS],
        vector: [180, 0],
        color: null,

        init: function() {
            this.color = randomColor();
            this.vector = vectorRotate(this.vector, randomIntegerBetween(10, 80));
        },

        update: function(delta) {
            this.pos = vectorAdd(this.pos, vectorMultiply(this.vector, [delta, delta]));

            if (outOfBounds(this.pos))
            {
                this.vector = vectorRotate(this.vector, 70);
                this.pos = vectorAdd(this.pos, vectorMultiply(this.vector, [delta, delta]));
            }

            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.pos[0], this.pos[1], RADIUS, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();
        }
    };

    Bogey.on('request', function(data) {
        balls.push(new Ball());
    });

    Bogey.on('frame', function(event) {
        var i;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (i = 0; i < balls.length; i++) {
            balls[i].update(event.delta);
        }

        if (event.count % 20 === 0) {
            fps = Bogey.fps;
        }

        ctx.font = "12px Arial";
        ctx.fillStyle = 'white';
        ctx.fillText(fps + ' fps', 15, canvas.height - 15);
        ctx.fillText(balls.length + ' balls', 75, canvas.height - 15);
    });
});
