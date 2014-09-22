var del = require('rimraf')
  , cwd = process.cwd()
;

module.exports = function() {
  
  return function() {
    console.log('- Cleaning up old build files');
    del(cwd + '/.build', function() {});
  };
  
};