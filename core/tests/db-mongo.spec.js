var mongo = require('../db-mongo');

describe('mongo engine', function() {
  
  it('should connect', function(done) {
    
    mongo({ host: 'localhost', port: 27017 })
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