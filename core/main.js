var models = require('./models')

  , gulp = require('gulp')
  , gutil = require('gulp-util')
  , streamdata = require('gulp-data')
  , swig = require('gulp-swig')
  , plumr = require('gulp-plumber')
  , stream = require('stream')
  , rename = require('gulp-rename')
  , _ = require('lodash')
  , del = require('rimraf')
  
  , cwd = process.cwd()
  , paths = {
    'pages':  cwd + '/pages/**/*.html',
    'build':  cwd + '/.build',
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

// load our data then run tasks
models.load(function(err,data) {
  
  //console.log(JSON.stringify(data,null,' '));
  var tasks = [];
  
  // render from /pages
  gulp.task('renderPages', function() {
    // get our sources
    console.log('- renderPages ' + paths.pages + ' to ' + paths.build);
    
    return gulp.src(paths.pages)
      .pipe(plumr({ errorHandler: onError }))
      .pipe(streamdata(models.data()))
      .pipe(swig())
      .pipe(gulp.dest(paths.build));
  });
  tasks.push('renderPages');
  
  if(data.markdown) {
    tasks.push('renderMarkdown');
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
  
  // pipe through changed files from our build directory
  gulp.task('copy', function() {
    console.log('- deploying changed src to '+paths.dest);
    return gulp.src(paths.build+'/*')
      .pipe(plumr({ errorHandler: onError }))
      .pipe(gulp.dest(paths.dest));
  });
  tasks.push('copy');
  
  // in lieu of calling gulp from the command line...
  gulp.start(tasks, function(err) {
    console.log('- done tasks', err ? (err.stack || err) : '');
    console.log('- cleaning up');
    del(paths.build, function() {});
  });
  
});