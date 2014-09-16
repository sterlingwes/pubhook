module.exports = function pseudoPromiseChain(retVal) {
  return {
    then: function(cb) {
      var ret = cb(retVal);
      return pseudoPromiseChain(ret);
    },
    catch: function() {}
  };
};