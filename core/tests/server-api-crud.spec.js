var api = require('../server-api-crud');

describe('server-api-crud', function() {
  
  it('should get models', function() {
    
    var models = api.getModels();
    
    expect(Object.keys(models)).toEqual([
      'markdown', 'posts', 'site', 'somedata'
    ]);
    
  });
  
  it('should parse request url', function() {
    
    var path = api.getPath({ url: '/pages' });
    expect(path.resource).toEqual('pages');
    
  });
  
});