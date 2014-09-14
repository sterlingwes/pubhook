var md = require('../fs-markdown')
  , cwd = process.cwd();

describe('fs-markdown loader', function() {
  
  it('should listFiles', function(done) {
    md._listFiles(require(cwd + '/models/markdown'), function(err,files) {
      var markdownFiles = [
        
        'a page',
        'a page/ipsum',
        'a page/lorem'
        
      ].map(function(f) { return './markdown/'+f+'.md'; });
      
      expect(files).toEqual(markdownFiles);
      done();
    });
  });
  
  it('should readMdFiles', function(done) {
    md.adapter(require(cwd + '/models/markdown')).then(function(files) {
      
      //console.log(JSON.stringify(files,null, ' '));
      
      expect(files.length).toEqual(3);
      expect(files[0].attributes.title).toEqual('Oh, Hey.md');
      expect(files[0]._children.length).toEqual(2);
      expect(files[1].attributes.title).toEqual('Some Ipsum');
      expect(files[1]._parent).toEqual('a-page');
      expect(files[2].attributes.title).toEqual('Some Lorem');
      expect(files[2]._parent).toEqual('a-page');
      
      done();
    })
    .catch(function(err) {
      console.error(err.stack);
    });
  });
  
});