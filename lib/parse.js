var _ = require('underscore');

function getUrl(line) {
    var pattern = /"(GET|POST) ([^ ]+) /;

    var match = pattern.exec(line);

    if (match && match[2]) {
        return match[2];
    }

    return null;
}

exports.parseLine = function(line) {
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
