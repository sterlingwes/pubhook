var api = require('../api-server');

describe('api-server', function() {
  
  it('should get models', function() {
    
    var models = api.getModels();
    
    expect(Object.keys(models)).toEqual([
      'markdown', 'posts', 'site'
    ]);
    
  });
  
  /*
  it('should know endpoints', function(done) {
    
    var endpoints = api.getEndpoints(function(eps) {
      console.log(eps);
      done();
    });
    
  });*/
  
  it('should parse request url', function() {
    
    var path = api.getPath({ url: '/pages' });
    expect(path.resource).toEqual('pages');
    
  });
  
});