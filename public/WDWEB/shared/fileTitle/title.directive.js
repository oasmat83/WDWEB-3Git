'use strict'
angular.module('WDWeb').directive('fileTitle', ['$localStorage', '$window', 'wdService', 'homeService', '$rootScope', function($localStorage, $window, wdService, homeService, $rootScope){ 
    return {
        scope: {
            flag: "="
        },
        templateUrl: './WDWEB/shared/fileTitle/title.html',
        link: function(scope, element, attr) {
            
        }
    }
}]);