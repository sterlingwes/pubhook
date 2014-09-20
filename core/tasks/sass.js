var gulp = require('gulp')
  , sass = require('gulp-sass')
;

module.exports = function(folders, models) {
  
  return function() {
    console.log('- compiling sass');
    return gulp.src('/assets/**/*.scss')
      .pipe(sass())
      .pipe(gulp.dest('/assets'));
  };
  
};