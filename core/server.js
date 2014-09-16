var connect = require('connect')
  , tools = require('./tools/server-tools')
  , apiMiddleware = require('./server-api').middleware()
  , staticMiddleware = require('serve-static')
  , _ = require('lodash')
  , fs = require('fs');
  
module.exports = function(port) {
  var server = connect()
    , publicFolder = process.cwd() + '/public';
  
  // add an api render handler to response object
  server.use('/api', tools.jsonHandler);
  
  // handle api requests
  server.use('/api', apiMiddleware);
  
  // serve static assets
  // TODO: handle serving multisite setups
  server.use(staticMiddleware(publicFolder, {
    extensions: ['html'],
    redirect: false
  }))
  
  // if we didn't serve anything check that it wasn't b/c of a folder conflict
  server.use(function(req,res,next) {
    if( ! /\.html$/.test(req.url)) {
      req.url = req.url.replace(/\/$/,'');
      req.url += '.html';
      var path = process.cwd() + '/public' + req.url;
      fs.exists(path, function(exists) {
        if(exists)
          staticMiddleware(publicFolder)(req,res,next);
        else
          next();
      });
    } else
      next();
  })
  
  .listen(port);
  
  console.log('Listening on port '+port);
};