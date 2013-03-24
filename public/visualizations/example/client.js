/**
 * This example illustrates the basics of creating a Bogey visualization.
 *
 * We'll be sending balls of random colors across the screen, one for each request in the server log.
 *
 * When creating a visualization, you may find it helpful to enable the server's "ipsum" setting, which
 * generates a stream of random request data.
 */

// Don't do anything until Bogey triggers the start event.
Bogey.on('start', function() {

    // Define some useful variables.
    var colors = ['Orange', 'AntiqueWhite ', 'Aqua', 'Coral', 'Pink', 'GoldenRod', 'Khaki', 'LightSlateGray', 'MediumSeaGreen', 'Olive'],
        balls = [],
        BALL_RADIUS = 3,
        MIN_BALL_SPEED = 300, // Pixels per second. Always base movement on time, rather than frames.
        MAX_BALL_SPEED = 500,
        showFps = true,
        showRpms = true;

    // Generate a random integer in a certain range.
    function randomIntegerBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Get the canvas element from Bogey.
    var canvas = Bogey.canvas;

    // Get the 2d context from the canvas.
    var ctx = canvas.getContext('2d');

    /**
     * The request event is triggered whenever a log line is parsed by the server.
     *
     * The data object has four properties: ipAddress, hostname, url and statusCode
     */
    Bogey.on('request', function(data) {
        // For simplicity, we'll ignore the data object and just assign a random color & starting position to our ball.
        var randomColor = colors[Math.floor(Math.random() * colors.length)],
            randomY     = randomIntegerBetween(BALL_RADIUS * 2, canvas.height - (BALL_RADIUS * 2)),
            speed       = randomIntegerBetween(MIN_BALL_SPEED, MAX_BALL_SPEED);

        // Push this new ball to the array of all balls.
        balls.push({
            color: randomColor,
            speed: speed,
            y: randomY,
            x: 0
        });
    });

    /**
     * The frame event is triggered for each frame (using requestAnimationFrame), which tries for 60fps.
     *
     * The event object contains three properties:
     *      count - the number of frames since the animation began
     *      time - the total number of seconds since the animation began
     *      delta - the number of seconds since the last frame
     */
    Bogey.on('frame', function(event) {
        var i, b, dist, outOfBounds = [];

        // Clear the canvas
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Loop over the array of balls
        for (i = 0; i < balls.length; i++) {
            // Reference to the object
            b = balls[i];

            // Calculate the distance the ball should move this frame. b.speed is the distance the ball should travel
            // per second, and delta is the number of seconds since the last frame.
            dist = b.speed * event.delta;

            // Update the position of the ball
            b.x += dist;

            // Set the ball color
            ctx.fillStyle = b.color;

            // Draw the ball on the canvas
            ctx.beginPath();
            ctx.arc(b.x, b.y, BALL_RADIUS, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();
        }

        // Every 20 frames, check for balls that are out of bounds and remove
        if (event.count % 20 === 0) {
            balls = balls.filter(function(ball) {
                return ball.x < canvas.width + BALL_RADIUS;
            });
        }

        // Display the number of active balls in the lower left corner
        ctx.font = "12px Arial";
        ctx.fillStyle = 'white';
        ctx.fillText(balls.length + ' balls', 15, canvas.height - 15);

        // Also display fps (frames per second) and rpms (requests per minute)
        if (showFps) {
            // Bogey calculates fps for you
            ctx.fillText(Bogey.fps + ' fps', 90, canvas.height - 15);
        }

        if (showRpms) {
            // Bogey calculates rpms for you
            ctx.fillText(Bogey.rpms + ' rpms', 140, canvas.height - 15);
        }
    });

    // Bogey also provides events based on keyboard input. Press f to toggle display of fps.
    Bogey.on('toggleFps', function() {
        showFps = !showFps;
    });

    // Press r to toggle display of rpms.
    Bogey.on('toggleRpms', function() {
        showRpms = !showRpms;
    });

    /** Other events:
     *    - "pause" - the space bar pauses the visualization (Any request events are dropped when the visualization
     *      is paused.)
     *    - "play" - press the space bar when paused
     *    - "speedUp" - press +
     *    - "slowDown" - press -
     *    - "defaultSpeed" - press 0
     *    - "close" - press q, which closes the visualization and returns the user to the visualization menu
     */
});
