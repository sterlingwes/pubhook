describe('model loader', function() {
  
  it('should load a static model', function() {

    var loader = require('../models-loader')({}, {
      glob: function(glob, cb) {
        cb(null, ['./tests/db-mongo.site.js']);
      }
    });
    
    loader(function(err,data) {
      expect(err).toBeNull();
      expect(data).toEqual({ './tests/site': { name: 'My Site' }});
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