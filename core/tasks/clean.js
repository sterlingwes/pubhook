var del = require('rimraf');

module.exports = function() {
  
  return function() {
    console.log('- Cleaning up old build files');
    del('/.build', function() {});
  };
  
};