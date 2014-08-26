module.exports = function(data, vars) {
 
 return {
   get: function(name) {
     var d = data[name];
     if(d && d.items) return d.items; // if it's a database resource, don't pass the model schema
     return data[name];
   },
   
   getAppScript: function(ref) {
     var script = vars['app:link:'+ref.toLowerCase()] || 'SCRIPT_NOT_FOUND';
     return '<script src="/scripts/'+script+'.js"></script>';
   }

 };
};