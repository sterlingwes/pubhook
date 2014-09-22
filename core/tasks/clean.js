var del = require('rimraf')
  , cwd = process.cwd()
;

module.exports = function(cb) {
  
  console.log('- Cleaning up old build files');
  return del(cwd + '/.build', cb);
  
};