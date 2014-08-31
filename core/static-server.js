var connect = require('connect')
  , apiMiddleware = require('./api-server')
  , staticMiddleware = require('serve-static');
  
module.exports = function(port) {
  var server = connect();
  
  // handle api requests
  connect.use('/api', apiMiddleware);
  
  // serve static assets
  // TODO: handle serving multisite setups
  connect.use(staticMiddleware(process.cwd() + '/public', {
    extensions: ['html']
  }))
  .listen(port);
  
  console.log('Listening on port '+port);
};