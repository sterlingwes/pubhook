var parser = require('../model-parse-data');

describe('model uri parser', function() {
  
  it('should form correct uris', function() {
    
    var uri = parser('/posts/{title}',{title:'Hiya World'});
    expect(uri).toEqual('posts/hiya-world');
    
    uri = parser('posts/{title}', {title:'OK!!'});
    expect(uri).toEqual('posts/ok');
    
  });
  
});