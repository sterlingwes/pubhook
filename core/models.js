var glob = require('glob')
  , Functions = require('./tplfuncs')
  , _ = require('lodash')
  , models = {}
  , cwd = process.cwd()
  , modelPath = './models'
  , Promise = require('es6-promise').Promise
  , fs = require('fs')
  , mdyaml = require('front-matter')
  , marked = require('marked')
;

var fetchModel = function(name,m,done) {
  if(!m || typeof m !== 'object') {
    console.warn('! Warning - no valid export found for model "' + name + '"');
    return false;
  }
  
  switch(m.pubhookType) {
    case "markdown":
      var source = './' + (m.source ? m.source.replace(/^[\/\.]+/,'') : 'markdown');
      glob(source + '/*.md', function(err,files) {
        readMdFiles(files.map(function(f) { return f.replace(/^\.+/,cwd); }), function(err,res) {
          done(err, _.groupBy(res,'name'));
        });
      });
      break;
    default:
      done(null, m);
  }
};

// TODO: abstract this so other file formats can be handled
var readMdFiles = function(files, done) {
  var promises = files.map(function(f) {
    return new Promise(function(res,rej) {
      fs.readFile(f, 'utf8', function(err,data) {
        if(err) rej(err);
        else {
          var json = mdyaml(data);
          json.name = f;
          json.body = marked( json.body );
          res( json );
        }
      });
    });
  });
  
  Promise.all(promises)
    .then(function(res) { done(null, res); })
    .catch(function(err) { done(err); });
};

var loader = function(done) {
  if(!done || typeof done !== 'function') done = function() {};
  if(Object.keys(models).length) return done(null,models);
  
  var promises = [];
  
  glob(modelPath + '/*.js', function(err,files) {
    if(files) {
      files.forEach(function(f) {
        var modelName = f.replace(modelPath+'/','').replace(/\.js/,'')
          , promise = new Promise(function(res,rej) {
            
            try {
              fetchModel(modelName, require(f.replace(/^\.+/, cwd)), function(err,m) {
                if(m)   models[modelName] = m;
                res(models[modelName]);
              });
              
            } catch(e) {
              console.warn('! Err Loading Model "'+modelName+'" ');
              console.log(e.stack);
              rej(e);
            }
            
          })
        ;
        
        promises.push(promise);
      });
      
      Promise.all(promises).then(function() {
        var mods = Object.keys(models);
        console.log('- '+ mods.length+' models loaded: '+mods.join(', '));
        done(null,models);
        
      }).catch(function(err) {
        console.warn('! Error loading models');
        console.log(err);
      });
    }
  });
};

var getter = function(modelName) {
  if(!modelName) return models;
  return models[modelName];
};

var prepData = function() {
  var fns = new Functions(models);
  return _.extend({}, fns);
};

module.exports = {
  
  load: loader,
  
  get:  getter,
  
  data: prepData
  
};