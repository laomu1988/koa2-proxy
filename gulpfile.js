var jsdoc = require('gulp-jsdoc3');
var gulp = require('gulp');

gulp.task('doc', function (cb) {
    gulp.src(['test.md', './lib/**.js','./lib/*/**.js'], {read: false})
        .pipe(jsdoc(cb));
});