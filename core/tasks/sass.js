var gulp = require('gulp')
  , sass = require('gulp-sass')
  , cwd = process.cwd()
;

module.exports = function() {
  
  console.log('- compiling sass');
  return gulp.src(cwd + '/assets/**/*.scss')
    .pipe(sass())
    .pipe(gulp.dest(cwd + '/assets'));
  
};