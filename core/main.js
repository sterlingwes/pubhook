var models = require('./models')
  , glob = require('glob')
;

module.exports = function(flags) {
  
  var isWatching = flags.watch || flags.w;
  
  // determine our directory structure
  console.log('- Scanning directory structure...');
  glob(process.cwd() + '/*/', function(err, files) {
    var folders = files.map(function(f) { return f.split('/').pop(); });

    // load our data then run tasks after making database connection - fail hard if one doesn't connect
    console.log('- Loading models...');
    models.load(function(err,data) {
      //console.log(JSON.stringify(data,null,' '));
      require('./tasks')(folders, models, data, isWatching);
    });
  });

};