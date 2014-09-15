var cwd = process.cwd()
  , _ = require('lodash')
  , webpackConfigDefaults = require('./webpack-defaults.js')

  , sandbox = require('enhanced-require')(module, _.extend({
      recursive:  true,
      cache:  false
    }, webpackConfigDefaults));

var React = require('react')
  , ReactDescriptor = require('react/lib/ReactDescriptor')
  , reactMount = require('./tools/mount-react')
  , _ = require('lodash')
;

module.exports = function(ref, data) {
  var component = sandbox( cwd + '/apps/'+ref+'/entry.js' );
  var html = React.renderComponentToString( component(data || {}) )
  ;
  
  return html;
};