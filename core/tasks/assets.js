var gulp = require('gulp')
  , changed = require('gulp-changed')
  , models = require('../models')
  , Promise = require('es6-promise').Promise
  , cwd = process.cwd()
;

module.exports = function() {

  return new Promise(function(yes,no) {
    
    models.load(function(err,data,folders) {
      
      var hasAssets = folders.indexOf('assets')!==-1
        , typeWhitelist = [
            'css','js','png','jpg','jpeg','gif','webapp','txt','ico','html','woff2','woff','ttf','svg','eot','pdf'
          ];

      if(!hasAssets) return yes(false);
      
      yes(function() {
        console.log('- deploying assets');
        return gulp.src(cwd + '/assets/**/*.{'+typeWhitelist.join(',')+'}')
          .pipe(changed(cwd + '/public/assets'))
          .pipe(gulp.dest(cwd + '/public/assets'));
      });

    });
    
  });
  
};