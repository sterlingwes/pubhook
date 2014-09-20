var gulp = require('gulp')
  , changed = require('gulp-changed')
;

module.exports = function(folders, models) {
  
  var hasAssets = folders.indexOf('assets')!==-1
    , typeWhitelist = [
        'css','js','png','jpg','jpeg','gif','webapp','txt','ico','html','woff2','woff','ttf','svg','eot','pdf'
      ];
  
  if(!hasAssets) return false;
  
  return function() {
    console.log('- deploying assets');
    return gulp.src('/assets/**/*.{'+typeWhitelist.join(',')+'}')
      .pipe(changed('/public/assets'))
      .pipe(gulp.dest('/public/assets'));
  };
  
};