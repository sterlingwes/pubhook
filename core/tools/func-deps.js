/*
 * getDeps
 * 
 * get function variable names
 * 
 * @param {Function} func
 * @return {Array} of strings
 */
module.exports = function(func) {
  if(typeof func !== 'function')	return [];
    var fnStr = func.toString().replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg, '');
    var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(/([^\s,]+)/g);
    if(result === null)
        result = [];

    return result.map(function(dep) { return dep.toLowerCase(); });
};