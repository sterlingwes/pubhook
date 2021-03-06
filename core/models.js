var sitemap = require('./models-sitemap')
  , Functions = require('./tplfuncs')(sitemap)
  , _ = require('lodash')
  , models = {}
  , folderStructure = {}
  , vars = {}
  , isLoading = false
  , loadingQueue = []
  , getDeps = require('./tools/func-deps')
;

var getter = function(modelName) {
  if(!modelName) return models;
  return models[modelName];
};

var getVar = function(key) {
  return vars[key];
};

var setVar = function(key,val) {
  vars[key] = val;
  return true;
};

/*
 * prepData
 * 
 * called as model.data from tasks.js
 * which itself is primarily used by gulp-data to augment file.data in the stream
 * 
 * @param {Object} file, vinyl direct from gulp stream via gulp-data
 * @return {Object} augmented data
 */
var prepData = function(file) {
  var fns = new Functions(models, vars)
    , fileData = file && file.data ? file.data : {};
  
  _.each(fns, function(fn,key) {
    if(typeof fn === 'function') {
      fns[key] = fn.bind(fileData.ctx || {});
    }
  });
  
  return _.extend(fileData, fns);
};

var closeDbs = function() {
  if(vars.mongo)  require('./db-mongo').adapter().then(function(conn) { conn.close(); });
};

module.exports = {
  
  /*
   * loader - handles making any database connections and fetching data
   * 
   * @param {Function} done callback passed from task file, signature and var naming matters
   */
  load: function(done) {
    var cbDeps = getDeps(done);
    if(folderStructure.length && Object.keys(models).length) {
      // TODO: these checks seem pretty duplicative compared to models-loader logic, consolidate
      if(cbDeps.length==3)
        return done(null,models,folderStructure);
      else return done(null,folderStructure);
    }
    
    if(!isLoading) {
      isLoading = true;
      cbDeps.push(function() {
        var args = [].slice.call(arguments,0)
          , hasModels = args.length == 3
          , err = args[0];
        
        isLoading = false;
        if(hasModels) {
          models = args[1];
          folderStructure = args[2]
          done(err, models, folderStructure);
        }
        else {
          folderStructure = args[1];
          done(err, folderStructure);
        }
        
        loadingQueue.forEach(function(qcb) {
          if(hasModels)
            qcb(err,models,folders);
          else
            qcb(err,folders);
        });
      });
      require('./models-loader')(models,folderStructure)(cbDeps);
    }
    else loadingQueue.push(done);
  },
  
  /*
   * get - provides for retrieval of a model
   * 
   * @param {String} modelName
   */
  get:  getter,
  
  /*
   * getVar - get stored value
   * 
   * @param {String} key
   */
  getVar: getVar,
  
  /*
   * setVar - set stored value
   * 
   * @param {String} key
   * @param {Mixed} val
   */
  setVar: setVar,
  
  /*
   * data - wraps template data with helper functions and variables
   * exposing functions to the data without polluting the scope
   */
  data: prepData,
  
  /*
   * closeDbs - closes all open database connections
   */
  closeDbs: closeDbs,
  
  /*
   * sitemap - shared reference
   */
  sitemap: sitemap
};