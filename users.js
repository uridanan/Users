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
  fetchRoles();
}

function fetchRoles(){
  loadJsonFile(args.http, 'http://localhost:8000/roles.json',initRoles);
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
  loadJsonFile(args.http, 'http://localhost:8000/users.json',initUsers);
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


//TODO
// 1. Tweak the UI
// 2. Add a save / update button
// 3. Add a delete / remove access button ?
