#! /usr/bin/env node
var Cli = require('simpcli')
  , cli = new Cli({

    start: {
      about: 'Build & render your site to the public folder',
      fn: function() {
        require('./core/main.js');
      }
    },
    
    serve: {
      about: 'Start a simple static HTTP file server for development, -p port',
      fn: function() {
        var args = [].slice.call(arguments,0)
          , port = 8181
          , flagIdx = args.indexOf('-p');
        
        if(flagIdx>=0)
          port = args[flagIdx+1] || port;
          
        require('./core/static-server.js')(port);
      }
    }

  });

cli.chain.then(function(res) {
  // do something when done?
})
.catch(function(err) {
  cli.print('Oops!', err);
});