var app = angular.module('postApp', ['ngRoute', 'appControllers', 'appServices', 'appDirectives']);

var appServices = angular.module('appServices', []);
var appControllers = angular.module('appControllers', []);
var appDirectives = angular.module('appDirectives', []);

var options = {};
options.api = {};
options.api.base_url = "http://localhost:8181/api/auth";

require('./services')(appServices, options);
require('./controllers')(appControllers);
require('./directives')(appDirectives);

app.config(['$locationProvider', '$routeProvider', 
  function($location, $routeProvider) {
    $routeProvider.
        when('/', {
            template: require('raw!./partials/post.list.html'),
            controller: 'PostListCtrl'
        }).
        when('/post/:id', {
            template: require('raw!./partials/post.view.html'),
            controller: 'PostViewCtrl'
        }).
        when('/tag/:tagName', {
            template: require('raw!./partials/post.list.html'),
            controller: 'PostListTagCtrl'
        }).
        when('/admin', {
            template: require('raw!./partials/admin.post.list.html'),
            controller: 'AdminPostListCtrl',
            access: { requiredAuthentication: true }
        }).
        when('/admin/post/create', {
            template: require('raw!./partials/admin.post.create.html'),
            controller: 'AdminPostCreateCtrl',
            access: { requiredAuthentication: true }
        }).
        when('/admin/post/edit/:id', {
            template: require('raw!./partials/admin.post.edit.html'),
            controller: 'AdminPostEditCtrl',
            access: { requiredAuthentication: true }
        }).
        when('/admin/register', {
            template: require('raw!./partials/admin.register.html'),
            controller: 'AdminUserCtrl'
        }).
        when('/admin/login', {
            template: require('raw!./partials/admin.signin.html'),
            controller: 'AdminUserCtrl'
        }).
        when('/admin/logout', {
            template: require('raw!./partials/admin.logout.html'),
            controller: 'AdminUserCtrl',
            access: { requiredAuthentication: true }
        }).
        otherwise({
            redirectTo: '/'
        });
}]);


app.config(function ($httpProvider) {
    $httpProvider.interceptors.push('TokenInterceptor');
});

app.run(function($rootScope, $location, $window, AuthenticationService) {
    $rootScope.$on("$routeChangeStart", function(event, nextRoute, currentRoute) {
        //redirect only if both isAuthenticated is false and no token is set
        if (nextRoute != null && nextRoute.access != null && nextRoute.access.requiredAuthentication 
            && !AuthenticationService.isAuthenticated && !$window.sessionStorage.token) {

            $location.path("/admin/login");
        }
    });
});

module.exports = {
  app:            app,
  appServices:    appServices,
  appControllers: appControllers,
  appDirectives:  appDirectives
};