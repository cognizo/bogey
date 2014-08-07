var gulp = require('gulp');
var browserify = require('browserify');
var notify = require('gulp-notify');
var source = require('vinyl-source-stream');
var streamify = require('gulp-streamify');
var uglify = require('gulp-uglify');
var argv = require('yargs').argv;

var rebundle = function (bundler) {
    return bundler.bundle()
        .on('error', notify.onError({
            title: 'Browserify Error',
            message: '<%= error.message %>',
            emitError: true
        }))
        .on('error', function () {
            this.emit('end');
        })
        .pipe(source('app.js'))
        .pipe(gulp.dest('dist/js/'));
};

module.exports.rebundle = rebundle;

gulp.task('browserify', function () {
    return rebundle(browserify('./app/js/app.js'));
});

gulp.task('browserify', function () {
    var stream = browserify('./app/js/app.js')
        .bundle()
        .on('error', notify.onError({
            title: 'Browserify Error',
            message: '<%= error.message %>',
            emitError: true
        }))
        .on('error', function () {
            this.emit('end');
        })
        .pipe(source('app.js'));

    if (argv.release) {
        stream = stream.pipe(streamify(uglify()));
    }

    return stream.pipe(gulp.dest('dist/js/'));
});
