/*
 * sitemap handles mapping uris to models for reference post-build
 */

var uris = {};

module.exports = {
  
  /*
   * sitemap.get
   * 
   * @param {String} uri
   * @return {Array}
   */
  get: function(uri) {
    if(!uri) return uris;
    return uris[uri];
  },
  
  /*
   * sitemap.set
   * 
   * @param {String} uri slug for page
   * @param {Object} ref is an object with properties referencing the model used in rendering the uri which includes:
   *   - id for database records
   *   - index for raw lists
   *   - name for modelName
   */
  set: function(uri, ref) {
    var list = uris[uri] = uris[uri] || [];
    list.push(ref);
  }
  
};