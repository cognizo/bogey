var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var async = require('async');
var resolve = require('browser-resolve');
var notify = require('gulp-notify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var streamify = require('gulp-streamify');
var uglify = require('gulp-uglify');
var argv = require('yargs').argv;

gulp.task('visualizations', function (callback) {
    var config = {
        visualizations: []
    };

    async.each(visualizations, function (vis, callback) {
        var dest = path.join('dist/visualizations', vis);

        resolve(vis, {}, function (err, resolved) {
            if (err) {
                return callback(err);
            }

            var stream = browserify(resolved)
                .require(resolved, { expose: vis })
                .bundle()
                .on('error', notify.onError({
                    title: 'Browserify Error',
                    message: '<%= error.message %>',
                    emitError: true
                }))
                .on('error', function () {
                    this.emit('end')
                })
                .pipe(source('index.js'));

            if (argv.release) {
                stream = stream.pipe(streamify(uglify()));
            }

            stream.pipe(gulp.dest(dest))
                .on('end', function () {
                    config.visualizations.push({
                        src: path.join('/visualizations', vis, 'index.js'),
                        module: vis
                    });

                    callback();
                });
        });
    }, function () {
        fs.writeFileSync('dist/config.json', JSON.stringify(config, null, 2));

        callback();
    });
});
