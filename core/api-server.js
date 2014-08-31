/*
 * api-server handles standard REST CRUD resource operations
 */

var url = require('url')
  , _ = require('lodash')
  , glob = require('glob')
  , cwd = process.cwd()
;

var getPath = function(req) {
  var parsed = url.parse(req.url)
    , path = parsed.pathname.split('/')
    , request = {};
  
  if(!path || path.length<=1)
    return;
  
  request.resource = path[1];
  
  return request;
};

// onLoad handle loading with sync
var getModels = function() {
  if(arguments[0])  glob = arguments[0]; // override for testing
  
  var ms = _.groupBy(_.map(glob.sync(cwd+'/models/*.js'), function(m) {
    var name = m.match(/models\/([a-z\-\_\.0-9]+)\.js$/i);
    return _.extend(require(m), {
      __path: m, 
      __name: name && name[1]
    });
  }), '__name');
  
  for(var key in ms) {
    ms[key] = ms[key][0];
  }
  
  return ms;
};

module.exports = {
  
  middleware: function(models) {
    if(!models)
      models = getModels();
    
    return function(req,res,next) {

      var path = getPath(req);
    };
  },
  
  getPath: getPath,
  
  getModels: getModels
  
};