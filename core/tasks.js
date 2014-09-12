var gulp = require('gulp')
  , fs = require('fs')
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
  , sass = require('gulp-sass')
  , _ = require('lodash')
  , del = require('rimraf')
  , sitemap = require('./models-sitemap')

  , cwd = process.cwd()

  , onError = function(err) {
      console.warn(err.stack);
  }
  , swigWrap = function(content) {
      return '{% extends "../templates/partials/base.html" %}'
            +'{% block content %}' + content + '{% endblock %}';
  }
  , stringSrc = function(files) {
      var idx = 0
        , src = stream.Readable({ objectMode: true });
      src._read = function() {
        // files can be an object, where i can be the file name, not an index  TODO: make consistent
        _.each(files, function(f,i) {
          if(!f) return;
          var body = typeof f.body === 'function' ? f.body() : f.body
          
          // add cwd so swigWrap template extends correct base (needs to be two deeper than root)
          // hackish: uses tilde to force only two directories after root, and renames within gulp stream
            , uri = f.__uri && /\.md$/.test(f.__uri)===false ? cwd + '/.dbrender/' + f.__uri.replace(/\//g,'~') : (f.name || 'item-' + i);
          
          // add to our sitemapping
          sitemap.set(f.__uri || uri, {
            name: f.__name,
            id: f._id,
            index: i
          });
          
          this.push(new gutil.File({ cwd:"", base:"", path: uri, contents: new Buffer( swigWrap(body) ) }));
          if(idx==(_.size(files)-1)) {
            this.push(null); // EOF needs to be last
          }
          idx++;
        }.bind(this));
      };
      return src;
  }

  , typeWhitelist = [
    'css','js','png','jpg','jpeg','gif','webapp','txt','ico','html','woff2','woff','ttf','svg','eot'
  ]
  
  , paths = {
    'base':       cwd + '/*/',
    'pages':      cwd + '/pages/**/*.html',
    'assetRoot':  cwd + '/assets',
    'assets':     cwd + '/assets/**/*.{'+typeWhitelist.join(',')+'}',
    'less':       cwd + '/assets/**/*.less',
    'sass':       cwd + '/assets/**/*.scss',
    'apps':       cwd + '/apps',
    'templates':  cwd + '/templates/**/*.html',
    'build':      cwd + '/.build',
    'buildApps':  cwd + '/.build/scripts',
    'dest':       cwd + '/public'
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
        // we only want those with specified uri schemes that aren't markdown (done by directory structure) or static models
        return d && d.renderEachBy && (!d.pubhookType || d.pubhookType != 'markdown') && (d.items && d.items.length);
      })
    ;
  
  if(!isRenderable.length)
    isRenderable = false
  
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
        .pipe(webpack({
          resolve: {
            modulesDirectories: ['node_modules', 'bower_components']
          }
        }, null/* webpack override */, function(err, stats) {
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
  
  // compile any sass files
  gulp.task('sass', function() {
    console.log('- compiling sass');
    return gulp.src(paths.sass)
      .pipe(sass())
      .pipe(gulp.dest(paths.assetRoot));
  });
  
  // render from /pages
  if(hasPages) {
    gulp.task('renderPages', function() {
      // get our sources
      console.log('- renderPages');
      
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
      console.log('- renderMarkdown');
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
    gulp.task('renderRenderable', function() {
      console.log('- renderRenderable');
      var modelData = models.data();
      return stringSrc(_.flatten(_.pluck(isRenderable,'items')))
        .pipe(plumr({ errorHandler: onError }))
        .pipe(streamdata(modelData))
        .pipe(swig())
        .pipe(rename(function(path) {
          var base = path.basename.split('~');
          path.basename = base.pop();
          path.dirname = base.join('/');
        }))
        .pipe(gulp.dest(paths.build));
    });
  }
  
  // pipe through our static assets
  if(hasAssets) {
    gulp.task('copyAssets', function() {
      console.log('- deploying assets');
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
      gulp.watch(paths.templates, ['watch-templates']);
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
      , preRender = ['clean','less','sass']
      , render = []
      , pipe = ['publishDest'];
    
    if(hasApps) preRender.push('webpack');
    if(hasPages) render.push('renderPages');
    if(hasMd) render.push('renderMarkdown');
    if(isRenderable) render.push('renderRenderable');
    
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
  
  /*
   * watch-templates task
   */
  gulp.task('watch-templates', function(cb) {
    sequence(['renderPages', 'renderMarkdown', 'renderRenderable'], 'publishDest', cb);
  });
  
  // in lieu of calling gulp from the command line...
  gulp.start('build', function(err) {
    if(!runCount) {
      console.log('- done tasks', err ? (err.stack || err) : '');
      if(isWatching) console.log('  ... and watching for changes');
      else models.closeDbs();
      var smap = JSON.stringify(sitemap.get(), null, ' ');
      fs.writeFile(cwd + '/sitemapping.json', smap, function(err) {
        if(err) console.warn('! Error writing sitemap: ', err);
      });
    }
    runCount++;
  });
  
};