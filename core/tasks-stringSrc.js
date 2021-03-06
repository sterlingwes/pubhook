var cwd = process.cwd()
  , stream = require('stream')
  , _ = require('lodash')
  , gutil = require('gulp-util')
  , sitemap = require('./models-sitemap')
  , glob = require('glob')
  , fs = require('fs')
;

// read in any templates other than /partials so we can wrap as necessary
var templatePaths = glob.sync('./templates/*.html')
  , templates = {};

templatePaths.forEach(function(path) {
  var name = path.replace(/\.\/templates\//,'')
    , tpl = fs.readFileSync(path, { encoding: 'utf8' });
  
  // TODO: need to figure out how to normalize paths, along with core/tasks hacky renaming of .dbrender~~, below.
  // this won't catch all "extends" scenarios...
  tpl = tpl.replace(/\.\.\/partials\//g, '../templates/partials/');
  
  templates[name.split('.').shift()] = tpl;
  
});

var swigWrap = function(content, item) {
  
  var titleBlock = '{% block title %}{% parent %} - '+(item.attributes ? item.attributes.title : (item.title || ''))+'{% endblock %}'
    , helpers = [];
  
  // handling this in the task streamData from models.js so it's all in one place for everything...
      //helpers.push(['ctx', JSON.stringify(item)]);
      //helpers.push(['isActiveUri', 'isActiveUriBuilder(ctx)']);
  
  var helperTags = _.map(helpers, function(help) {
    return '{% set ' + help.join(' = ') + ' %}';
  }).join("\n");
  
  if(item && templates[item.__name]) {
    var c = helperTags
          + titleBlock
          + templates[item.__name].replace(/\{\{\s+?CONTENT\s+?\}\}/,content);
    return c;
  }
  
  return '{% extends "../templates/partials/base.html" %}'
        + helperTags
        + titleBlock
        +'{% block content %}' + content + '{% endblock %}';
};

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

        var vinylFile = new gutil.File({ cwd:"", base:"", path: uri, contents: new Buffer( swigWrap(body, f) ) });
        vinylFile.data = { ctx: f };
        this.push(vinylFile);
        if(idx==(_.size(files)-1)) {
          this.push(null); // EOF needs to be last
        }
        idx++;
      }.bind(this));
    };
    return src;
};