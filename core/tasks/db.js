var gulp = require('gulp')
  , streamdata = require('gulp-data')
  , swig = require('gulp-swig')
  , rename = require('gulp-rename')
  , stringSrc = require('./tasks-stringSrc')
  , _ = require('lodash')
;

module.exports = function(folders, models) {
  
  var isRenderable = _.filter(data, function(d) {
    // we only want those with specified uri schemes that aren't markdown (done by directory structure) or static models
    return d && d.renderEachBy && (!d.pubhookType || d.pubhookType != 'markdown') && (d.items && d.items.length);
  });
  
  if(!isRenderable.length) return false;
  
  return function() {
      console.log('- renderRenderable');
      return stringSrc(_.flatten(_.pluck(isRenderable,'items')))
        .pipe(streamdata(models.data))
        .pipe(swig())
        .pipe(rename(function(path, file) {
          var base = path.basename.split('~');
          path.basename = base.pop();
          path.dirname = base.join('/');
        }))
        .pipe(gulp.dest('/.build'));
    };
  
};