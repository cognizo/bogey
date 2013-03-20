(function() {
    var events = {},
        canvas,
        fps = 0,
        rpms = 0,
        frames = 0,
        requestsLastTime,
        requestsSinceLastTime = 0,
        startTime,
        lastFrameTime,
        now = function() { return (new Date()).getTime(); },
        socket = io.connect();

    domready(function() {
        canvas = document.getElementById('visualize');
        canvas.height = window.innerHeight;
        canvas.width = window.innerWidth;
    });

    var Bogey = {
        on: function(event, callback) {
            if (!events[event]) {
                events[event] = [];
            }
            events[event].push(callback);
        }
    };

    Bogey.__defineGetter__('fps', function() {
        return fps;
    });

    Bogey.__defineGetter__('rpms', function() {
        return rpms;
    });

    Bogey.__defineGetter__('canvas', function() {
        return canvas;
    });

    function fire(event) {
        var i, args = Array.prototype.slice.call(arguments);
        args.shift();
        if (events[event]) {
            for (i = 0; i < events[event].length; i++) {
                events[event][i].apply({}, args);
            }
        }
    }

    socket.on('news', function (data) {
        fire('request', data);
        requestsSinceLastTime++;
    });

    window.requestAnimationFrame(function() {
        if (!startTime) {
            startTime = now();
            lastFrameTime = startTime;
            requestsLastTime = startTime;
        }
        var time = now(),
            delta = time - lastFrameTime;
        frames++;
        fps = Math.round(1000 / (delta ? delta : 1));
        if (frames % 20 === 0) {
            rpms = Math.ceil(requestsSinceLastTime / (time - requestsLastTime) * 1000);
            requestsSinceLastTime = 0;
            requestsLastTime = time;
        }
        fire('frame', { count: frames, time: (time - startTime) / 1000, delta: delta / 1000 });
        lastFrameTime = time;
        window.requestAnimationFrame(arguments.callee);
    });

    window.Bogey = Bogey;
})();
