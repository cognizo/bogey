var namedRegexp = require('named-regexp').named;
var Tail = require('./tail');

var Watcher = function (io) {
    this.io = io;
};

Watcher.prototype.watch = function (file, regex) {
    var self = this;
    var tail = new Tail(file);

    tail.on('line', function (line) {
        var parsed = self.parse(line, regex)

        self.io.sockets.emit('req', {
            line: line,
            parsed: parsed
        });
    });
};

Watcher.prototype.parse = function (line, regexp) {
    var named = namedRegexp(regexp);

    var captured = named.exec(line);

    if (captured && captured.captures) {
        return captured.captures;
    }

    return [];
};

module.exports = Watcher;
