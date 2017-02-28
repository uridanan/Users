//resource.js
'use strict';

//-----------------------------------------------------------------------------
//Define resource class
//Think of exporting this to a seperate module
function Resource(RestService, resUrl, newEntry, postInit){
  this.resUrl = resUrl;
  this.db = [];
  this.newEntry = newEntry;
  this.postInit = postInit;
  this.RestService = RestService;
}

Resource.prototype = {
  constructor: Resource,
  init:function(data, param){
    //this is called as a static callback outside of the scope of the object.
    //Refer to the global instance or pass the object in the callback
    for(var i=0 ; i < data.length ; i++){
      param.db.push(param.newEntry(data[i]));
    }
    param.postInit();
  },
  callback:function(data){
    //this is called as a static callback outside of the scope of the object.
    //Refer to the global instance or pass the object in the callback
    for(var i=0 ; i < data.length ; i++){
      this.db.push(this.newEntry(data[i]));
    }
    this.postInit();
  },
  getAll:function(){
    this.RestService.get(this.resUrl,this);
  },
  update:function(entry){
    var url = this.resUrl + '/' + entry.id;
    this.RestService.put(url,entry);
  },
  create:function(entry){
    this.RestService.post(this.resUrl,entry);
  }
};
