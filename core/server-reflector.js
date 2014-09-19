var fs = require('fs')
  , cwd = process.cwd()
  , mkdirp = require('mkdirp')
;

/*
 * server-reflector
 * 
 * writes a helper script that can be used by apps to communicate with apis / use ajax and other transports
 * 
 * @param {Object} eps endpoints from server-api-defined with user-defined apis
 * @param {Function} done optional callback fired when file is written (or errors thrown)
 * @param {String} xhr client to use (can be used to stub for tests)
 * @return {String} of api.js, for tests
 */
module.exports = function(eps,done,xhr) {
  
  // iterate over each api, resource, and method
  // this needs to be totally encapsulated for proper writing
  
  /*
   * apiReflector
   * 
   * client-side abstraction, stringified and written to apps/_ph/api.js
   * 
   * @param {Object} epis from on high
   * @param {Object} xhr ajax client or abstraction that fits the xhr.method(url[,data]) signature
   */
  function apiReflector(eps,xhr) {
    
    if(typeof window === 'object')
      xhr = new xhr(window);
    else
      xhr = new xhr();
    
    var retVal = {}
      , crudMap = {
          post:     'create',
          get:      'read',
          put:      'update',
          'delete': 'delete'
        };
    
    // each API
    Object.keys(eps).forEach(function(name) {
      
      retVal[name] = {}
      var resources = eps[name];
      
      // each RESOURCE
      Object.keys(resources).forEach(function(resName) {
        
        var res = resources[resName]
          , methods = Object.keys(res);
        
        // get rid of beginning slash
        if(resName[0]=='/') resName = resName.slice(1);
        
        // TODO: need to handle params in resName starting with RouteHelper in server-api-defined
        var endpointName = resName.split('/').shift();
        
        // this function can be called as the root request if there's only one method for the resource endpoint, otherwise it defaults to GET
        // ie: client.users()
        var resource = retVal[name][endpointName] = function() {
          var args = [].slice.call(arguments,0)
            , url = '/api/'+name+'/'+endpointName;

          args.unshift(url);
          return xhr[ methods.length==1 ? methods[0] : 'get'].apply(null, args);
        };
        
        // each METHOD
        methods.forEach(function(method) {
          
          resource[method] = resource[crudMap[method]] = function() {
            var args = [].slice.call(arguments,0)
              , url = '/api/'+name+'/'+endpointName;

            args.unshift(url);
            return xhr[method].apply(null, args);
          };
          
        });
        
      });
      
    });
                
    return retVal;          
    
  }
  
  var dir = cwd+'/apps/_ph/'
    , xhrStub = "function XHR() { ['get','update','post','put'].forEach(function(m){ XHR.prototype[m] = function(url,data) {console.log('mockjax-request:', url, data);return { url: url, data: data };}; }); }"
    , script = "module.exports = (" + apiReflector.toString(2) + ")("+JSON.stringify(eps)+", "+(xhr || xhrStub)+");";
  
  // write the file to apps/ph/api.js for easy require
  
  mkdirp(dir, {}, function(err,made) {
    if(typeof done !== 'function') done = function() {};
    if(err) return done(err);
    fs.writeFile(dir+'api.js', script, function(err) {
      done(err);
    });
  });
  
  return script;
  
};