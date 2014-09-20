var models = require('./models')
  , glob = require('glob')
  , cwd = process.cwd()
;

module.exports = function(flags) {
  
  var isWatching = flags.watch || flags.w;
  
  require('./tasks')(folders, models, isWatching);

};