var _ = require('lodash')
;

module.exports = {
  
  /*
   * jsonHandler
   * 
   * Provides "header" meta data wrapper for api resource response
   * Adds res.toJson(err,data) using middleware
   */
  jsonHandler: function(req,res,next) {
    res.toJson = function(err,data,statusCode) {
      
      if(typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch(e) {} // soft fail, assume it should be a string
      }
      
      var payload = {
        count:    _.isArray(data) ? data.length : 1,
        payload:  data
      };
      if(err) {
        res.statusCode = 500;
        payload.ok = false;
        if(typeof err === "string") {
          payload.reason = err;
        }
        else payload.reason = err.message || err.reason || err.toString();
      }
      else {
        res.statusCode = 200;
        payload.ok = true;
      }
      
      if(statusCode) res.statusCode = statusCode;
      res.end(JSON.stringify(payload));
    };
    next();
  }
  
};