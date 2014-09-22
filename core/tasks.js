var models = require('./models')
  , Promise = require('es6-promise').Promise
  , gulp = require('gulp')
  , glob = require('glob')
  , fs = require('fs')
  , sequence = require('run-sequence')
  , livereload = require('gulp-livereload')
  , _ = require('lodash')
  
  , sitemap = require('./models-sitemap')

  , cwd = process.cwd()
;

/*
 * Setup tasks
 */
var tasks = glob.sync(cwd + '/core/tasks/*.js')
  , taskChain = []
  , tasksRegistered = []
  , availableTasks = [];

tasks.forEach(function(tFileName) {
  var tr;
  try {
    tr = require(tFileName);
    taskChain.push(tr);
    var taskName = tFileName.split('/').pop().replace(/\.js$/,'');
    tasksRegistered.push(taskName);
    
  } catch(e) { console.error('! Failed to load '+tFileName, e.stack); }
});

Promise.all(taskChain)
.then(function(tfns) {
  
  tfns.forEach(function(fn,i) {
    if(!fn || typeof fn !== 'function') return;
    //console.log('- setting up ', tasksRegistered[i], ' gulp task');
    gulp.task(tasksRegistered[i], fn);
    availableTasks.push(tasksRegistered[i]);
  });
  
  setup();
  
})
.catch(function(err) {
  console.error(err.stack);
});

/*
 * Single task definitions
 */
var runCount = 0;

function setup() {
 
  // check if we need to watch
  if(GLOBAL.isWatching) {
    gulp.task('watch', function() {
      livereload.listen(35729);
      gulp.watch('/assets/**/*.less', ['watch-less']);
      gulp.watch('/templates/**/*.html', ['watch-templates']);
      gulp.watch('/public/**/*').on('change', livereload.changed);
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
      , pipe = ['publish'];

    if(_.contains(availableTasks,'webpack'))   preRender.push('webpack');
    if(_.contains(availableTasks,'pages'))     render.push('pages');
    if(_.contains(availableTasks,'markdown'))  render.push('markdown');
    if(_.contains(availableTasks,'db'))        render.push('db');

    order.push(preRender);
    if(render.length) order.push(render);
    pipe.push('assets');
    order.push(pipe);
    if(GLOBAL.isWatching) order.push('watch');

    order.push(cb);

    sequence.apply(sequence, order);
  });
  
  /*
   * watch-less task
   */
  gulp.task('watch-less', function(cb) {
    sequence('less', 'assets', cb);
  });

  /*
   * watch-templates task
   */
  gulp.task('watch-templates', function(cb) {
    sequence(['pages', 'markdown', 'db'], 'publish', cb);
  });

  // in lieu of calling gulp from the command line...
  gulp.start('build', function(err) {
    if(!runCount) {
      console.log('- done tasks', err ? (err.stack || err) : '');
      if(err && err.err) console.log(err.err.stack);
      if(GLOBAL.isWatching) console.log('  ... and watching for changes');
      else models.closeDbs();
      var smap = JSON.stringify(sitemap.get(), null, ' ');
      fs.writeFile(cwd + '/sitemapping.json', smap, function(err) {
        if(err) console.warn('! Error writing sitemap: ', err);
      });
    }
    runCount++;
  });
  
}