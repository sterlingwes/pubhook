var Promise = require('es6-promise').Promise
  , _ = require('lodash')
  , glob = require('glob')
  , cwd = process.cwd()
;

/*
 * RouteHelper
 * 
 * simplification of the pattern used by ExpressJs.Router
 * 
 * @param {String} apiName
 */
var RouteHelper = function(apiName) {
  this.apiName = apiName;
  this.routes = {};
};

['get','post','head','post','put','delete'].forEach(function(method) {
  RouteHelper.prototype[method] = function(resource, handlerFn) {
    if(!resource || !handlerFn || typeof resource !== 'string' || typeof handlerFn !== 'function')
      return console.warn('! Invalid signature for api RouteHelper.'+method+'(resource, handlerFn) method call');
    
    if(resource[0]!=='/') resource = '/' + resource;
    
    var ep = this.routes[resource] = this.routes[resource] || {};
    ep[method] = {
      // TODO: should parse the resource for /:params like express, or allow regex
      // TODO: should allow for middleware chaining akin to express.. ie: app.get route middleware middleware etc..
      handler: handlerFn
    };
    
  };
});

/*
 * getDeps
 * 
 * get function variable names    not currently used
 * 
 * @param {Function} func
 * @return {Array} of strings
 */
var getDeps = function(func) {
  if(typeof func !== 'function')	return [];
    var fnStr = func.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg, '');
    var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(/([^\s,]+)/g);
    if(result === null)
        result = [];

    return _.map(result, function(dep) { return dep.toLowerCase(); });
};

/*
 * getApis
 * 
 * builds a hash of resources > methods > definitions (by depth)
 * 
 * @return {Object} promise resolving to api spec
 */
var getApis = function() {
  
  var apisDefined = glob.sync(cwd + '/apis/*.js')
    , promises = []
  ;

  apisDefined.forEach(function(api) {
    
    promises.push(new Promise(function(yes) {
      var exp;
      try {
        exp = require(api);

        var cleanName = api.split('/').pop();
        cleanName = cleanName.slice(0,cleanName.length-3);

        if(typeof exp === 'function') {
          var helper = new RouteHelper(cleanName);
          if(exp.length>1)
            exp(helper, function() { yes([cleanName, helper.routes]) });
          else {
            exp(helper);
            yes([cleanName,helper.routes]);
          }
        }

      } catch(e) { console.warn('! Could not setup api: '+ cleanName, e.stack); }
    }));
  });
  
  return Promise.all(promises).then(function(routes) {
    // organize: apiName > resource > method > handler
    var eps = {};
    routes.forEach(function(pair) {
      // pair is first apiName, then 'routes' from RouteHelper
      eps[pair[0]] = pair[1];
    });
    return eps;
  });
};

module.exports = {
  
  get: getApis,
  
  RouterHelper: RouteHelper
  
};