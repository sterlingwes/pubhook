var _ = require('lodash')
  , renderer = require('./server-renderer')
  , marked = require('marked')
;

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
        return d._id ? d._id == id : d.__uri == id;
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
      * getReactApp
      * 
      * bootstraps a react app, same as writing your own React.renderComponent code
      * 
      * @param {String} ref name of webpack app that hosts react root
      * @param {Object} data (optional)
      * @return {String}
      */
     getReactApp: function(ref,data) {
       ref = ref.toLowerCase();
       
        // our rendered component html, added to our static page rendering
       var rendered = renderer(ref,data)
       
        // global ref for bootstrapping inline once the page is loaded, also the container #id
         , globalRef = 'ph-app-'+ref
       
        // container
         , div = '<div id="'+globalRef+'">'+rendered+'</div>'
       
        // the app script itself, same call as getAppScript helper, below
         , script = vars['app:link:'+ref] || 'SCRIPT_NOT_FOUND'
         , app = '<script src="/scripts/'+script+'.js"></script>'
       
        // inline bootstrapping on client rendering
         , warn = 'Cannot mount missing app: '+ ref +'. Have you used pubhook/tools/mount-react?'
         , js = '<script>'
                + 'var app = window["'+globalRef+'"]('+JSON.stringify(data||{})+');'
                + 'if(!app || typeof app !== "object") { console.warn("'+warn+'"); } else {'
                + 'React.renderComponent(app,'
                + 'document.querySelector("#'+globalRef+'")); }'
                +'</script>'
       ;
       
       return [div,app,js].join("\n"); // pretty!
       
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
      * isActiveUriBuilder
      * 
      * check whether the uri of the current context is the active one (useful for colouring links)
      * 
      * @param {String} uri to test for
      * @return {Boolean} true if is active uri
      */
     isActiveUri: function(uri) {
       var ctx = this;
       return ctx.__uri == uri;
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
      * a
      * 
      * shorthand for rendering a link
      * 
      * @param {String} label text to link
      * @param {Object} attrs link attributes (requires href)
      * @param {String|Boolean} addActiveClass is the class to add if this uri matches the current rendered page, defaults to 'active' unless false explicitly
      * @param {Boolean} isNotActiveIfParent should be true if a link should not be considered active if the parent of the active link
      * @return {String} a tag
      */
     a: function(label, attrs, addActiveClass, isNotActiveIfParent) {
       var ctx = this
         , href = attrs.href.replace(/^\//,'').replace(/(#[a-z\_\-0-9]+)?\/?$/,'');
       
       if(addActiveClass !== false) { addActiveClass = 'active'; }
       if( addActiveClass
        && (ctx.__uri === href || ( !isNotActiveIfParent && ctx._parent === href )) // needs to be deep equals as our root uri is just '', no leading / in any uri attrs
       ) { 
         if(attrs.class)  attrs.class += ' '+addActiveClass;
         else attrs.class = addActiveClass;
       }
       attrs = _.pairs(attrs);
       return '<a ' + attrs.map(function(pair) {
         return pair.join('="');
       }).join('" ') + '">' + label + '</a>';
     },
     
     /*
      * menuChildOrSibling
      * 
      * provides list of objects corresponding to either children or (failing that) siblings of the passed context
      * 
      * @param {String} name of model
      * @return {Array} of objects
      */
     menuChildOrSibling: function(name) {
       var ctx = this;
       return (ctx._children || ctx._siblings || []).map(function(c) {
         var rec = getById(name, c);
         return rec;
       });
     },
     
     /*
      * markdown
      * 
      * convert markdown inline
      * 
      * @param {String} md
      * @param {String} html
      */
     markdown: function(md) {
       return marked(md);
     }

   };
  };
  
};