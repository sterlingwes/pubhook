#! /usr/bin/env node
var Cli = require('simpcli')
  , cwd = process.cwd()
  , availableTasks = require('glob').sync(cwd + '/core/tasks/*.js')
  , cli = new Cli({

    start: {
      about: 'Build & render your site to the public folder (-w to watch)',
      fn: function() {
        console.log('- Starting build...');
        require('../core/main')( this.parseFlags(arguments) );
      }
    },
    
    task: {
      about: 'Run a specific task ('
            + availableTasks.map(function(t) { return t.split('/').pop().replace(/\.js$/,''); })
              .join(', ') + ')',
      fn: function(task) {
        GLOBAL.taskToRun = task;
        require('../core/tasks');
      }
    },
    
    serve: {
      about: 'Start a dev server, -p port',
      fn: function() {
        var args = this.parseFlags(arguments)
          , port = 8181;
          
        require('../core/server.js')(args.p || port);
      }
    },
    
    clean: {
      about: 'Empties the public folder',
      fn: function() {
        var dir = process.cwd()+'/public/**/*';
        console.log('Cleaning ' + dir + '...');
        require('del')(dir, function(err) {
          if(err) return console.error(err);
          console.log('public directory cleaned.');
        });
      }
    }

  });

cli.chain.then(function(res) {
  // do something when done?
})
.catch(function(err) {
  cli.print('Oops!', err && err.stack ? err.stack : err);
});