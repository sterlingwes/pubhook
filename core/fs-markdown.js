var Promise = require('es6-promise').Promise
  , glob = require('glob')
  , cwd = process.cwd()
  , fs = require('fs')
  , mdyaml = require('front-matter')
  , marked = require('marked')
  , _ = require('lodash')
  , slug = require('uslug')
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

          // TODO: more efficient use of iteration & lookups. Need a hashmap of sorts
        
          // do any special md processing here (like adding children to their parents)
          var fnames = _.map(_.pluck(res,'_id'), function(fn, i) {
              var shrunk = slug(fn.replace(cwd+'/'+(m.source ? m.source.replace(/^[\/\.]+/,'') : 'markdown') + '/','').replace(/\.md$/,''), {allowedChars: '_-/'});
              res[i]._id = shrunk;
              return shrunk;
            })
            , hasChildren = {}
            , hasSiblings = {}
            , parents = {};
        
          // determine which files have children
          fnames.forEach(function(fname,i) {
            
            hasChildren[fname] = _.filter(fnames, function(name) {
              return name.indexOf(fname)===0 && fname.length < name.length;
            });
            
            // add those chillins to the parent tracker
            hasChildren[fname].forEach(function(child) {
              parents[child] = fname;
            });
          });
        
          // add children as necessary
          res = res.map(function(f,i) {
            var children = hasChildren[f._id];
            if(children.length) {
              f._children = children;
            }
            if(parents[f._id]) {
              f._parent = parents[f._id];
              if(f._parent)
                f._siblings = hasChildren[f._parent];
            }
            return f;
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