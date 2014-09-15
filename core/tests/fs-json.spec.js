var md = require('../fs-json')
  , cwd = process.cwd();

describe('fs-json loader', function() {
  
  it('should listFiles', function(done) {
    md._listFiles(require(cwd + '/models/somedata'), function(err,files) {
      var jsonFiles = [
        
        'data1'
        
      ].map(function(f) { return './jsondata/'+f+'.json'; });
      
      expect(files).toEqual(jsonFiles);
      done();
    });
  });
  
  it('should readFiles', function(done) {
    md.adapter(require(cwd + '/models/somedata')).then(function(files) {
      
      //console.log(JSON.stringify(files,null, ' '));
      
      expect(files.length).toEqual(1);
      expect(files[0]).toEqual({
        somedata: true,
        _id: "data1"
      });
      
      done();
    })
    .catch(function(err) {
      console.error(err.stack);
    });
  });
  
});