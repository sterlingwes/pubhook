/*
 * Basic auth endpoints here
 */
module.exports = function(app) {

  var jwt = require('express-jwt')
    , tokenManager = require('./blog/config/token_manager')
    , secret = require('./blog/config/secret')
  ;
  
  //Routes
  var routes = {};
  routes.posts = require('./blog/route/posts.js');
  routes.users = require('./blog/route/users.js');
  routes.rss = require('./blog/route/rss.js');

  app.all('*', function(req, res, next) {
    res.set('Access-Control-Allow-Origin', 'http://localhost');
    res.set('Access-Control-Allow-Credentials', true);
    res.set('Access-Control-Allow-Methods', 'GET, POST, DELETE, PUT');
    res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Authorization');
    if ('OPTIONS' == req.method) return res.send(200);
    next();
  });

  //Get all published post
  app.get('/post', routes.posts.list);

  //Get all posts
  app.get('/post/all', jwt({secret: secret.secretToken}), tokenManager.verifyToken, routes.posts.listAll);

  //Get the post id
  app.get('/post/:id', routes.posts.read); 

  //Like the post id
  app.post('/post/like', routes.posts.like);

  //Unlike the post id
  app.post('/post/unlike', routes.posts.unlike);

  //Get posts by tag
  app.get('/tag/:tagName', routes.posts.listByTag); 

  //Create a new user
  app.post('/user/register', routes.users.register); 

  //Login
  app.post('/user/signin', routes.users.signin); 

  //Logout
  app.get('/user/logout', jwt({secret: secret.secretToken}), routes.users.logout); 

  //Create a new post
  app.post('/post', jwt({secret: secret.secretToken}), tokenManager.verifyToken , routes.posts.create); 

  //Edit the post id
  app.put('/post', jwt({secret: secret.secretToken}), tokenManager.verifyToken, routes.posts.update); 

  //Delete the post id
  app.delete('/post/:id', jwt({secret: secret.secretToken}), tokenManager.verifyToken, routes.posts.delete); 

  //Serve the rss feed
  app.get('/rss', routes.rss.index);
  
  return app;
  
};