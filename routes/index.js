var _ = require('underscore'),
    fs = require('fs'),
    path = require('path');

exports.index = function(req, res) {
    var visualizationsDir = __dirname + '/../public/visualizations/';
    var json, jsonFile, visualizations = [];
    fs.readdir(visualizationsDir, function(error, dirs) {
        if (!error) {
            _.each(dirs, function(dir) {
                try {
                    jsonFile = visualizationsDir + dir + '/bogey.json';
                    if (fs.existsSync(jsonFile)) {
                        json = JSON.parse(fs.readFileSync(jsonFile));
                        json.url = '/visualizations/' + dir;
                        json.thumbnail = '/visualizations/' + dir + '/' + json.thumbnail;
                        visualizations.push(json);
                    }
                } catch(e) {
                    console.error(e);
                }
            });
            res.render('index.jade', { visualizations: visualizations });
        }
    });
};

var js = [
    '/domready/ready.min.js',
    '/underscore/underscore-min.js'
];

exports.js = function(req, res) {
    var p,
        index = js.indexOf(req.url);
    if (index > -1) {
        p = path.normalize(__dirname + '/../node_modules' + js[index]);
        res.sendfile(p);
    } else {
        res.send(404);
    }
};
