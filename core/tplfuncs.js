/*
 * template functions
 * 
 * provides helpers for templates and an interface for the data model loaded by models.js
 * 
 * @param {Module} sitemap
 */
module.exports = function(sitemap) {
  
  return function(data, vars) {

   return {
     
     /*
      * get
      * 
      * retrieve a model by the provided name
      * 
      * @param {String} name
      * @return {Object}
      */
     get: function(name) {
       var d = data[name];
       if(d && d.items) return d.items; // if it's a database resource, don't pass the model schema
       return data[name];
     },

     /*
      * getAppScript
      * 
      * retrieve script tag for webpack build referenced by ref (app name from directory name)
      * 
      * @param {String} ref app folder name
      * @return {String}
      */
     getAppScript: function(ref) {
       var script = vars['app:link:'+ref.toLowerCase()] || 'SCRIPT_NOT_FOUND';
       return '<script src="/scripts/'+script+'.js"></script>';
     }

   };
  };
  
};