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
        $window = $(window),
        socket = io.connect();

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

    function trigger(event) {
        var i, args = Array.prototype.slice.call(arguments);
        args.shift();
        if (events[event]) {
            for (i = 0; i < events[event].length; i++) {
                events[event][i].apply({}, args);
            }
        }
    }

    socket.on('req', function (data) {
        trigger('request', data);
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
        trigger('frame', { count: frames, time: (time - startTime) / 1000, delta: delta / 1000 });
        lastFrameTime = time;
        window.requestAnimationFrame(arguments.callee);
    });

    window.Bogey = Bogey;

    $(document).ready(function() {
        canvas = $('canvas').get(0);
        $window.on('resize', function() {
            canvas.height = $window.height();
            canvas.width = $window.width();
        }).triggerHandler('resize');
        trigger('start');
    });
})();
