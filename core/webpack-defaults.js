module.exports = {

  module: {
    loaders: [
      { test: /\.jsx$/, loader: 'jsx' },
      { test: /\.svg/, loader: 'url?limit=10000&mimetype=image/svg+xml' },
      { test: /\.ttf/, loader: 'url?limit=10000&mimetype=application/x-font-ttf' },
      { test: /\.otf/, loader: 'url?limit=10000&mimetype=application/x-font-opentype' },
      { test: /\.woff/, loader: 'url?limit=10000&mimetype=application/font-woff' },
      { test: /\.eot/, loader: 'url?limit=10000&mimetype=application/vnd.ms-fontobject' },
      { test: /\.gif/, loader: 'url?limit=10000&mimetype=image/gif' },
      { test: /\.png/, loader: 'url?limit=10000&mimetype=image/png' },
      { test: /\.less$/, loader: 'style!css!less' }
    ]
  },

  resolve: {
    modulesDirectories: ['bower_components', 'node_modules'],

    alias: {}
  }

};