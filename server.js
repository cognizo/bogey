'use strict';

var _ = require('underscore'),
    fs = require('fs'),
    childProcess = require('child_process'),
    express = require('express'),
    io = require('socket.io'),
    nconf = require('nconf'),
    dns = require('dns'),
    routes = require('./routes');

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

function getUrl(line) {
    var pattern = /"(GET|POST) ([^ ]+) /;

    var match = pattern.exec(line);

    if (match && match[2]) {
        return match[2];
    }

    return null;
}

function emit(data) {
    io.sockets.emit('news', data);
}

var parseLine = function (line) {
    var words = line.split(' '),
        quotedString = false,
        strings = [];

    _.each(words, function (word) {
        if (word.substring(0, 1) === '"') {
            quotedString = word + ' ';
        } else if (quotedString) {
            if (word.substring(word.length - 1) === '"') {
                quotedString += word;
                strings.push(quotedString);
                quotedString = false;
            } else {
                quotedString += word + ' ';
            }
        } else {
            strings.push(word);
        }
    });

    strings = _.map(strings, function (string) {
        return string.replace(/"/g, '').replace(/\n/g, '');
    });

    return {
        'ipAddress': strings[0],
        'url': getUrl(line),
        'statusCode': strings[6]
    };
};
