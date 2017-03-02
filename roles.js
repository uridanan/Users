//roles.js
'use strict';

//-----------------------------------------------------------------------------
//EXtend Resource behavior, use as a service to ensure single instance
function roleService(RestService){

  this.newEntry = function(r){
    return {
      roleId: r.id,
      roleName: r.name
    };
  };

  this.setNext = function(next){
    this.roles.postInit = next;
  };

  this.init = function(next, domain){
    var url = domain + 'roles';
    this.roles = new Resource(RestService, url, this.newEntry, next);
  };

}

//-----------------------------------------------------------------------------
