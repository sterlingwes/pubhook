var api = require('../api-server')
  , cwd = process.cwd();

if(!/tests$/.test(cwd)) cwd += '/tests';

describe('api-server', function() {
  
  it('should get models', function() {
    
    var models = api.getModels({sync: function() {
      return [cwd+'/models/markdown.js',cwd+'/models/db-mongo.site.js',cwd+'/models/db-mongo.mongo.js'];
    }});
    
    expect(Object.keys(models)).toEqual(['markdown','db-mongo.site','db-mongo.mongo']);
    
  });
  
  it('should parse request url', function() {
    
    var path = api.getPath({ url: '/pages' });
    expect(path.resource).toEqual('pages');
    
  });
  
});