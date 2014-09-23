module.exports = function(app) {
  
  app.get('/world', function(req,res) {
    res.end('Hello World! - Custom API Endpoint');
  });
  
};