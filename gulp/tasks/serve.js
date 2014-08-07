var path = require('path');
var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var browserSync = require('browser-sync');
var resolve = require('browser-resolve');
var browserify = require('browserify');
var watchify = require('watchify');
var rebundle = require('./browserify').rebundle;

gulp.task('serve', [ 'app', 'less' ], function (callback) {
    var bundler = watchify(browserify('./app/js/app.js', watchify.args));

    bundler.on('update', function () {
        rebundle(bundler);
    });

    rebundle(bundler)
        .on('end', function () {
            var server = nodemon({
                script: 'server.js',
                ignore: [ 'dist/**/*', 'app/**/*' ] // Let BrowserSync handle watching these.
            });

            browserSync({
                proxy: 'localhost:8008',
                files: [ 'dist/**/*' ],
                ghostMode: false,
                open: false
            });

            callback();
        });

    gulp.watch('app/less/*.less', [ 'less' ]);

    gulp.watch('app/**/*.html', [ 'app' ]);

    // Watch visualizations for changes.
    // TODO: Use watchify here.
    global.visualizations.forEach(function (vis) {
        resolve(vis, {}, function (err, resolved) {
            gulp.watch(resolved, [ 'visualizations' ]);
        });
    });
});
