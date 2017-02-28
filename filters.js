'use strict';

function filters(){

  //------------------------------------------------------------------------------
  //Define filter
  /**
   * AngularJS default filter with the following expression:
   * "person in people | filter: {name: $select.search, age: $select.search}"
   * performs a AND between 'name: $select.search' and 'age: $select.search'.
   * We want to perform a OR.
   */
  function getUISelectFilter(){
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
}

module.exports = filters;

// 
// // lib/counter.js
// export let counter = 1;
//
// export function increment() {
//   counter++;
// }
//
// export function decrement() {
//   counter--;
// }
//
//
// // src/main.js
// import * as counter from '../../counter';
//
// console.log(counter.counter); // 1
// counter.increment();
// console.log(counter.counter); // 2
