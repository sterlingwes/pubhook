var apiReflect = require('../server-reflector');

describe('server-reflector', function() {
  
  it('should return string', function(done) {
    
    var api = apiReflect({
      hello: {
        '/world': {
          get: {
            handler: function() {}
          }
        }
      }
    }, function(err) {
      if(err) console.error(err);
      
      expect(typeof api).toBe('string');
      done();
    });
    
  });
  
  it('should work', function() {
    
    var api;
    
    try {
      api = require(process.cwd() + '/apps/_ph/api');
    } catch(e) {
      console.error(e.stack);
    }
    
    expect(typeof api).toBe('object');
    expect(api.hello.world('getter')).toEqual({
      url:  '/api/hello/world',
      data: 'getter'
    });
    expect(api.hello.world.read({data:true})).toEqual({
      url:  '/api/hello/world',
      data: {data:true}
    });
  });
  
});