'use strict'
angular.module('WDWeb').directive('wdxFilterList',[ function () {
  return {
      restrict: 'A',
      replace: true,
      scope: {
          data: '=',
          message: '='
      },
      templateUrl: './WDWEB/shared/filterList/filterList.html',
      link: function(scope, element, attr) {
        attr.on('load', function(event){
            console.log('afjlkajflkasjfl;a');
        });
      }
  };
}]);
