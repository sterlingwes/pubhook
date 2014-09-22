module.exports = function(flags) {
  
  GLOBAL.isWatching = flags.watch || flags.w;
  
  require('./tasks');

};