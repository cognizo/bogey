var gulp = require('gulp');
var less = require('gulp-less');
var prefix = require('gulp-autoprefixer');
var minify = require('gulp-minify-css');
var rename = require('gulp-rename');
var notify = require('gulp-notify');
var argv = require('yargs').argv;

gulp.task('less', function () {
    var stream = gulp.src('app/less/*.less')
        .pipe(less())
        .pipe(prefix())
        .on('error', notify.onError({
            title: 'Less Error',
            message: '<%= error.message %>',
            emitError: true
        }))
        .on('error', function () {
            this.emit('end');
        });

    if (argv.release) {
        stream = stream.pipe(minify());
    }

    return stream.pipe(gulp.dest('dist/css/'));
});
