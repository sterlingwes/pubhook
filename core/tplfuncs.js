module.exports = function(data, vars) {
 
 return {
   get: function(name) {
     return data[name];
   },
   
   getAppScript: function(ref) {
     var script = vars['app:link:'+ref.toLowerCase()] || 'SCRIPT_NOT_FOUND';
     return '<script src="/scripts/'+script+'.js"></script>';
   }

 };
};