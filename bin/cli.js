#! /usr/bin/env node
var Cli = require('simpcli')
  , cli = new Cli({

    start: {
      about: 'Build & render your site to the public folder (-w to watch)',
      fn: function() {
        console.log('- Starting build...');
        require('../core/main.js')( this.parseFlags(arguments) );
      }
    },
    
    serve: {
      about: 'Start a simple static HTTP file server for development, -p port',
      fn: function() {
        var args = this.parseFlags(arguments)
          , port = 8181;
          
        require('../core/static-server.js')(args.p || port);
      }
    },
    
    clean: {
      about: 'Empties the public folder',
      fn: function() {
        require('rimraf')(process.cwd()+'/public/**/*');
        console.log('cleaned.');
      }
    }

  });

cli.chain.then(function(res) {
  // do something when done?
})
.catch(function(err) {
  cli.print('Oops!', err && err.stack ? err.stack : err);
});