'use strict';

var global = {
  domain: 'http://localhost:3000/'
}

var app = angular.module('UsersApp', ['ngSanitize', 'ui.select']);

//-----------------------------------------------------------------------------
// Make sure AngularJS calls our WCF Service as a "GET", rather than as an "OPTION"
app.config(['$httpProvider', function ($httpProvider) {
    //$httpProvider.defaults.headers.common = {};
    //$httpProvider.defaults.headers.post = {};
    //$httpProvider.defaults.headers.put = {};
    //$httpProvider.defaults.headers.patch = {};
    //$httpProvider.defaults.useXDomain = true;
    //delete $httpProvider.defaults.headers.common['X-Requested-With'];
    //$httpProvider.defaults.headers.common['Access-Control-Allow-Origin'] = '*';

    //Login info for TT
    //$httpProvider.defaults.headers.common['Authorization'] = 'Basic YWxtOnR0MTIzNA==';
}]);

//-----------------------------------------------------------------------------
//Filter for the UI select elements
app.filter('propsFilter', getUISelectFilter);

//-----------------------------------------------------------------------------
//Encapsulate REST calls functionality in a service
app.service('RestService',restService);

//-----------------------------------------------------------------------------
//Encapsulate Users functionality in a service
app.service('UserService',['RestService',userService]);

//-----------------------------------------------------------------------------
//Encapsulate Roles functionality in a service
app.service('RoleService',['RestService',roleService]);

//-----------------------------------------------------------------------------
//Directive for ng-repeat and supporting methods
app.directive('myUserRow', addUserRow);

//-----------------------------------------------------------------------------
//Controller
app.controller('UsersCtrl', main);


//-----------------------------------------------------------------------------

//TODO
// Add format validation to email
// Display error popups
// Define styles in CSS?
// Disable scope if user != admin/urid
// Add a delete / remove access button ?
// Use ngResource instead of my own REST implementation
//https://www.sitepoint.com/creating-crud-app-minutes-angulars-resource/


//Use json-server (npm) to create a file based REST service to manage users

//Other options
//Another example with a REST Service Backend : http://draptik.github.io/blog/2013/07/28/restful-crud-with-angularjs/
