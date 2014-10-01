var userApis = require('../server-api-defined');

var testEp = function(apis,name,method,resource) {
  expect(apis[name]).toBeTruthy();
  expect(apis[name][resource]).toBeTruthy();
  expect(typeof apis[name][resource][method]).toBe('object');
  expect('length' in apis[name][resource][method].handlers).toEqual(true);
};

describe('server-api-defined', function() {
  
  it('should get defined apis', function(done) {
    
    userApis.get().then(function(apis) {
      console.log(JSON.stringify(apis));
      return done();
      
      // hello GET: /world
      // api hash, apiName, method, resource
      testEp(apis.endpoints,'hello','get','/world');
      
      done();
    }).catch(function(err) { console.error(err.stack); });
    
  });
  
});