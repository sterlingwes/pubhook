var spawn = require('win-spawn')
  , stringSrc = require('./tasks-stringSrc')
  , models = require('./models')
  , swig = require('gulp-swig')
  , rename = require('gulp-rename')
  , gulp = require('gulp')
  , streamdata = require('gulp-data')
  , cwd = process.cwd()
  , slug = require('./model-parse-data')
  , _ = require('lodash')
;

/*
 * tasks-trigger
 * 
 * TODO: should run scoped tasks (limit rendering to affected docs)
 */
module.exports = function(name,recs) {
  
  models.load(function(err,data,folders) {
    
    m = data[name];
    
    recs = recs.map(function(doc) {
      return _.extend({
        __uri:  m && m.renderEachBy ? slug(m.renderEachBy, doc) : slug(doc._id, doc),
        __name: name
      }, doc);
    });
    
    console.log('- renderTriggered for scope', name, recs.length);
    
    // render the affected posts / pages
    stringSrc(recs)
      .pipe(streamdata(models.data))
      .pipe(swig())
      .pipe(rename(function(path, file) {
        var base = path.basename.split('~');
        path.basename = base.pop();
        path.dirname = base.join('/');
      }))
      .pipe(gulp.dest(cwd + '/.build'));
    
    // render pages for good measure
    // TODO: need some way to denote which pages are tied to which db records
    require('./tasks/pages')(function(){
      require('./tasks/publish')(function() {
        console.log('- done, changes published');
      });
    });
  });
  
};