var sitemap = require('./models-sitemap')
  , Functions = require('./tplfuncs')(sitemap)
  , _ = require('lodash')
  , models = {}
  , vars = {}
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

var prepData = function() {
  var fns = new Functions(models, vars);
  return _.extend({}, fns);
};

var closeDbs = function() {
  if(vars.mongo)  require('./db-mongo')().then(function(conn) { conn.close(); });
};

module.exports = {
  
  /*
   * loader - handles making any database connections and fetching data
   */
  load: require('./models-loader')(models),
  
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