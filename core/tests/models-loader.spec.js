describe('model loader', function() {
  
  it('should load a static model', function() {

    var loader = require('../models-loader')({}, {
      glob: function(glob, cb) {
        cb(null, ['./tests/db-mongo.site.js']);
      }
    });
    
    loader(function(err,data) {
      expect(err).toBeNull();
      expect(data).toEqual({ './tests/db-mongo.site': { name: 'My Site' }});
    });
    
  });
  
  it('should load a markdown model', function() {
    
    var loader = require('../models-loader')({}, {
      glob: function(glob, cb) {
        if(glob=='./models/*.js')
          cb(null, ['./tests/markdown.js']);
        else
          cb(null, ['./tests/markdown.md']);
      }
    });
    
    loader(function(err,data) {
      var mds = data['./tests/markdown']
        , keys = Object.keys(mds);
      
      expect(keys.length).toEqual(1);
      expect(typeof mds[keys[1]] === 'object').toEqual(true);
    });
    
  });
  
  it('should load a mongo model', function() {

    var loader = require('../models-loader')({}, {
      glob: function(glob, cb) {
        cb(null, ['./tests/db-mongo.mongo.js']);
      }
    });
    
    loader(function(err,data) {
      expect(err).toBeNull();
      expect(data).toEqual({ './tests/mongo': [] });
      expect(data['./tests/db-mongo.mongo'].length).toEqual(0);
      
      require('../db-mongo')({}).then(function(conn) {
        conn.close();
      });
    });
    
  });
  
});