var gulp = require('gulp')
  , changed = require('gulp-changed')
  , cwd = process.cwd()
  , rename = require('gulp-rename')
;

module.exports = function(cb) {
  
  console.log('- publishing');
  setTimeout(function() {
    gulp.src(cwd + '/.build/**/*')
      .pipe(changed(cwd + '/public'))
      .pipe(gulp.dest(cwd + '/public'));

    cb();
  }, 1000); // TODO: sort out timing issue, run-sequence overlaps async
};