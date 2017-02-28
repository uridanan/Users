'use strict';

var app = angular.module('UsersApp', ['ngSanitize', 'ui.select']);

var args = {
  scope:  null,
  http: null,
  domain: 'http://localhost:3000/'
};

/**
 * AngularJS default filter with the following expression:
 * "person in people | filter: {name: $select.search, age: $select.search}"
 * performs a AND between 'name: $select.search' and 'age: $select.search'.
 * We want to perform a OR.
 */
app.filter('propsFilter', getUISelectFilter);

//-----------------------------------------------------------------------------
//Encapsulate REST calls functionality in a service
app.service('RestService',restService);

//-----------------------------------------------------------------------------
app.controller('UsersCtrl', main);

function main($scope, $http, $timeout,RestService){
  args.scope = $scope;
  args.http = $http;


  args.scope.myusers = new Resource(RestService, args.domain + 'users', newUser, postInitUsers);
  args.scope.myroles = new Resource(RestService, args.domain + 'roles', newRole, postInitRoles);
  args.scope.myroles.getAll();
}


//------------------------------------------------------------------------------
//Init interative elements

function initNewUserForm($scope){
  var user = {displayName: "Display Name", userName: "username@tabtale.com"};
  $scope.newUser = user;
}

function initUpdateButton($scope){
  $scope.onUpdateUser = onUpdateUser;
  $scope.onSelect = onSelect;
}

function initAddButton($scope){
  $scope.onAddUser = function(u){
    console.log(u);
    args.scope.myusers.create(new User(u));
  }
}

function initTagsControl($scope){

  $scope.someGroupFn = function (item){

    if (item.name[0] >= 'A' && item.name[0] <= 'M')
        return 'From A - M';

    if (item.name[0] >= 'N' && item.name[0] <= 'Z')
        return 'From N - Z';

  };

  $scope.counter = 0;
  $scope.someFunction = function (item, model){
    $scope.counter++;
    $scope.eventResult = {item: item, model: model};
  };

  $scope.removed = function (item, model) {
    $scope.lastRemoved = {
        item: item,
        model: model
    };
  };

  $scope.tagTransform = function (newTag) {
    var item = {
        name: newTag,
        id: "0"
    };

    return item;
  };
}

function initControlButtons($scope){
  $scope.disabled = undefined;

  $scope.enable = function() {
    $scope.disabled = false;
  };

  $scope.disable = function() {
    $scope.disabled = true;
  };

}
//------------------------------------------------------------------------------


//-----------------------------------------------------------------------------
//EXtend Resource behavior for users and roles
//Think of using services for this
function User(u){
  if(u.id != undefined && u.id > 0){
    this.id = u.id;
  }
  this.displayName = u.displayName;
  this.userName = u.userName;
  if(u.roles == undefined || u.roles.length == 0){
    this.roles = [
      {
        roleName: "READ_ONLY",
        roleId: 2
      }
    ];
  }
  else{
    this.roles = u.roles;
  }
}

function newUser(u){
  u.enableUpdate = false;
  setUserColor(u);
  return u;
}

function postInitUsers(){
  //Update scope data
  args.scope.users = args.scope.myusers.db;

  //Continue to next methods
  initControlButtons(args.scope);
  initTagsControl(args.scope);
  initUpdateButton(args.scope);
  initAddButton(args.scope);
  initNewUserForm(args.scope);
}

function newRole(r){
  return {
    roleId: r.id,
    roleName: r.name
  };
}

function postInitRoles(){
  args.scope.roles = args.scope.myroles.db;
  args.scope.myusers.getAll();
}


//-----------------------------------------------------------------------------

function loadJsonFile($http, filename, processResponse){
  console.log("Load data from file: "+filename);
  $http.get(filename,
    {
        cache: false,
        transformResponse: function (data, headersGetter) {
            try {
                var jsonObject = JSON.parse(data); // verify that json is valid
                return jsonObject;
            }
            catch (e) {
                console.log("did not receive a valid Json: " + e)
            }
            return {};
        }
    }
  ).then(function(response){
      var data = response.data;
      console.log(data);
      processResponse(data);
  });

  //Example
  // function fetchUsers(){
  //   loadJsonFile(args.http, 'http://localhost:8000/users.json',initUsers);
  // }
}
//-----------------------------------------------------------------------------



//-----------------------------------------------------------------------------
//Directive for ng-repeat and supporting methods
app.directive('myUserRow', addUserRow);

function addUserRow(){
  return {
    replace: 'true',
    templateUrl: 'my-user-row.html'
  };
}

function onUpdateUser(u){
  console.log(u);
  u.enableUpdate = false;
  setUserColor(u);
  args.scope.myusers.update(new User(u));
}

function onSelect(u){
  u.enableUpdate=true;
  setUserColor(u);
}

function setUserColor(u){
  //Move myStyles to CSS?
  var myStyles = {
    uptodate:{'background-color':'white'},
    pending:{'background-color':'#64d0f4'},
    noaccess:{'background-color':'grey'}
  };

  if(u.enableUpdate==true){
    u.userStyle=myStyles.pending;
  }
  else if (u.roles.length==1 && u.roles[0].roleName=="NO_ACCESS") {
    u.userStyle=myStyles.noaccess;
  }
  else{
    u.userStyle=myStyles.uptodate;
  }
}
//-----------------------------------------------------------------------------

//TODO
// 7. Refactor REST call, Extract all rest calls to separate module
// Use factory for Resource and Services for users and roles?
// Add format validation to email
// Add alerts on on invalid input
// Add new user to users without refreshing the page from REST?
// Define styles in CSS?
// Add disable control to the add user form
// 3. Add a delete / remove access button ?



//Createing a CRUD app: https://www.sitepoint.com/creating-crud-app-minutes-angulars-resource/
//Another example with a REST Service Backend : http://draptik.github.io/blog/2013/07/28/restful-crud-with-angularjs/
//Create a file based REST service to manage users using json-server (npm)
//Rewrite front-end as a CRUD app

// Demo
// https://angular-ui.github.io/ui-select/demo-multiple-selection.html
