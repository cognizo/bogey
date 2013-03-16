var _ = require('underscore'),
    fs = require('fs');

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
