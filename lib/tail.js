var util = require('util');
var EventEmitter = require('events').EventEmitter;
var childProcess = require('child_process');

var Tail = function (file) {
    var self = this;
    var tail = childProcess.spawn('tail', [ '-f', file ]);

    tail.stdout.on('data', function (data) {
        data.toString('utf8').split('\n').forEach(function (line) {
            if (line.trim().length > 0) {
                self.emit('line', line);
            }
        });
    });
};
util.inherits(Tail, EventEmitter);

module.exports = Tail;
