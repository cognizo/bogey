var _ = require('underscore'),
    dns = require('dns'),
    childProcess = require('child_process'),
    parseLine = require('./parse').parseLine;

exports.tail = function(config, emit) {
    _.each(config.logs, function(log) {
        var tail = childProcess.spawn('tail', ['-f', log]);

        tail.stdout.on('data', function(data) {
            var parsedData = parseLine(data.toString());

            try {
                dns.reverse(parsedData.ipAddress, function (err, results) {
                    if (!err && results && results[0]) {
                        parsedData.hostname = results[0];
                    }

                    emit(parsedData);
                });
            } catch (err) {
                emit(parsedData);
            }
        });
    });
};
