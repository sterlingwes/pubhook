var Promise = require('es6-promise').Promise
  , glob = require('glob')
  , cwd = process.cwd()
  , fs = require('fs')
  , mdyaml = require('front-matter')
  , marked = require('marked')
  , _ = require('lodash')
;

/*
 * listFiles
 * 
 * @param {Object} m
 * @param {Function} listed callback
 */
var listFiles = function(m, listed) {
  
  var source = './' + (m.source ? m.source.replace(/^[\/\.]+/,'') : 'markdown');
  glob(source + '/**/*.md', function(err,files) {
    listed(err,files);
  });
  
};

/*
 * readMdFiles
 * 
 * @param {Array} files paths to markdown files
 * @return {Array} of promises for files to read & process, resolving to objects with name, body and YAML attributes
 */
var readMdFiles = function(files) {
  
  return files.map(function(f) {
    return new Promise(function(res,rej) {
      fs.readFile(f, 'utf8', function(err,data) {
        if(err) rej(err);
        else {
          var json = mdyaml(data);
          json._id = f;
          json.body = marked( json.body );
          res( json );
        }
      });
    });
  });

};

/*
 * adatper
 * 
 * @return {Object} promise
 */
var adapter = function(m) {
    
  return new Promise(function(yes,no) {

    listFiles(m, function(err,files) {

      if(err) return no(err);
      Promise.all(readMdFiles(files.map(function(f) { return f.replace(/^\.+/,cwd); })))
        .then(function(res) {

          // do any special md processing here (like adding children to their parents)
          var fnames = _.map(_.pluck(res,'_id'), function(fn) {
              return fn.replace(cwd+'/'+(m.source ? m.source.replace(/^[\/\.]+/,'') : 'markdown') + '/','').replace(/\.md$/,'');
            })
            , harch = {};
        
          // determine which files are children of another and track
          fnames.forEach(function(f,i) {
            res[i]._id = f;
            harch[f] = _.filter(fnames, function(ff) {
              return ff.indexOf(f)===0 && f.length < ff.length;
            });
          });
        
          // add children as necessary
          res.forEach(function(f,i) {
            var children = harch[f._id];
            if(children.length) {
              res[i].children = children;
            }
          });
          
          yes(res);

        })
        .catch(function(err) { no(err); });
    });

  });

};

module.exports = {
  
  _listFiles: listFiles,
  _readMdFiles: readMdFiles,
  
  adapter: adapter,
  
  resourceHandlers: function(m) {
    
    // TODO: probably shouldn't grab all records for all actions
    return adapter(m).then(function(res) {
      
      return {
        
        read: function(done) {
          done(null,res);
        }
        
      };
      
    }); // no need to catch, returning promise chain
    
  }
  
};