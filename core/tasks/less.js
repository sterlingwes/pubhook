var gulp = require('gulp')
  , less = require('gulp-less')
 ;

module.exports = function(folders, models) {
  
  return function() {
    console.log('- compiling less');
    return gulp.src('/assets/**/*.less')
      .pipe(less())
      .pipe(gulp.dest('/assets'));
  };
  
};