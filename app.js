'use strict';

var global = {
  domain: 'http://localhost:3000/'
}

var app = angular.module('UsersApp', ['ngSanitize', 'ui.select']);

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



//Createing a CRUD app: https://www.sitepoint.com/creating-crud-app-minutes-angulars-resource/
//Another example with a REST Service Backend : http://draptik.github.io/blog/2013/07/28/restful-crud-with-angularjs/
//Create a file based REST service to manage users using json-server (npm)
//Rewrite front-end as a CRUD app

// Demo
// https://angular-ui.github.io/ui-select/demo-multiple-selection.html
