var Promise = require('es6-promise').Promise
  , _ = require('lodash')
  , glob = require('glob')
  , cwd = process.cwd()
  , pseudoPromiseChain = require('./tools/pseudo-promise')

  , HTTPmethods = ['get','post','head','post','put','delete','all']
  , fetchedEndpoints
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
  this.middleware = [];
};

HTTPmethods.forEach(function(method) {
  RouteHelper.prototype[method] = function(resource) {
    
    var handlers = [].slice.call(arguments,1);
    
    if(!resource || !handlers.length || typeof resource !== 'string')
      return console.warn('! Invalid signature for api RouteHelper.'+method+'(resource, handlerFn, ...) method call');
    
    if(resource[0]!=='/') resource = '/' + resource;
    
    var ep = this.routes[resource] = this.routes[resource] || {};
    if(method=='all') {
      _.without(HTTPmethods,'all').forEach(function(method) {
        ep[method] = {
          // TODO: should parse the resource for /:params like express, or allow regex
          // TODO: should allow for middleware chaining akin to express.. ie: app.get route middleware middleware etc..
          handlers: handlers
        };
      });
    }
    else {
      ep[method] = {
        // TODO: should parse the resource for /:params like express, or allow regex
        // TODO: should allow for middleware chaining akin to express.. ie: app.get route middleware middleware etc..
        handlers: handlers
      };
    }
    
  };
});

RouteHelper.prototype.use = function(fn) {
  if(typeof fn !== 'function')
    return console.warn('! User-defined API middleware only takes a function, no mounting', fn);
  this.middleware.push(fn);
};

/*
 * getApis
 * 
 * builds a hash of resources > methods > definitions (by depth)
 * 
 * @return {Object} promise resolving to api spec
 */
var getApis = function() {
  
  // don't re-fetch...
  if(fetchedEndpoints) pseudoPromiseChain(fetchedEndpoints);
  
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
          var helper = new RouteHelper(cleanName)
            , ret;
          if(exp.length>1) // function arrity, check for callback
            exp(helper, function() { yes([cleanName, helper.routes, helper.middleware]) });
          else {
            ret = exp(helper);
            console.log(JSON.stringify(ret||{}), JSON.stringify(helper.routes));
            yes([cleanName, helper.routes, helper.middleware]);
          }
        }

      } catch(e) { console.warn('! Could not setup api: '+ cleanName, e.stack); }
    }));
  });
  
  return Promise.all(promises).then(function(routes) {
    // organize: apiName > resource > method > handler
    var eps = {}
      , middleware = {};
    routes.forEach(function(pair) {
      // pair is first apiName, then 'routes' and 'middleware' from RouteHelper
      eps[pair[0]] = pair[1];
      middleware[pair[0]] = pair[2];
    });
    fetchedEndpoints = eps;
    
    // write helper script
    require('./server-reflector')(eps,null,require('./tools/ajax')());
    
    return {
      endpoints:  eps,
      middleware: middleware
    };
  });
};

module.exports = {
  
  get: getApis,
  
  RouterHelper: RouteHelper
  
};