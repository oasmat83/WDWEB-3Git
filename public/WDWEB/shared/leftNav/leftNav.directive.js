'use strict'
angular.module('WDWeb').directive('wdxLeftMenu',[ function () {
  return {
      restrict: 'A',
      replace: true,
      templateUrl: './WDWEB/shared/leftNav/leftNav.html',
      link: function(scope, element, attr) {}
  };
}]);
