var _ = require('underscore');
var Watcher = require('./watcher');

var Bogey = function (io) {
    this.io = io;
};

Bogey.prototype.start = function (logs) {
    var self = this;

    logs.forEach(function (log) {
        var watcher = new Watcher(self.io);
        watcher.watch(log.file, log.regexp);
    });
};

Bogey.prototype.emit = function (data) {
    var parsed = {};

    _.each(data, function (property, key) {
        parsed[key] = [ property.toString() ];
    });

    this.io.sockets.emit('req', {
        line: JSON.stringify(data),
        parsed: parsed
    });
};

module.exports = Bogey;
