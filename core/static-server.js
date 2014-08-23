var connect = require('connect')
  , staticMiddleware = require('serve-static');
  
module.exports = function(port) {
  connect()
  .use(staticMiddleware(process.cwd() + '/public', {
    extensions: ['html']
  }))
  .listen(port);
  
  console.log('Listening on port '+port);
};