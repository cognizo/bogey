var fs = require('fs'),
    childProcess = require('child_process'),
    app = require('http').createServer(handler),
    io = require('socket.io').listen(app);

if (!process.env.LOG_FILE) {
    console.error('LOG_FILE is undefined.');
    return;
}

var logFile = process.env.LOG_FILE;

console.log('Tailing ' + logFile);

app.listen(8008);

function handler (req, res) {
    var url = req.url === '/' ? '/index.html' : req.url;

    fs.readFile(__dirname + '/public' + url,
        function (err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading page');
            }

            res.writeHead(200);
            res.end(data);
        });
}

function emit(msg) {
    var clients = io.sockets.clients();

    for (var i in clients)
    {
        clients[i].emit('news', msg);
    }
}

var tail = childProcess.spawn('tail', ['-f', logFile]);

tail.stdout.on('data', function(data) {
    var url = getUrl(data.toString());
    emit(url);
});

function getUrl(line) {
    var pattern = /"(GET|POST) ([^ ]+) /;

    var match = pattern.exec(line);

    if (match && match[2])
    {
        return match[2];
    }

    return null;
}
