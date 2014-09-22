var gulp = require('gulp')
  , changed = require('gulp-changed')
  , cwd = process.cwd()
  , rename = require('gulp-rename')
;

module.exports = function(cb) {
  
  console.log('- publishing');
  setTimeout(function() {
    console.log(require('glob').sync(cwd + '/.build/**/*'));
    gulp.src(cwd + '/.build/**/*')
      .pipe(changed(cwd + '/public'))
      .pipe(gulp.dest(cwd + '/public'));

    cb();
  },500); // TODO: sort out timing issue, run-sequence overlaps still
};