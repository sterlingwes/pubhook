var gulp = require('gulp')
  , sequence = require('run-sequence')
  , gutil = require('gulp-util')
  , streamdata = require('gulp-data')
  , swig = require('gulp-swig')
  , plumr = require('gulp-plumber')
  , stream = require('stream')
  , rename = require('gulp-rename')
  , webpack = require('gulp-webpack')
  , changed = require('gulp-changed')
  , livereload = require('gulp-livereload')
  , less = require('gulp-less')
  , _ = require('lodash')
  , del = require('rimraf')

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
  , cwd = process.cwd()
  , paths = {
    'base':   cwd + '/*/',
    'pages':  cwd + '/pages/**/*.html',
    'assetRoot': cwd + '/assets',
    'assets': cwd + '/assets/**/*.{css,js,png,jpg,jpeg,gif}',
    'less':   cwd + '/assets/**/*.less',
    'apps':   cwd + '/apps',
    'build':  cwd + '/.build',
    'buildApps': cwd + '/.build/scripts',
    'dest':   cwd + '/public'
  }
;

module.exports = function(folders, models, data/* models */, isWatching) {
  
  /*
   * Single task definitions
   */
  var runCount = 0
    , hasApps = folders.indexOf('apps')!==-1
    , hasPages = folders.indexOf('pages')!==-1
    , hasMd = folders.indexOf('markdown')!==-1
    , hasAssets = folders.indexOf('assets')!==-1
    , isRenderable = _.filter(data, function(d) {
        return d && d.renderEachBy;
      })
    ;
  
  // clean build directory
  gulp.task('clean', function() {
    console.log('- Cleaning up old build files');
    del(paths.build, function() {});
  });
  
  // build any webpack apps
  if(hasApps) {
    gulp.task('webpack', function() {
      console.log('- bundling apps');
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
  
  // compile any less files
  gulp.task('less', function() {
    console.log('- compiling less');
    return gulp.src(paths.less)
      .pipe(less())
      .pipe(gulp.dest(paths.assetRoot));
  });
  
  // render from /pages
  if(hasPages) {
    gulp.task('renderPages', function() {
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
  if(hasMd) {
    gulp.task('renderMarkdown', function() {
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
  
  // render any database items
  if(isRenderable) {
    // TODO: handle rendering db items here using title & body which can also be transform functions from model schema
  }
  
  // pipe through our static assets
  if(hasAssets) {
    gulp.task('copyAssets', function() {
      console.log('- deploying assets to '+paths.dest);
      return gulp.src(paths.assets)
        .pipe(plumr({ errorHandler: onError }))
        .pipe(changed(paths.dest+'/assets'))
        .pipe(gulp.dest(paths.dest+'/assets'));
    });
  }
  
  // pipe through changed files from our build directory
  gulp.task('publishDest', function() {
    return gulp.src(paths.build+'/**/*')
      .pipe(plumr({ errorHandler: onError }))
      .pipe(changed(paths.dest))
      .pipe(gulp.dest(paths.dest));
  });
  
  // check if we need to watch
  if(isWatching) {
    gulp.task('watch', function() {
      livereload.listen(35729);
      gulp.watch(paths.less, ['watch-less']);
      gulp.watch(paths.dest + '/**/*').on('change', livereload.changed);
    });
  }
  
  /*
   * Task sequencing / grouping definition
   *
   * build task
   *
   * 1) preRender stage in parallel
   * 2) render stage in parallel (if anything to render)
   * 3) pipe stage in parallel
   * 4) watch (if watching)
   */
  gulp.task('build', function(cb) {
    var order = []
      , preRender = ['clean','less']
      , render = []
      , pipe = ['publishDest'];
    
    if(hasApps) preRender.push('webpack');
    if(hasPages) render.push('renderPages');
    if(hasMd) render.push('renderMarkdown');
    
    order.push(preRender);
    if(render.length) order.push(render);
    if(hasAssets) pipe.push('copyAssets');
    order.push(pipe);
    if(isWatching) order.push('watch');
    
    order.push(cb);
    
    sequence.apply(sequence, order);
  });
  
  /*
   * watch-less task
   */
  gulp.task('watch-less', function(cb) {
    sequence('less', 'copyAssets', cb);
  });
  
  // in lieu of calling gulp from the command line...
  gulp.start('build', function(err) {
    if(!runCount) {
      console.log('- done tasks', err ? (err.stack || err) : '');
      if(isWatching) console.log('  ... and watching for changes');
      else models.closeDbs();
    }
    runCount++;
  });
  
};