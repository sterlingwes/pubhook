var gulp = require('gulp')
  , changed = require('gulp-changed')
;

module.exports = function(folders, models) {
  
  return function() {
    return gulp.src('/.build/**/*')
      .pipe(changed('/public'))
      .pipe(gulp.dest('/public'));
  };
  
};