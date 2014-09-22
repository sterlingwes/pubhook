var gulp = require('gulp')
  , less = require('gulp-less')
  , cwd = process.cwd()
 ;

module.exports = function() {
  
  console.log('- compiling less');
  return gulp.src(cwd + '/assets/**/*.less')
    .pipe(less())
    .pipe(gulp.dest(cwd + '/assets'));
  
};