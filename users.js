//users.js
'use strict';

//-----------------------------------------------------------------------------
//EXtend Resource behavior, use as a service to ensure single instance
function userService(RestService){
  var domain = 'http://localhost:3000/';
  this.next = postInitUsers;
  this.url = domain + 'users';

  this.setUserColor = function(u){
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

  this.newUser = function(u){
    u.enableUpdate = false;
    setUserColor(u);
    return u;
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

  this.users = new Resource(RestService, this.url, this.newUser, this.next);

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

// function onUpdateUser(u){
//   console.log(u);
//   u.enableUpdate = false;
//   setUserColor(u);
//   args.scope.myusers.update(new User(u));
// }

// function onSelect(u){
//   u.enableUpdate=true;
//   setUserColor(u);
// }


  // function setUserColor(u){
  //   //Move myStyles to CSS?
  //   var myStyles = {
  //     uptodate:{'background-color':'white'},
  //     pending:{'background-color':'#64d0f4'},
  //     noaccess:{'background-color':'grey'}
  //   };
  //
  //   if(u.enableUpdate==true){
  //     u.userStyle=myStyles.pending;
  //   }
  //   else if (u.roles.length==1 && u.roles[0].roleName=="NO_ACCESS") {
  //     u.userStyle=myStyles.noaccess;
  //   }
  //   else{
  //     u.userStyle=myStyles.uptodate;
  //   }
  // }


// function newUser(u){
//   u.enableUpdate = false;
//   setUserColor(u);
//   return u;
// }
