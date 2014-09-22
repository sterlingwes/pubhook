var gulp = require('gulp')
  , streamdata = require('gulp-data')
  , swig = require('gulp-swig')
  , rename = require('gulp-rename')
  , _ = require('lodash')
  , stringSrc = require('../tasks-stringSrc')
  , models = require('../models')
  , Promise = require('es6-promise').Promise
  , cwd = process.cwd()
;

module.exports = function() {
  
  return new Promise(function(yes,no) {
    
    models.load(function(err,data,folders) {
    
      var hasMd = _.filter(data, function(d) {
        // we only want those with specified uri schemes that aren't markdown (done by directory structure) or static models
        return d && d.pubhookType == 'markdown' && (d.items && d.items.length);
      });

      if(!hasMd.length) return yes(false);

      yes(function() {
        console.log('- renderMarkdown');
        return stringSrc(_.flatten(_.pluck(hasMd,'items')))
          .pipe(streamdata(models.data))
          .pipe(swig())
          .pipe(rename(function(path, file) {
            var base = path.basename.split('~');
            path.basename = base.pop();
            path.dirname = base.join('/');
          }))
          .pipe(gulp.dest(cwd + '/.build'));
      });

    });
    
  });
  
};