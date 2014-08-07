var gulp = require('gulp');

gulp.task('build', [ 'app', 'browserify', 'less', 'visualizations' ]);
