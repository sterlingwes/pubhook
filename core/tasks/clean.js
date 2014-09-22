var del = require('rimraf')
  , cwd = process.cwd()
;

module.exports = function() {
  
  console.log('- Cleaning up old build files');
  return del(cwd + '/.build', function() {});
  
};