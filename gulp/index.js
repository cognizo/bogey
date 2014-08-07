var path = require('path');
var glob = require('glob');

// Load other visualizations specified in the config file.
var visualizations = [ 'bogey-pong' ];
var config;

try {
    config = require(path.resolve(__dirname, '../config.json'));
} catch (err) {
    config = [];
}

if (config.visualizations) {
    visualizations = visualizations.concat(config.visualizations);
}

global.visualizations = visualizations;

var files = glob.sync(path.join(__dirname, 'tasks/*.js'));

files.forEach(function (file) {
    require(file);
});
