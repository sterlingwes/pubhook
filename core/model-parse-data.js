var slug = require('uslug')
  , _ = require('lodash');

/*
 * takes a model, retrieves the data specified in the slug format and returns as specified
 * 
 * @param {String} scheme defining slug format, can use {} to define property in model to replace with
 * @param {Object} model
 * @return {String} uri slug
 */
module.exports = function(scheme, model) {
  if(!scheme) return;
  var uriParts = scheme.split('/')
    , sluggedParts;
  
  sluggedParts = uriParts.map(function(part) {
    if(!part) return;
    return slug(part.replace(/\{([a-z]+)\}/i, function(wholeMatch,match,pos,testedStr) {
      var ifMiss = 'MISSING-'+match;
      if(match)
        return model[match] || ifMiss;
      return ifMiss;
    }), {
      allowedChars: '_-'
    });
  });
  
  return _.without(sluggedParts, undefined).join('/');
};