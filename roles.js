//roles.js
'use strict';

//-----------------------------------------------------------------------------
//EXtend Resource behavior, use as a service to ensure single instance
function roleService(RestService){
  var domain = 'http://localhost:3000/';
  this.url = domain + 'roles';

  this.newRole = function(r){
    return {
      roleId: r.id,
      roleName: r.name
    };
  };

  this.setNext = function(next){
    this.roles.postInit = next;
  };

  this.init = function(next){
      this.roles = new Resource(RestService, this.url, this.newRole, next);
  };

}

//-----------------------------------------------------------------------------
