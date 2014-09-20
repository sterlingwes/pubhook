var gulp = require('gulp')
  , glob = require('glob')
  , fs = require('fs')
  , sequence = require('run-sequence')
  , livereload = require('gulp-livereload')
  , _ = require('lodash')
  
  , sitemap = require('./models-sitemap')

  , cwd = process.cwd()
;

module.exports = function(folders, models, isWatching) {
  
  /*
   * Setup tasks
   */
  var tasks = glob.sync(cwd + '/tasks/*.js')
    , tasksRegistered = [];
  
  tasks.forEach(function(t) {
    var tr;
    try {
      t = require(t);
    } catch(e) { console.error('! Failed to load '+t, e.stack); }
    if(t) tasksRegistered.push(t.replace(cwd+'/','').replace(/\.js$/,''));
  });
  
  /*
   * Single task definitions
   */
  var runCount = 0;
  
  // check if we need to watch
  if(isWatching) {
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
    
    if(_.contains(tasksRegistered,'webpack'))   preRender.push('webpack');
    if(_.contains(tasksRegistered,'pages'))     render.push('renderPages');
    if(_.contains(tasksRegistered,'markdown'))  render.push('renderMarkdown');
    if(_.contains(tasksRegistered,'db'))        render.push('renderRenderable');
    
    order.push(preRender);
    if(render.length) order.push(render);
    pipe.push('assets');
    order.push(pipe);
    if(isWatching) order.push('watch');
    
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