/*
 * api-server handles standard REST CRUD resource operations
 */

var url = require('url')
  , _ = require('lodash')
  , glob = require('glob')
  , cwd = process.cwd()
  , Promise = require('es6-promise').Promise
;

var getPath = function(req) {
  var parsed = url.parse(req.url)
    , path = parsed.pathname.split('/')
    , request = {};
  
  if(!path || path.length<=1)
    return;
  
  request.resource = path[1];
  
  if(path[2])
    request.id = path[2];
  
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
  
  /*
   * middleware
   * 
   * @param {Object} models (optional)
   * @return {Function} middleware request handler
   */
  middleware: function(models) {
    if(!models)
      models = getModels();
    
    var sitemap;
    try {
      sitemap = require(cwd + '/sitemapping.json');
    } catch (e) { }
    
    return function(req,res,next) {

      var path = getPath(req)
        , resource = models[path.resource];
      
      if(!resource)
        return next(); // hand off to other handlers (default deny request)
      
      // assume clients want json, we can add xml later
      res.setHeader('Content-Type', 'application/json');
      
      if(path.id) { // specific update or delete
        //TODO
        return next();
      }
      
      // adding (creating) or getting
      if(resource.pubhookType && resource.pubhookType != 'markdown') {
        var db;
        try { db = require('./db-'+resource.pubhookType); }
        catch(e) { console.warn('! Could not load db for type '+ resource.pubhookType); }
        if(db)
          db.resourceHandlers(resource).then(function(actions) {
            switch(req.method) {
                case "GET":
                  if(!actions.index) { console.warn('! No index() action for '+resource.pubhookType); return next(); }
                  return actions.index(res.toJson);
                case "POST":
                  return actions.create(req.body, res.toJson);
            }
            
          });
      }
    };
  },
  
  getPath: getPath,
  
  getModels: getModels
  
};