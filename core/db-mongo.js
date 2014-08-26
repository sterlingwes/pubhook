var Mongo = require('mongodb')
  , ObjectID = Mongo.ObjectID
  , Client = Mongo.MongoClient
  , Server = Mongo.Server

  , Promise = require('es6-promise').Promise

  // reference handle to current connection instance
  , connected
;

/*
 * mongo engine
 * 
 * @param {Object} config
 *  - config.host
 *  - config.port
 * 
 * @return Promise
 */
module.exports = function(config) {
  
  if(!config)
    config = { host: 'localhost', port: 27017 };
  
  // hold a reference handle so we only connect once
  if(connected) return { then: function(cb) { cb(connected); return { catch: function() {} }; } };
  
  // otherwise return an actual promise
  return new Promise(function(yes,no) {
    var cli = new Client(new Server(config.host, config.port), { native_parser: true });
    cli.open(function(err,cli) {
      if(err) return no(err);
      connected = cli;
      require('./models').setVar('mongo', true);
      yes({
        cli:    cli,
        close:  function() {
          cli.close();
          connected = false;
          require('./models').setVar('mongo', false);
        }
      });
    });
  });
  
};