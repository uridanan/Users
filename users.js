//users.js
'use strict';

//-----------------------------------------------------------------------------
//EXtend Resource behavior, use as a service to ensure single instance
function userService(RestService){

  var setUserColor = function(u){
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
  };

  this.newEntry = function(u){
    u.enableUpdate = false;
    setUserColor(u);
    return u;
  };

  this.onAddUser = function(u){
    console.log(u);
    this.users.create(new User(u));
    //this.users.db.push(this.newEntry(u));
  };

  this.onUpdateUser = function(u){
    console.log(u);
    u.enableUpdate = false;
    setUserColor(u);
    this.users.update(new User(u));
  };

  this.onSelect = function(u){
    u.enableUpdate=true;
    setUserColor(u);
  };

  this.setNext = function(next){
    this.users.postInit = next;
  };

  this.init = function(next, domain){
    var url = domain + 'users';
    this.users = new Resource(RestService, url, this.newEntry, next);
  };

}

//-----------------------------------------------------------------------------
//User class
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

User.prototype = {
  constructor: User
}
//-----------------------------------------------------------------------------
