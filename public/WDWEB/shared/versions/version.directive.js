'use strict'
angular.module('WDWeb').directive('wdxVersions',[ function () {
  return {
      restrict: 'E',
      replace: true,
      templateUrl: './WDWEB/shared/versions/version.html'
  };
}]);
