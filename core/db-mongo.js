var Mongo = require('mongodb')
  , ObjectID = Mongo.ObjectID
  , Client = Mongo.MongoClient
  , Server = Mongo.Server

  , Promise = require('es6-promise').Promise

  // reference handle to current connection instance
  , connected

  , adapter = function(config) {

      if(!config || !config.connection)
        config = { connection: { host: 'localhost', port: 27017 } };

      // hold a reference handle so we only connect once
      if(connected) return { then: function(cb) { cb(connected); return { catch: function() {} }; } };

      // otherwise return an actual promise
      return new Promise(function(yes,no) {
        var cli = new Client(new Server(config.connection.host, config.connection.port), { native_parser: true });
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

    }
;

module.exports = {

  /*
   * mongo adapter
   * 
   * @param {Object} m
   *  - m.connection.host
   *  - m.connection.port
   * 
   * @return Promise
   */
  adapter: adapter,
    
  /*
   * resource handlers called by api-server
   * 
   * @param {Object} m the model schema defined in /models
   */
  resourceHandlers: function(m) {

    return adapter(m).then(function(conn) {

      var cli = conn.cli
        , db = cli.db(m.dbName || 'pubhook')
        , collection = db.collection(m.collection);
      
      return {
        
        create: function(data,done) {
          collection.insert(data, done);
        },
        
        read: function(done) {
          var options = {};
          if(m.sortBy) {
            var sort = [];
            for(var key in m.sortBy) {
              sort.push([key,m.sortBy[key]]);
            }
            if(sort.length) options.sort = sort;
          }
          var cursor = collection.find({}, options);
          return cursor.toArray(function(err,res) {
            if(err) return done(err);
            done(null, res);
          });
        },
        
        update: function(id, data, done) {
          
        },
        
        delete: function(id, done) {
        
        }
        
      };
      
    }); // no need to catch, returning promise chain
  }
  
};