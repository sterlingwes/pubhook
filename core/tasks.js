var gulp = require('gulp')
  , fs = require('fs')
  , sequence = require('run-sequence')
  , streamdata = require('gulp-data')
  , swig = require('gulp-swig')
  , plumr = require('gulp-plumber')
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
  , stringSrc = require('./tasks-stringSrc')

  , typeWhitelist = [
    'css','js','png','jpg','jpeg','gif','webapp','txt','ico','html','woff2','woff','ttf','svg','eot','pdf'
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

module.exports = function(folders, models, data/* models */, isWatching, hasApps) {
  
  /*
   * Single task definitions
   */
  var runCount = 0
    , hasPages = folders.indexOf('pages')!==-1
    , hasMd = _.filter(data, function(d) {
        // we only want those with specified uri schemes that aren't markdown (done by directory structure) or static models
        return d && d.pubhookType == 'markdown' && (d.items && d.items.length);
      })
    , hasAssets = folders.indexOf('assets')!==-1
    , isRenderable = _.filter(data, function(d) {
        // we only want those with specified uri schemes that aren't markdown (done by directory structure) or static models
        return d && d.renderEachBy && (!d.pubhookType || d.pubhookType != 'markdown') && (d.items && d.items.length);
      })
    ;
  
  if(!isRenderable.length)
    isRenderable = false;
  
  // clean build directory
  gulp.task('clean', function() {
    console.log('- Cleaning up old build files');
    del(paths.build, function() {});
  });
  
  // build any webpack apps
  if(hasApps.length) {
    gulp.task('webpack', function() {
      console.log('- bundling apps');
      var wpConfig = require('./webpack-defaults');
      return gulp.src([ paths.apps + '/**/entry.js', '!'+paths.apps + '/_*/entry.js' ])
        .pipe(plumr({ errorHandler: onError }))
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
        .pipe(gulp.dest(paths.build));
    });
  }
  
  // render from /markdown if it exists
  if(hasMd.length) {
    gulp.task('renderMarkdown', function() {
      console.log('- renderMarkdown');
      return stringSrc(_.flatten(_.pluck(hasMd,'items')))
        .pipe(plumr({ errorHandler: onError }))
        .pipe(streamdata(models.data))
        .pipe(swig())
        .pipe(rename(function(path, file) {
          var base = path.basename.split('~');
          path.basename = base.pop();
          path.dirname = base.join('/');
        }))
        .pipe(gulp.dest(paths.build));
    });
  }
  
  // render any database items
  if(isRenderable) {
    gulp.task('renderRenderable', function() {
      console.log('- renderRenderable');
      return stringSrc(_.flatten(_.pluck(isRenderable,'items')))
        .pipe(plumr({ errorHandler: onError }))
        .pipe(streamdata(models.data))
        .pipe(swig())
        .pipe(rename(function(path, file) {
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
    
    if(hasApps.length) preRender.push('webpack');
    if(hasPages) render.push('renderPages');
    if(hasMd.length) render.push('renderMarkdown');
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