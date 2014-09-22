var glob = require('glob')
  , _ = require('lodash')
  , url = require('url')
  , cwd = process.cwd()
  , triggerBuild = require('./tasks-trigger')

  , models
;

/*
 * getPath
 * 
 * parses request uri and returns the "resource", assuming uris are in the form of /resource/:id?
 * 
 * @param {Object} req
 * @return {Object} resource with id and resource keys, resource= name of, id if provided
 */
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

/*
 * getModels
 * 
 * loads all model content into memory
 */
var getModels = function() {
  
  var ms = _.groupBy(_.map(glob.sync(cwd+'/models/*.js'), function(m) {
    var name = m.match(/models\/([a-z\-\_\.0-9]+)\.js$/i);
    return _.extend({}, require(m), {
      __path: m, 
      __name: name && name[1]
    });
  }), '__name');
  
  for(var key in ms) {
    ms[key] = ms[key][0];
  }
  
  return ms;
};

if(!models)
    models = getModels();

/*
 * middleware for handling crud requests
 */
var middleware = function(req,res,next) {
  
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
    if(db) {
      db.resourceHandlers(resource).then(function(actions) {
        switch(req.method) {
            case "GET":
              if(!actions.read) { console.warn('! No read() action for '+resource.pubhookType); return next(); }
              return actions.read(res.toJson);
            case "POST":
              return actions.create(req.body, function(err,docs) {
                if(!err) {
                  // force build for this scope
                  triggerBuild(path.resource, docs);
                }
                res.toJson(err,docs);
              });
        }

      });
    }
  }
};

module.exports = {

  middleware: middleware,
  
  getPath: getPath,
  
  getModels: getModels
  
  // TODO: needs to use an array of promises to resolve issue in } else {}
  // this block is currently UNUSED
  /*
  getEndpoints: function(done, models) {
    if(!models)
      models = getModels();
    
    var resources = {};
    _.each(models, function(m,k) {
      var name = k.split('.').pop()
        , actions = resources[name] = [];
      
      if(m && typeof m.resourceHandlers === 'object')
        [].push.apply(actions, Object.keys(m.resourceHandlers));
      else {
        var db;
        try { db = require('./db-'+resource.pubhookType); }
        catch(e) {}
        if(db)
          db.resourceHandlers(resource).then(function(actions) {
            [].push.apply(actions, Object.keys(actions));
          });
      }
    });
    
    done(resources);
  }
  */
  
};