var sitemap = require('./models-sitemap')
  , Functions = require('./tplfuncs')(sitemap)
  , _ = require('lodash')
  , models = {}
  , folders = {}
  , vars = {}
  , isLoading = false
  , loadingQueue = []
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
   */
  load: function(done) {
    if(folders.length) return done(null,models,folders);
    if(!isLoading) {
      isLoading = true;
      require('./models-loader')(models,folders)(function(err,ms,fs) {
        models = ms;
        folders = fs;
        isLoading = false;
        done(err,ms,fs);
        loadingQueue.forEach(function(qcb) {
          qcb(err,ms,fs);
        });
      });
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