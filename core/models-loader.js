module.exports = function(models, test) {
  
  var glob = test ? test.glob : require('glob')
    , Promise = require('es6-promise').Promise
    , cwd = process.cwd()
    , modelPath = './models'
    , fetchModel = require('./models-fetcher').fetcher
  ;

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
                  if(m) { models[modelName] = m; }
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
          console.log(err.stack);
        });
      }
    });
  };

  return loader;
  
};