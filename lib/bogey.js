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

module.exports = Bogey;
