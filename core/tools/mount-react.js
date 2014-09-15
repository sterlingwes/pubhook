var React = require('react/lib/React')
  , ReactDescriptor = require('react/lib/ReactDescriptor')
;

/*
 * mount-react
 * 
 * helps mount a react component by ensuring its type is able to be rendered by React
 * 
 * @param {Function} component required
 * @param {String} windowExport whether to export to window in client side usage
 * @return {Function} wrapped or pass-thru req
 */
module.exports = function(component, windowExport) {
  
  var isClient = typeof window === 'object';
  
  /* passthru for now until type checking is necessary
  if(typeof component === 'function' && !ReactDescriptor.isValidDescriptor(component)) {
    if(!isClient) console.log('- -- trying to wrap non-ReactComponent passed to renderer');
    component = React.createClass({ render: function() { return React.DOM.div({}, component); } });
  }*/
  
  if(windowExport && isClient)
    window['ph-app-' + windowExport] = component;
  
  return component;
};