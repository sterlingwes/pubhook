var Promise = require('es6-promise').Promise
  , fs = require('fs')
  , mdyaml = require('front-matter')
  , marked = require('marked')
;

// TODO: abstract this so other file formats can be handled
var readMdFiles = function(files, done) {
  
  var promises = files.map(function(f) {
    return new Promise(function(res,rej) {
      fs.readFile(f, 'utf8', function(err,data) {
        if(err) rej(err);
        else {
          var json = mdyaml(data);
          json.name = f;
          json.body = marked( json.body );
          res( json );
        }
      });
    });
  });
  
  Promise.all(promises)
    .then(function(res) { done(null, res); })
    .catch(function(err) { done(err); });
};

module.exports = readMdFiles;