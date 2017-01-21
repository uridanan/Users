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
  //  $scope.roles = [
  //    {name: 'GUEST', id: '1'},
  //    {name: 'ADMIN', id: '2'},
  //    {name: 'DEV', id: '3'},
  //    {name: 'QA', id: '4'}
  //  ];
}

function initRoles(data){
  args.scope.roles = [];
  for  (var i=0 ; i < data.length ; i++){
    var r = data[i];
    var dict = {};
    dict.id = r.id;
    dict.name = r.name;
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
  args.scope.users = [];
  for  (var i=0 ; i < data.length ; i++){
    var u = data[i];
    var dict = {};
    dict.id = u.id;
    dict.name = u.name;
    args.scope.users.push(dict);
  }

  //Continue to next methods
  initControlButtons($scope);
  initTagsControl($scope);
}

function addUserRow(user){
  
}

function initTagsControl($scope){
  $scope.multipleDemo = {};
  $scope.multipleDemo.selectedPeople = [$scope.roles[0], $scope.roles[1]];

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
  $scope.searchEnabled = undefined;

  $scope.enable = function() {
    $scope.disabled = false;
  };

  $scope.disable = function() {
    $scope.disabled = true;
  };

  $scope.enableSearch = function() {
    $scope.searchEnabled = true;
  }

  $scope.disableSearch = function() {
    $scope.searchEnabled = false;
  }

  $scope.clear = function() {
    $scope.person.selected = undefined;
    $scope.address.selected = undefined;
    $scope.country.selected = undefined;
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


//TODO
//1. Load all APIs via json
//  getAllRoles
//  getAllUsers
//  getUser
//  updateUser
//2. Get all roles via REST to create list of values for the tags
