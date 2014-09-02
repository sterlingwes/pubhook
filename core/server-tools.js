module.exports = {
  
  /*
   * jsonHandler
   * 
   * Provides "header" meta data wrapper for api resource response
   * Adds res.toJson(err,data) using middleware
   */
  jsonHandler: function(req,res,next) {
    res.toJson = function(err,data) {
      var payload = {
        count:    _.isArray(data) ? data.length : 1,
        payload:  data
      };
      if(err) {
        payload.ok = false;
        if(typeof err === "string") {
          payload.reason = err;
        }
        else payload.reason = err.message || err.reason || err.toString();
      }
      else payload.ok = true;
      
      res.end(JSON.stringify(payload));
    };
    next();
  }
  
};