var gulp = require('gulp');

gulp.task('app', function () {
    return gulp.src([ 'app/**/*.html' ])
            .pipe(gulp.dest('dist/'));
});
