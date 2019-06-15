'use strict'
angular.module('WDWeb').directive('wdxProfile',[ function () {
  return {
      restrict: 'E',
      replace: true,
      templateUrl: './WDWEB/shared/profile/profile.html'
  };
}]);
