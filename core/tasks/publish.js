var gulp = require('gulp')
  , changed = require('gulp-changed')
  , cwd = process.cwd()
;

module.exports = function() {
  
  return function() {
    return gulp.src(cwd + '/.build/**/*')
      .pipe(changed(cwd + '/public'))
      .pipe(gulp.dest(cwd + '/public'));
  };
  
};