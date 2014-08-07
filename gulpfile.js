var gulp = require('gulp');
var less = require('gulp-less');
var minify = require('gulp-minify-css');
var browserSync = require('browser-sync');
var browserify = require('browserify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');
var streamify = require('gulp-streamify');
var uglify = require('gulp-uglify');
var notify = require('gulp-notify');
var argv = require('yargs').argv;

var rebundle = function (bundler) {
    var stream = bundler.bundle()
        .on('error', notify.onError({
            title: 'Browserify Error',
            message: '<%= error.message %>',
            emitError: true
        }))
        .on('error', function () {
            this.emit('end');
        })
        .pipe(source('demo.js'));

    if (argv.release) {
        stream = stream.pipe(streamify(uglify()));
    }

    return stream.pipe(gulp.dest('dist/js/'));
}

gulp.task('less', function () {
    var stream = gulp.src('less/**/*.less')
        .pipe(less());

    if (argv.release) {
        stream = stream.pipe(minify());
    }

    return stream.pipe(gulp.dest('dist/css/'))
        .pipe(browserSync.reload({ stream: true }));
});

gulp.task('browserify', function () {
    return rebundle(browserify('./demo/demo.js'));
});

gulp.task('serve', [ 'less' ], function (callback) {
    gulp.watch('less/*.less', [ 'less' ]);

    var bundler = watchify(browserify('./demo/demo.js', watchify.args));

    bundler.on('update', function () {
        rebundle(bundler);
    });

    rebundle(bundler)
        .on('end', function () {
            browserSync({
                server: {
                    baseDir: './'
                },
                files: [ '**/*.html', 'dist/js/demo.js' ],
                ghostMode: false,
                open: false
            });

            callback();
        });
})

gulp.task('build', [ 'less', 'browserify' ]);

gulp.task('default', [ 'serve' ]);
