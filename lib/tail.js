var util = require('util');
var EventEmitter = require('events').EventEmitter;
var childProcess = require('child_process');

var Tail = function (file) {
    var self = this;
    var tail = childProcess.spawn('tail', [ '-f', file ]);

    tail.stdout.on('data', function (data) {
        self.emit('line', data.toString('utf8'));
    });
};
util.inherits(Tail, EventEmitter);

module.exports = Tail;
