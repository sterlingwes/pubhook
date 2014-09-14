var mongo = require('../db-mongo');

describe('mongo engine', function() {
  
  it('should connect', function(done) {
    
    mongo.adapter({})
      .then(function(conn) {
        expect('close' in conn.cli).toBe(true);
        conn.close();
        done();
      })
      .catch(function(err) {
        console.log(err.stack);
        expect(err).toBeFalsy();
        done();
      });
    
  });
  
});