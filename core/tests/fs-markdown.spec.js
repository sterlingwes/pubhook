var md = require('../fs-markdown');

describe('fs-markdown loader', function() {
  
  it('should listFiles', function(done) {
    md._listFiles(require('./models/markdown'), function(err,files) {
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
    md.adapter(require('./models/markdown')).then(function(files) {
      
      expect(files.length).toEqual(3);
      expect(files[0].attributes.title).toEqual('Oh, Hey.md');
      expect(files[0].children.length).toEqual(2);
      expect(files[1].attributes.title).toEqual('Some Ipsum');
      expect(files[2].attributes.title).toEqual('Some Lorem');
      
      done();
    })
    .catch(function(err) {
      console.error(err.stack);
    });
  });
  
});