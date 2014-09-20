var gulp = require('gulp')
  , streamdata = require('gulp-data')
  , swig = require('gulp-swig')
;

module.exports = function(folders, models) {
  
  var hasPages = folders.indexOf('pages')!==-1;
  
  if(!hasPages) return false;
  
  return function() {
      // get our sources
      console.log('- renderPages');
      
      return gulp.src('/pages/**/*.html')
        .pipe(streamdata(function(file) {
          var uri = file.path.replace(cwd,'').replace(/\\/g,'/').replace('/pages/','').replace(/\.html$/,'');
          file.data = file.data || {};
          if(uri=='index')
            uri = '';
        
          // TODO: need to handle accounting for _children and _parent here as per markdown!
        
          _.extend(file.data, { ctx: { __uri: uri }});
          return models.data(file);
        }))
        .pipe(swig())
        .pipe(gulp.dest('/.build'));
    };
  
};