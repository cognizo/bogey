'use strict';

var _ = require('underscore'),
    fs = require('fs'),
    childProcess = require('child_process'),
    express = require('express'),
    io = require('socket.io'),
    nconf = require('nconf'),
    dns = require('dns'),
    routes = require('./routes'),
    parseLine = require('./lib/parse').parseLine;

nconf.file({ file: 'config.json' });

nconf.defaults({
    logs: [],
    port: 8008
});

var logs = nconf.get('logs');

if (!logs.length) {
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

for (var i in logs) {
    var tail = childProcess.spawn('tail', ['-f', logs[i]]);

    tail.stdout.on('data', function(data) {
        var parsedData = parseLine(data.toString());

        try {
            dns.reverse(parsedData.ipAddress, function (err, results) {
                if (!err && results && results[0]) {
                    parsedData.ipAddress = results[0];
                }

                emit(parsedData);
            });
        } catch (err) {
            emit(parsedData);
        }
    });
}

function emit(data) {
    io.sockets.emit('news', data);
}
