//rest.js

'use strict';

function restService($http){

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

}
