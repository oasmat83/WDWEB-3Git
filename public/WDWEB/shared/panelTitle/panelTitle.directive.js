'use strict'
angular.module('WDWeb').directive('fileTitleData', ['$localStorage', '$window', 'wdService', 'homeService', '$rootScope', 'fileListUI', function($localStorage, $window, wdService, homeService, $rootScope, fileListUI){
    return {
        scope: {
            doc: '=',
            name: '=',
            list: '=',
            rec: '=',
            ln: '=',
            pop: '=',
            pgid: '=',
            field1: '=',
            field2: '=',
            field3: '=',
            field4: '=',
            field5: '=',
            field6: '=',
            field7: '=',
            name1: '=',
            name2: '=',
            name3: '=',
            name4: '=',
            name5: '=',
            name6: '=',
            name7: '=',
            selectlist: '=',
            status: '=',
            owner: '=',
            desc: '=',
            comment: '='
        },
        templateUrl: './WDWEB/shared/panelTitle/panelTitle.html',
        link: function(scope, element, attr) {
            var userAgent;
            $rootScope.checkinType;
            userAgent = $window.navigator.userAgent;
            scope.dwnloadSpinner = true;
            scope.softpopFlag = 1;
            scope.multiple = false;
            scope.accept = "*";
            scope.value = [];
            scope.uploadMode = "instantly";
            var SpinnerElements = document.querySelectorAll(".ms-Spinner");
            for (var i = 0; i < SpinnerElements.length; i++) {
                new fabric['Spinner'](SpinnerElements[i]);
            }

        }
    }
}]);
