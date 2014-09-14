var glob = require('glob')
  , Promise = require('es6-promise').Promise
  , slug = require('./model-parse-data')
  , cwd = process.cwd()
  , modelPath = './models'
  , readMdFiles = require('./fs-markdown')
  , _ = require('lodash')

  // TODO: will need a way to plug-in other engines
  , mongo = require('./db-mongo')
;

// determine what type-loaders we have available on moduleLoad
var types = {}
  , typeFiles = glob.sync(__dirname + '/{db,fs}-*.js');

typeFiles.forEach(function(f) {
  var parts = f.split('-')
    , type = parts.shift().split('/').pop();
  types[parts.join('-').toLowerCase().replace(/\.js$/,'')] = type;
});

/*
 * fetchModel - retrieves data depending on the pubhookType specified in the model schema by trying to load the given type-loader
 * 
 * @param {String} name of the model (from the filename)
 * @param {Object} m the model object itself (from require'd file)
 * @param {Function} done callback
 */
var fetchModel = function(name,m,done) {
  if(!m || typeof m !== 'object') {
    console.warn('! Warning - no valid export found for model "' + name + '"');
    return done(null,{}); // soft fail
  }

  var type = m.pubhookType ? m.pubhookType.toLowerCase() : null;
  
  if(!type) return done(null, m); // assume raw model (single instance)
  
  if(!types[type]) {
    console.warn('! Warning - no type-loader could be found for '+type+' type');
    return done(null,{}); // soft fail
  }
  
  var typeLoader
    , typeLoaderName = types[type]+'-'+type;
  
  try {
    typeLoader = require(__dirname + '/' + typeLoaderName);
  }
  catch (e) {
    return done(e);
  }
  
  if(!typeLoader || typeof typeLoader.resourceHandlers !== 'function')
    return done('! Did not recognize handler provided for type ' + typeLoaderName);

  // with the loader, retrieve resource handlers
  typeLoader.resourceHandlers(m)

    // after db connection is made or files are read we can call our handler actions
    .then(function(actions) {
    
      // read in all items for rendering
      // TODO: allow for scoping reads for targeted rendering
      actions.read(function(err,res) {
        
        if(err) return done(err);
        
        // typeloader should pass an array of objects, add as items to model object
        // add internal tags required for rendering
        var mdl = _.extend({}, m, { items: res.map(function(r) {
          r.__uri = r.attributes && r.attributes.uri ? r.attributes.uri : ( m.renderEachBy ? slug(m.renderEachBy, r) : slug(r._id, r) );
          r.__name = name; // model name
          return r;
        }) });
        
        done(null, mdl);
        
      });
    })
  
    .catch(function(err) {
      console.error(err.stack);
    });
};

module.exports = {
  
  fetcher: fetchModel,
  
  types: types
  
};