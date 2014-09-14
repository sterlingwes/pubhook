var _ = require('lodash');

/*
 * template functions
 * 
 * provides helpers for templates and an interface for the data model loaded by models.js
 * 
 * @param {Module} sitemap
 */
module.exports = function(sitemap) {
  
  return function(data, vars) {
    
    var getById = function(name,id) {
      if(!data[name] || !data[name].items) return;
      return _.find(data[name].items, function(d) {
        return d._id == id;
      });
    };
    
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
     },
     
     /*
      * isActiveCtx
      * 
      * check whether the uri of the current context is the active one (useful for colouring links)
      * 
      * @param {Object} ctx context
      * @param {String} uri to test for
      * @return {Boolean} true if is active uri
      */
     isActiveCtx: function(ctx, uri) {
       return ctx.__uri == uri;
     },
     
     /*
      * isActiveUriBuilder
      * 
      * useful for avoiding having to pass the context in template tags.. used internally to provide "isActiveUri" to some templates
      */
     isActiveUriBuilder: function(ctx) {
       return function(uri) {
         return ctx.__uri == uri;
       };
     },
     
     /*
      * getById
      * 
      * grab a specific record from a specific model
      * 
      * @param {String} name of model
      * @param {String} id to look by
      * @return {Object} record (hopefully!)
      */
     getById: getById,
     
     /*
      * menuChildOrSibling
      * 
      * provides list of objects corresponding to either children or (failing that) siblings of the passed context
      * 
      * @param {String} name of model
      * @param {Object} ctx context
      * @return {Array} of objects
      */
     menuChildOrSibling: function(name,ctx) {
       return (ctx._children || ctx._siblings).map(function(c) {
         var rec = getById(name, c);
         return rec;
       });
     }

   };
  };
  
};