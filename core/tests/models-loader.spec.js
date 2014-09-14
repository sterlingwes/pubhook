var cwd = process.cwd();

if(!/tests$/.test(cwd)) cwd += '/tests';

describe('model loader', function() {
  
  it('should load all model records', function(done) {
    
    var loader = require('../models-loader')({});
    
    loader(function(err,data) {
      
      //console.log(JSON.stringify(data,null,' '));

      // static model
      var static = data.site;
      expect(static).toEqual({
        name: "Pubhook Site"
      });
      
      // markdown model
      var md = data.markdown;
      expect(md.items.length).toEqual(3);
      
      // posts model
      var posts = data.posts;
      expect(posts.items.length).toEqual(3);
      
      return require('../db-mongo').adapter({}).then(function(conn) {
        conn.close();
        done();
      });
      
    });
    
  });

});