'use strict';

//------------------------------------------------------------------------------
//Define app module
var app = angular.module('UsersApp', ['ngSanitize', 'ui.select']);

//Get rid of this
var args = {
  scope:  null,
  http: null,
  domain: 'http://localhost:3000/'
};

//------------------------------------------------------------------------------
//Define filter

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

//-----------------------------------------------------------------------------
//Encapsulate REST calls functionality in a service
app.service('RestService',function($http){

  this.get = function(url, target){
    $http.get(url).then(function(response) {
      var data = response.data;
      console.log(data);
      target.callback(data);
    });
  };

  this.put = function(url, data){
    $http.put(url, data).then(this.onSuccess, this.onError);
  };

  this.post = function(url, data){
    $http.post(url, data).then(this.onSuccess, this.onError);
  };

  this.onSuccess = function(response){
    console.log("onSuccess: " + response);
  };

  this.onError = function(response){
    console.log("onError: " + response);
  };

});
//-----------------------------------------------------------------------------


//------------------------------------------------------------------------------
//Define a factory for Resource
app.factory('ResourceFactory',function(url, entry, next){
  //Define resource class
  //Think of exporting this to a seperate module
  function Resource(resUrl, newEntry, postInit){
    this.resUrl = resUrl;
    this.db = [];
    this.newEntry = newEntry;
    this.postInit = postInit;
  }

  //Must implement method callback(data)
  Resource.prototype = {
    constructor: Resource,
    callback:function(data){
      //Called from within RestService, where the Resource object is passed as parameter
      for(var i=0 ; i < data.length ; i++){
        this.db.push(this.newEntry(data[i]));
      }
      this.postInit();
    },
    getAll(){

      RestService.get(this.resUrl, this);
    },
    update(entry){
      var url = this.resUrl + '/' + entry.id;
      //restPut(args.http,url,entry,onSuccess,onError);
      RestService.put(url,entry);
    },
    create(entry){
      //restPost(args.http,this.resUrl,entry,onSuccess,onError);
      RestService.post(this.resUrl,entry);
    }
  };

  return new Resource(url, entry, next);

});
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
//Define services for Users and Roles
//Pass $scope as parameter or assign to scope in controller?
app.service('UserService',function(domain, postInit){
  var url = domain + 'users';
  this.users = ResourceFactory(url, this.newUser, postInit);

  this.newUser = function(u){
    u.enableUpdate = false;
    setUserColor(u);
    return u;
  };

  this.User = function(u){
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
  };

});

function onCreateUser(u){
  console.log(u);
  UserService.users.create(new User(u));
}

function onUpdateUser(u){
  console.log(u);
  u.enableUpdate = false;
  setUserColor(u);
  UserService.users.update(new User(u));
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

//------------------------------------------------------------------------------
//Define Controller
app.controller('UsersCtrl', main);

function main($scope, $http, $timeout){
  args.scope = $scope;
  args.http = $http;

  args.scope.myusers = new Resource(args.domain + 'users', newUser, postInitUsers);
  args.scope.myroles = new Resource(args.domain + 'roles', newRole, postInitRoles);
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
  $scope.onAddUser = onCreateUser;
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
//Wrappers for http methods
//Export to module together with the Resource class
function restGet($http, url, processResponse, param){
  console.log($http.defaults.headers.common['Authorization']);
  $http.get(url).then(function(response) {
    var data = response.data;
    console.log(data);
    processResponse(data, param);
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

function onSuccess(response){
  console.log("onSuccess: " + response);
}

function onError(response){
  console.log("onError: " + response);
}

// var myRest = new Rest(args.http);
//
// function Rest($http){
//   this.http = $http;
// }
//
// Rest.prototype = {
//
// };

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
