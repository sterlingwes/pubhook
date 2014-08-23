module.exports = function(data) {
 
 return {
   get: function(name) {
     return data[name];
   },
   
   getIds: function(name) {
     return Object.keys(data[name]);
   }
 };
};