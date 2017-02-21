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
app.filter('propsFilter', function() {
  return function(items, props) {
    var out = [];

    if (angular.isArray(items)) {
      items.forEach(function(item) {
        var itemMatches = false;

        var keys = Object.keys(props);
        for (var i = 0; i < keys.length; i++) {
          var prop = keys[i];
          var text = props[prop].toLowerCase();
          if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
            itemMatches = true;
            break;
          }
        }

        if (itemMatches) {
          out.push(item);
        }
      });
    } else {
      // Let the output be the input untouched
      out = items;
    }

    return out;
  };
});

app.controller('UsersCtrl', main);

function main($scope, $http, $timeout){
  args.scope = $scope;
  args.http = $http;
  initNewUserForm();

  // args.scope.users = newResource('users', newUser, postInitUsers)
  // args.scope.roles = newResource('roles', newRole, postInitRoles)
  // args.scope.roles.getAll()
  fetchRoles();
}


function initNewUserForm(){
  var user = {name: "Display Name", email: "username@tabtale.com"};
  args.scope.newUser = user;
}

function fetchRoles(){
  //loadJsonFile(args.http, 'http://localhost:8000/roles.json',initRoles);
  restGet(args.http, 'http://localhost:3000/roles',initRoles);
}

function initRoles(data){
  args.scope.roles = [];
  for  (var i=0 ; i < data.length ; i++){
    var r = data[i];
    var dict = {};
    dict.roleId = r.id;
    dict.roleName = r.name;
    args.scope.roles.push(dict);
  }

  //Continue to next methods
  // initControlButtons(args.scope);
  // initTagsControl(args.scope);
  fetchUsers();
}

function fetchUsers(){
  //loadJsonFile(args.http, 'http://localhost:8000/users.json',initUsers);
  restGet(args.http, 'http://localhost:3000/users',initUsers);
}

function initUsers(data){
  args.scope.users = data;
  // args.scope.users = [];
  // for  (var i=0 ; i < data.length ; i++){
  //   var u = data[i];
  //   var dict = {};
  //   dict.id = u.id;
  //   dict.userName = u.userName;
  //   args.scope.users.push(dict);
  // }

  for (var i=0; i< data.length ; i++){
    var u = data[i];
    u.enableUpdate = false;
    setUserColor(u);
  }

  //Continue to next methods
  initControlButtons(args.scope);
  initTagsControl(args.scope);
  initUpdateButton(args.scope);
  initAddButton(args.scope);
}

function initUpdateButton($scope){
  $scope.onUpdateUser = onUpdateUser;
  $scope.onSelect = onSelect;
}

function initAddButton($scope){
  $scope.onAddUser = function(u){
    console.log(u);
    createUser(u);
  }
}

function initTagsControl($scope){
  $scope.addPerson = function(item, model){
    // if(item.hasOwnProperty('isTag')) {
    //   delete item.isTag;
    //   $scope.roles.push(item);
    // }
  };

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


function postInitRoles(){
  args.scope.roles = roles.db;
  users.getAll();
}

function postInitUsers(){
  args.scope.users = users.db;
  initControlButtons(args.scope);
  initTagsControl(args.scope);
  initUpdateButton(args.scope);
}

function newRole(r){
  return {
    roleId: r.id,
    roleName: r.name
  };
}

function newUser(u){
  return u;
}

//-----------------------------------------------------------------------------
//Instantiate resources for users and roles
//Think of using services for this
var users = new Resource(args.domain + 'users');

//-----------------------------------------------------------------------------
//Define resource class
//Think of exporting this to a seperate module
function Resource(resUrl, newEntry, postInit){
  this.resUrl = resUrl;
  this.data = [];
  this.newEntry = newEntry;
  this.postInit = postInit;
}

Resource.prototype = {
  constructor: Resource,
  init:function(data){
    for(var i=0 ; i < data.length ; i++){
      db.push(this.newEntry(data[i]));
    }
    this.postInit();
  },
  getAll(){
    restGet(args.http,this.resUrl,this.init);
  },
  update(u){

  },
  create(u){

  }
};
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
//Wrappers for http methods
//Export to module together with the Resource class
function restGet($http, url, processResponse){
  console.log($http.defaults.headers.common['Authorization']);
  //var url = 'http://localhost:3000/roles';
  $http.get(url).then(function(response) {
    var data = response.data;
    console.log(data);
    processResponse(data);
  });
}

function restPut($http, url, data, onSuccess, onError){
  console.log($http.defaults.headers.common['Authorization']);
  $http.put(url, data).then(onSuccess, onError);
}

function restPost($http, url, data, onSuccess, onError){
  console.log($http.defaults.headers.common['Authorization']);
  $http.post(url, data).then(onSuccess, onError);
}

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
}
//-----------------------------------------------------------------------------

function updateUser(u){
  var url = 'http://localhost:3000/users/' + u.id;

  var copyOfU = {
        id: u.id,
        displayName: u.displayName,
        userName: u.userName,
        roles: u.roles
  };
  restPut(args.http,url,copyOfU,onSuccess, onError);
}

function user(u){
  return {
    displayName: u.name,
    userName: u.email,
    roles: [
      {
        roleName: "READ_ONLY",
        roleId: 2
      }
    ]
  };
}

function createUser(u){
  var url = 'http://localhost:3000/users/';
  u.privileges = undefined;

  restPost(args.http,url,user(u),onSuccess, onError);
}


function onSuccess(response){
  console.log("onSuccess: " + response);
}

function onError(response){
  console.log("onError: " + response);
}


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
  updateUser(u);
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
// 8. Use resource module for REST calls?
// 3. Add a delete / remove access button ?
// Add format validation to email
// Add alerts on on invalid input
// Add new user to users without refreshing the page from REST?
// Use module and service patterns?
// Define styles in CSS?



//Createing a CRUD app: https://www.sitepoint.com/creating-crud-app-minutes-angulars-resource/
//Another example with a REST Service Backend : http://draptik.github.io/blog/2013/07/28/restful-crud-with-angularjs/
//Create a file based REST service to manage users using json-server (npm)
//Rewrite front-end as a CRUD app

// Demo
// https://angular-ui.github.io/ui-select/demo-multiple-selection.html
