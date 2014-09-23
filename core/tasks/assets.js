var gulp = require('gulp')
  , changed = require('gulp-changed')
  , models = require('../models')
  , cwd = process.cwd()
;

module.exports = function(cb) {
    
  models.load(function(err,folders) {

    var hasAssets = folders.indexOf('assets')!==-1
      , typeWhitelist = [
          'css','js','png','jpg','jpeg','gif','webapp','txt','ico','html','woff2','woff','ttf','svg','eot','pdf'
        ];

    if(!hasAssets) return cb();

    console.log('- deploying assets');
    gulp.src(cwd + '/assets/**/*.{'+typeWhitelist.join(',')+'}')
      .pipe(changed(cwd + '/public/assets'))
      .pipe(gulp.dest(cwd + '/public/assets'));

    cb();

  });
    
};