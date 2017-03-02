//controller.js
'use strict';

function main($scope, $http, $timeout,RestService,UserService,RoleService){

  var postInitUsers = function(){
    //Update scope data
    $scope.users = UserService.users.db;

    //Continue to next methods
    initTagsControl($scope);
    initUpdateButton($scope,UserService);
    initAddButton($scope,UserService);
    initNewUserForm($scope);
  }

  var postInitRoles = function(){
    $scope.roles = RoleService.roles.db;
    UserService.init(postInitUsers, global.domain);
    UserService.users.getAll();
  };

  RoleService.init(postInitRoles, global.domain);
  RoleService.roles.getAll();

}

function initNewUserForm($scope){
  var user = {displayName: "Display Name", userName: "username@tabtale.com"};
  $scope.newUser = user;
}

function initUpdateButton($scope,UserService){
  $scope.onUpdateUser = function(u){
    UserService.onUpdateUser(u);
    //location.reload();
  };
  $scope.onSelect = function(u){
    UserService.onSelect(u);
  };
}

function initAddButton($scope,UserService){
  $scope.onAddUser = function(u){
    UserService.onAddUser(u);
    location.reload();
  };
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
