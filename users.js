'use strict';

var app = angular.module('UsersApp', ['ngSanitize', 'ui.select']);

var args = {
  scope:  null,
  http: null
}

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

  // args.scope.users = newResource('users', newUser, postInitUsers)
  // args.scope.roles = newResource('roles', newRole, postInitRoles)
  // args.scope.roles.getAll()
  fetchRoles();

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

  //Continue to next methods
  initControlButtons(args.scope);
  initTagsControl(args.scope);
  initUpdateButton(args.scope);
}

function initUpdateButton($scope){
  $scope.onUpdateUser = function(u){
    console.log(u);
    updateUser(u)
  }
}

function initTagsControl($scope){
  $scope.addPerson = function(item, model){
    // if(item.hasOwnProperty('isTag')) {
    //   delete item.isTag;
    //   $scope.roles.push(item);
    // }
  }

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
  args.scope.roles = roles.db
  users.getAll()
}

function postInitUsers(){
  args.scope.users = users.db
  initControlButtons(args.scope);
  initTagsControl(args.scope);
  initUpdateButton(args.scope);
}

function newRole(r){
  return {
    roleId: r.id,
    roleName: r.name
  }
}

function newUser(u){
  return u
}

function newResource(type,newEntry,next){
  return{
    db: [],
    //domain: 'http://localhost:3000/',
    //resource: type,
    baseUrl: 'http://localhost:3000/' + type,
    init: function(data){
      for  (var i=0 ; i < data.length ; i++){
        db.push(newEntry(data[i]))
      }
      next()
    },
    getAll: function(){
      var url = baseUrl;
      restGet(args.http,url,init)
    }
  }
}

//   var db = []
//   var localhost = 'http://localhost:3000/'
//   var resource = type
//   var baseUrl = localhost + resource
//   function init(data){
//     for  (var i=0 ; i < data.length ; i++){
//       db.push(newEntry(data[i]))
//     }
//     next()
//   }
//   function getAll(){
//     var url = baseUrl;
//     restGet(args.http,url,init)
//   }
//   function get(id){
//     var url = baseUrl + '/' + id;
//     restGet(args.http,url,init)
//   }
//   function update(id){
//     var url = baseUrl + '/' + id;
//   }
//   function remove(id){
//     var url = baseUrl + '/' + id;
//   }
//   function create(role){
//     var url = baseUrl;
//   }
// }
function updateUser(u){
  var url = 'http://localhost:3000/users/' + u.id
  u.privileges = undefined
  restPut(args.http,url,u,onSuccess, onError)
}

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

function onSuccess(response){
  console.log("onSuccess: " + response);
}

function onError(response){
  console.log("onError: " + response);
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

app.directive('myUserRow', addUserRow);

function addUserRow(){
  return {
    replace: 'true',
    templateUrl: 'my-user-row.html'
  };
}

function onUpdateUser(u){
  console.console.log(u)
  updateUser(u)
}

//TODO
// 4. Add new User
// 1. Tweak the UI
// 3. Enable update button when data is changed
// 5. Highlight pending changes
// 6. Highlight dead users
// 7. Refactor REST call, Extract all rest calls to separate module
// 8. Use resource module for REST calls?
// 3. Add a delete / remove access button ?



//Createing a CRUD app: https://www.sitepoint.com/creating-crud-app-minutes-angulars-resource/
//Another example with a REST Service Backend : http://draptik.github.io/blog/2013/07/28/restful-crud-with-angularjs/
//Create a file based REST service to manage users using json-server (npm)
//Rewrite front-end as a CRUD app
