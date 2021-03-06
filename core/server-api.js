/*
 * api-server handles user-defined REST APIs and model-related CRUD resource ops
 */

var _ = require('lodash')
  , url = require('url')
  , glob = require('glob')
  , cwd = process.cwd()
  , userApis = require('./server-api-defined')
  , crudApis = require('./server-api-crud')
  
  , apis
;

userApis.get().then(function(a) {
  apis = a;
}).catch(function(e) {
  console.error(e.stack);
});

module.exports = {
  
  /*
   * middleware
   * 
   * mounts all endpoints to /api
   * 
   * @param {Object} models (optional)
   * @return {Function} middleware request handler
   */
  middleware: function() {
    return function(req,res,next) {

      var parsed = url.parse(req.url)
        , parts = parsed.pathname.split('/')
        , path = []
        , middlewareStack = []
      ;
      
      parts.shift(); // get rid of /api namespace
      
      path.push(parts.shift()); // apiName
      path.push('/'+parts.join('/')); // resource & any ids or other parts
      path.push.apply(path, [req.method.toLowerCase(), 'handlers']); // method and handler
      
      var level = apis && apis.endpoints ? apis.endpoints[path.shift()] : undefined
        , ep;
      
      _.find(path, function(part) {
        
        if(!level || level[part].length) {
          if(level) ep = level;
          return true;
        }
        
        level = level[part];
      });
      
      if(!ep || !ep.handlers || !ep.handlers.length)
        return crudApis.middleware(req,res,next); // try default crud apis

      ep.handlers[0](req,res,next);
      
    };
  }
  
};
