var cwd = process.cwd();

if(!/tests$/.test(cwd)) cwd += '/tests';

describe('model loader', function() {
  
  it('should load a static model', function() {

    var loader = require('../models-loader')({}, {
      glob: function(glob, cb) {
        cb(null, [cwd+'/models/db-mongo.site.js']);
      }
    });
    
    loader(function(err,data) {
      expect(err).toBeNull();
      var t = {};
      t[cwd+'/models/db-mongo.site'] = { name: 'My Site' };
      expect(data).toEqual(t);
    });
    
  });
  
  it('should load a markdown model', function() {
    
    var loader = require('../models-loader')({}, {
      glob: function(glob, cb) {
        if(glob=='./models/*.js')
          cb(null, [cwd+'/models/markdown.js']);
        else
          cb(null, [cwd+'/markdown/markdown.md']);
      }
    });
    
    loader(function(err,data) {
      var mds = data[cwd+'/models/markdown']
        , keys = Object.keys(mds);
      
      expect(keys.length).toEqual(1);
      expect(typeof mds[keys[1]] === 'object').toEqual(true);
    });
    
  });
  
  it('should load a mongo model', function() {

    var loader = require('../models-loader')({}, {
      glob: function(glob, cb) {
        cb(null, [cwd+'/models/db-mongo.mongo.js']);
      }
    });
    
    loader(function(err,data) {
      expect(err).toBeNull();
      var t = {};
      t[cwd+'/models/mongo'] = [];
      expect(data).toEqual(t);
      expect(data[cwd+'/models/db-mongo.mongo'].length).toEqual(0);
      
      require('../db-mongo')({}).then(function(conn) {
        conn.close();
      });
    });
    
  });
  
});