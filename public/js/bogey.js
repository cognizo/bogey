(function() {
    var events = {},
        canvas,
        paused = false,
        fps = 0,
        rpms = 0,
        frames = 0,
        requestsLastTime,
        requestsSinceLastTime = 0,
        startTime,
        lastFrameTime,
        now = function() { return (new Date()).getTime(); },
        close = null,
        keys = {
            space: 32,
            q: 113,
            f: 102,
            r: 114,
            zero: 48,
            plus: 43,
            minus: 95
        },
        $window = $(window),
        socket = io.connect();

    var Bogey = {
        on: function(event, callback) {
            if (!events[event]) {
                events[event] = [];
            }
            events[event].push(callback);
        },
        onClose: function(func) {
            close = func;
        },
        closeSocket: function() {
            socket.disconnect();
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
        if (!paused) {
            trigger('request', data);
        }
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

        if (!paused) {
            frames++;
            fps = Math.round(1000 / (delta ? delta : 1));
            if (frames % 20 === 0) {
                rpms = Math.ceil(requestsSinceLastTime / (time - requestsLastTime) * 1000);
                requestsSinceLastTime = 0;
                requestsLastTime = time;
            }
            trigger('frame', { count: frames, time: (time - startTime) / 1000, delta: delta / 1000 });
        }

        lastFrameTime = time;
        window.requestAnimationFrame(arguments.callee);
    });

    window.Bogey = Bogey;

    function resize() {
        canvas.height = $window.height();
        canvas.width = $window.width();
    }

    var firstResize = true; // Don't fire needless resize event just after load

    $window.on('load', function() {
        canvas = $('canvas').get(0);
        $window.on('resize', function() {
            if (!firstResize) {
                resize();
                trigger('resize');
            }
            firstResize = false;
        });

        setTimeout(function() {
            resize();
            trigger('start');
        }, 0);
    });

    $(window).on('keypress', function(event) {
        switch (event.which) {
            case keys.space:
                trigger(paused ? 'play' : 'pause');
                paused = !paused;
                break;
            case keys.q:
                trigger('close');
                if (close) close();
                break;
            case keys.f:
                trigger('toggleFps');
                break;
            case keys.r:
                trigger('toggleRpms');
                break;
            case keys.zero:
                trigger('defaultSpeed');
                break;
            case keys.minus:
                trigger('slowDown');
                break;
            case keys.plus:
                trigger('speedUp');
                break;
        }
    });
})();
