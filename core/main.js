var models = require('./models')

  , glob = require('glob')
  , gulp = require('gulp')
  , gutil = require('gulp-util')
  , streamdata = require('gulp-data')
  , swig = require('gulp-swig')
  , plumr = require('gulp-plumber')
  , stream = require('stream')
  , rename = require('gulp-rename')
  , webpack = require('gulp-webpack')
  , _ = require('lodash')
  , del = require('rimraf')
  
  , cwd = process.cwd()
  , paths = {
    'base':   cwd + '/*/',
    'pages':  cwd + '/pages/**/*.html',
    'assets': cwd + '/assets/**/*.{css,js,png,jpg,jpeg,gif}',
    'apps':   cwd + '/apps',
    'build':  cwd + '/.build',
    'buildApps': cwd + '/.build/scripts',
    'dest':   cwd + '/public'
  }
  , onError = function(err) {
      console.warn(err.stack);
  }
  , swigWrap = function(content) {
      return '{% extends "../templates/partials/base.html" %}'
            +'{% block content %}' + content + '{% endblock %}';
  }
  , stringSrc = function(files) {
      var src = stream.Readable({ objectMode: true });
      src._read = function() {
        _.each(files, function(f) {
          f = f[0];
          this.push(new gutil.File({ cwd:"", base:"", path: f.name, contents: new Buffer( swigWrap(f.body) ) }));
          this.push(null);
        }.bind(this));
      };
      return src;
  }
;

// determine our directory structure
console.log('- Scanning directory structure...');
glob(paths.base, function(err, files) {
  var folders = files.map(function(f) { return f.split('/').pop(); });
  
  // load our data then run tasks
  console.log('- Loading models...');
  models.load(function(err,data) {
    
    //console.log(JSON.stringify(data,null,' '));
    var asyncTasks = []
      , buildTasks = []
      , preRenderTasks = [];
    
    // clean build directory
    preRenderTasks.push('clean');
    gulp.task('clean', function() {
      console.log('- Cleaning up old build files');
      del(paths.build, function() {});
    });
    
    // build any webpack apps
    if(folders.indexOf('apps')!==-1) {
      preRenderTasks.push('buildWebpack');
      gulp.task('buildWebpack', ['clean'], function() {
        console.log('- buildWebpack apps');
        return gulp.src(paths.apps + '/**/entry.js')
          .pipe(plumr({ errorHandler: onError }))
          .pipe(webpack({}, null/* webpack override */, function(err, stats) {
            if(err) console.log('- webpack err: ' + err);
            else {
              stats = stats.toJson();
              var hash = stats.hash
                , name = stats.modules[0].name.split('/');
              name = name[2];
              models.setVar('app:link:'+name, hash);
              console.log('-- built '+ name);
            }
          }))
          .pipe(gulp.dest(paths.buildApps));
      });
    }
    
    // render from /pages
    if(folders.indexOf('pages')!==-1) {
      buildTasks.push('renderPages');
      gulp.task('renderPages', preRenderTasks, function() {
        // get our sources
        console.log('- renderPages ' + paths.pages + ' to ' + paths.build);
        
        return gulp.src(paths.pages)
          .pipe(plumr({ errorHandler: onError }))
          .pipe(streamdata(models.data()))
          .pipe(swig())
          .pipe(gulp.dest(paths.build));
      });
    }
    
    // render from /markdown if it exists
    if(folders.indexOf('markdown')!==-1) {
      buildTasks.push('renderMarkdown');
      gulp.task('renderMarkdown', preRenderTasks, function() {
        console.log('- renderMarkdown to ' + paths.build);
        var modelData = models.data();
        return stringSrc(data.markdown)
          .pipe(plumr({ errorHandler: onError }))
          .pipe(streamdata(modelData))
          .pipe(swig())
          .pipe(rename(function(path) {
            path.dirname = path.dirname.replace(/markdown\/?/,'');
          }))
          .pipe(gulp.dest(paths.build));
      });
    }
    
    // pipe through our static assets
    if(folders.indexOf('assets')!==-1) {
      asyncTasks.push('copyAssets');
      gulp.task('copyAssets', buildTasks, function() {
        console.log('- deploying assets to '+paths.dest);
        return gulp.src(paths.assets)
          .pipe(plumr({ errorHandler: onError }))
          .pipe(gulp.dest(paths.dest+'/assets'));
      });
    }
    
    // pipe through changed files from our build directory
    gulp.task('publishDest', buildTasks, function() {
      console.log('- deploying src to '+paths.dest);
      return gulp.src(paths.build+'/**/*')
        .pipe(plumr({ errorHandler: onError }))
        .pipe(gulp.dest(paths.dest));
    });
    asyncTasks.push('publishDest');
    
    // in lieu of calling gulp from the command line...
    gulp.start(asyncTasks, function(err) {
      console.log('- done tasks', err ? (err.stack || err) : '');
    });
    
  });
});