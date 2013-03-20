'use strict';

var express = require('express'),
    io = require('socket.io'),
    nconf = require('nconf'),
    routes = require('./routes'),
    middleman = require('./lib/middleman'),
    ipsum = require('./lib/ipsum');

nconf.file({ file: 'config.json' });

nconf.defaults({
    logs: [],
    port: 8008,
    ipsum: false
});

var config = nconf.get();

if (!config.logs.length && !confs.ipsum) {
    console.error('Logs is not defined.');
    process.exit();
}

var app = express();
app.get('/', routes.index);
app.use('/canvas/', routes.canvas);
app.use(express.static(__dirname + '/public'));
app.use('/js/', routes.js);

var server = app.listen(nconf.get('port'));

io = io.listen(server, { log: false });

function emit(data) {
    io.sockets.emit('news', data);
}

if (config.ipsum) {
    ipsum.emit(emit);
} else {
    middleman.tail(config.logs, emit);
}
