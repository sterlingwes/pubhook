var gulp = require('gulp')
  , glob = require('glob')
  , webpack = require('gulp-webpack')
  , models = require('../models')
  , Promise = require('es6-promise').Promise
  , cwd = process.cwd()
;

module.exports = function() {
  
  return new Promise(function(yes,no) {
    
    models.load(function(err,data,folders) {

      var apps = [];

      if(folders.indexOf('apps')!==-1) {
        apps = glob.sync(cwd + '/apps/*').filter(function(f) {
          return f.split('/').pop()[0] == '_' ? false : true;
        });
      }

      if(!apps.length) return yes(false);

      yes(function() {
        console.log('- bundling apps');
        var wpConfig = require('../webpack-defaults');
        return gulp.src([ cwd + '/apps/**/entry.js', cwd + '!/apps/_*/entry.js' ])
          .pipe(webpack(wpConfig, null/* webpack override */, function(err, stats) {
            if(err) console.log('- webpack err: ' + err);
            else {
              stats = stats.toJson();
              var hash = stats.hash
                , name = stats.modules[0].name.split('/');
              name = name[2];
              models.setVar('app:link:'+name, hash);
              console.log('-- built '+ name || stats.modules[0].name);
            }
          }))
          .pipe(gulp.dest(cwd + '/.build/scripts'));
      });

    });
    
  });
   
};