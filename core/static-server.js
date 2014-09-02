var connect = require('connect')
  , tools = require('./server-tools')
  , apiMiddleware = require('./api-server').middleware()
  , staticMiddleware = require('serve-static')
  , _ = require('lodash');
  
module.exports = function(port) {
  var server = connect();
  
  // add an api render handler to response object
  server.use('/api', tools.jsonHandler);
  
  // handle api requests
  server.use('/api', apiMiddleware);
  
  // serve static assets
  // TODO: handle serving multisite setups
  server.use(staticMiddleware(process.cwd() + '/public', {
    extensions: ['html']
  }))
  .listen(port);
  
  console.log('Listening on port '+port);
};