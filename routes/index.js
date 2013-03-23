var _ = require('underscore'),
    fs = require('fs'),
    path = require('path'),
    visualizationsDir = __dirname + '/../public/visualizations/';

function getConfigJson(id) {
    var jsonFile, json;
    try {
        jsonFile = visualizationsDir + id + '/bogey.json';
        if (fs.existsSync(jsonFile)) {
            json = JSON.parse(fs.readFileSync(jsonFile));
            json.id = id;
            json.thumbnail = '/visualizations/' + id + '/' + json.thumbnail;
            return json;
        }
    } catch(e) {
        console.error(e);
    }
    return false;
}

exports.index = function(req, res) {
    var json, visualizations = [];
    fs.readdir(visualizationsDir, function(error, dirs) {
        if (!error) {
            _.each(dirs, function(dir) {
                json = getConfigJson(dir);
                if (json) {
                    visualizations.push(json);
                }
            });
            res.render('index.jade', { visualizations: visualizations });
        }
    });
};

exports.canvas = function(req, res) {
    var id = req.url.substr(1),
        path = '/visualizations/' + id + '/',
        json = getConfigJson(id),
        files = json.js || [];

    _.each(files, function(file, i) {
        files[i] = path + file;
    });

    res.render('canvas.jade', { js: path + 'client.js', files: files });
};

var js = [
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
