var swigWrap = function(content) {
  return '{% extends "../templates/partials/base.html" %}'
        +'{% block content %}' + content + '{% endblock %}';
}

  , cwd = process.cwd()
  , stream = require('stream')
  , _ = require('lodash')
  , gutil = require('gulp-util')
  , sitemap = require('./models-sitemap')
;

module.exports = function(files) {
    var idx = 0
      , src = stream.Readable({ objectMode: true });
    src._read = function() {
      
      _.each(files, function(f,i) {
        if(!f) return;
        var body = typeof f.body === 'function' ? f.body() : f.body

        // add cwd so swigWrap template extends correct base (needs to be two deeper than root)
        // hackish: uses tilde to force only two directories after root, and renames within gulp stream
          , uri = f.__uri && /\.md$/.test(f._id)===false ? cwd + '/.dbrender/' + f.__uri.replace(/\//g,'~') : (f._id || 'item-' + i);

        console.log('- -- ' + f.__uri || uri);
        
        // add to our sitemapping
        sitemap.set(f.__uri || uri, {
          name: f.__name,
          id: f._id,
          index: i
        });

        this.push(new gutil.File({ cwd:"", base:"", path: uri, contents: new Buffer( swigWrap(body) ) }));
        if(idx==(_.size(files)-1)) {
          this.push(null); // EOF needs to be last
        }
        idx++;
      }.bind(this));
    };
    return src;
};