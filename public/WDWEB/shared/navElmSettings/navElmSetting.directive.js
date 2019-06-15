'use strict'
angular.module('WDWeb').directive('wdxElmSettings', ['homeService', '$location', '$rootScope', '$localStorage', 'wdService', 'leftNavService', function (homeService, $location, $rootScope, $localStorage, wdService, leftNavService) {
    return {
        restrict: 'A',
        replace: true,
        scope: {
            type: '='
        },
        templateUrl: './WDWEB/shared/navElmSettings/subElmSetting.html',
        link: function (scope, element, attr) {
            scope.checkBoxSettingNav = scope.$parent.checkBoxSettingNav;
            scope.upItemMenu = scope.$parent.upItemMenu;
            scope.downItemMenu = scope.$parent.downItemMenu;
        }
    };
}]);