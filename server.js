#!/usr/bin/env node

var util = require('util');
var express = require('express');
var io = require('socket.io');
var Bogey = require('./lib/bogey');

var argv = require('yargs')
    .usage('Usage: $0 [options]')
    .describe({
        c: 'Config file',
        p: 'Port',
        f: 'File(s) to tail'
    })
    .alias({
        c: 'config',
        p: 'port',
        f: 'file',
        h: 'help'
    })
    .help('h')
    .argv;

var config = {};

if (argv.config) {
    try {
        config = require(argv.config);
    } catch (err) {
        console.error('Error loading config file: ', err.message);
        process.exit(1);
    }
}

var port = argv.port || config.port || 8008;

var visualizations = argv.visualization || config.visualizations || [ '/var/www/bogey-pong' ];

// Set up regular expressions.
var regexps = {
    "apache-combined": "/(:<ip>.*) - - \\[(:<timestamp>.*)\\] \"(:<method>.*) (:<uri>.*) (:<protocol>.*)\"" +
        " (:<statusCode>[0-9]*) (:<responseSize>[0-9]*|-) \"(:<referrer>.*)\" \"(:<userAgent>.*)\"/"
};

if (config.regexp) {
    for (var name in config.regexp) {
        (config.regexp[name]) && (regexps[name] = config.regexp[name]);
    }
}

// Check log files passed in with -f or --file.
var logs = [];

var files = argv.file;

if (files) {
    if (!util.isArray(files)) {
        files = [ files ];
    };

    files.forEach(function (file) {
        var filename = file.split(':')[0];
        var regexpName = file.split(':')[1];

        if (!regexps[regexpName]) {
            console.log('Regular expression ' + regexpName + ' not found.');
            process.exit(1);
        }

        logs.push({
            file: filename,
            regexp: regexps[regexpName]
        });
    });
}

if (!logs || !logs.length) {
    logs = config.logs;
}

if (!logs || !logs.length) {
    logs = [];
}

// Check log files specified in the config file.
logs.forEach(function (log) {
    var regexp;

    if (regexps[log.regexp]) {
        regexp = regexps[log.regexp];
    } else {
        regexp = log.regexp;
    }

    log.regexp = eval(regexp);
});

var io;
var bogey;

var app = express();
app.use(express.static(__dirname + '/dist'));

app.use(express.bodyParser());
app.post('/log', function (req, res) {
    bogey.emit(req.body);

    res.send(200);
});

var server = app.listen(port);

io = io(server);

bogey = new Bogey(io);

bogey.start(logs);
