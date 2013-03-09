'use strict';

var fs = require('fs'),
    childProcess = require('child_process'),
    app = require('http').createServer(handler),
    io = require('socket.io').listen(app),
    nconf = require('nconf');

nconf.file({ file: 'config.json' });

nconf.defaults({
    logs: [],
    port: 8008
});

var logs = nconf.get('logs');

if (!logs.length) {
    console.error('Logs is not defined.');
    return;
}

app.listen(nconf.get('port'));

function handler(req, res) {
    var url = req.url === '/' ? '/index.html' : req.url;

    fs.readFile(
        __dirname + '/public' + url,
        function(err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading page');
            }

            res.writeHead(200);
            res.end(data);
        });
}

for (var i in logs) {
    var tail = childProcess.spawn('tail', ['-f', logs[i]]);

    tail.stdout.on('data', function(data) {
        var url = getUrl(data.toString());
        io.sockets.emit('news', url);
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
