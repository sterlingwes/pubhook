module.exports = function(models, test) {
  
  var glob = test ? test.glob : require('glob')
    , Promise = require('es6-promise').Promise
    , cwd = process.cwd()
    , modelPath = './models'
    , readMdFiles = require('./models-md')
    , _ = require('lodash')

    // TODO: will need a way to plug-in other engines
    , mongo = require('./db-mongo')
  ;

  /*
   * fetchModel - retrieves data depending on the pubhookType specified in the model schema
   * 
   * @param {String} name of the model (from the filename)
   * @param {Object} m the model object itself (from require'd file)
   * @param {Function} done callback
   */
  var fetchModel = function(name,m,done) {
    if(!m || typeof m !== 'object') {
      console.warn('! Warning - no valid export found for model "' + name + '"');
      return false;
    }

    switch(m.pubhookType) {
      case "markdown":
        var source = './' + (m.source ? m.source.replace(/^[\/\.]+/,'') : 'markdown');
        glob(source + '/*.md', function(err,files) {
          readMdFiles(files.map(function(f) { return f.replace(/^\.+/,cwd); }), function(err,res) {
            if(err) return console.warn(err);
            done(err, _.groupBy(res,'name'));
          });
        });
        break;
      case "mongo":
      case "mongodb":
        // TODO: will need a global config for host / port / db (and per-model overrides)
        if(!m.collection) return done("No collection name specified for mongo model "+name);
        mongo({ host: 'localhost', port: 27017 })
          .then(function(conn) {
            var cli = conn.cli
              , db = cli.db(m.dbName || 'pubhook')
              , cursor = db.collection(m.collection).find({});
            
            return cursor.toArray(function(err,res) {
              if(err) return done(err);
              done(null, _.extend(m, { items: res }));
            });
            
          }).catch(function(err) { done(err); });
        break;
      default:
        done(null, m); // unknown type, assume raw values as data
    }
  };

  /*
   * loader - iterates over all files in the model directory and loads them into memory
   * 
   * @param {Function} done - callback when promises resolve (err, modelDatas)
   */
  var loader = function(done) {
    if(!done || typeof done !== 'function') done = function() {};
    if(Object.keys(models).length) return done(null,models);

    var promises = [];

    glob(modelPath + '/*.js', function(err,files) {
      if(files) {
        files.forEach(function(f) {
          var modelName = f.replace(modelPath+'/','').replace(/\.js/,'')
            , promise = new Promise(function(res,rej) {

              try {
                fetchModel(modelName, require(f.replace(/^\.+/, cwd)), function(err,m) {
                  if(err) return console.warn(err);
                  if(m)   models[modelName] = m;
                  res(models[modelName]);
                });

              } catch(e) {
                console.warn('! Err Loading Model "'+modelName+'" ');
                console.log(e.stack);
                rej(e);
              }

            })
          ;

          promises.push(promise);
        });

        Promise.all(promises).then(function() {
          var mods = Object.keys(models);
          console.log('- '+ mods.length+' models loaded: '+mods.join(', '));
          done(null,models);

        }).catch(function(err) {
          console.warn('! Error loading models');
          console.log(err);
        });
      }
    });
  };

  return loader;
  
};