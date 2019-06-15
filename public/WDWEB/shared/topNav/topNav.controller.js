angular.module('WDWeb').controller("topNavCtrl", ["$scope", "$rootScope", "wdService", "$location", "$route", "homeService", "loginService", "$timeout", "$localStorage",  "$sce", "$cookies", "$sessionStorage", "$window", function($scope, $rootScope, wdService, $location, $route, homeService, loginService, $timeout, $localStorage, $sce, $cookies, $sessionStorage, $window){
    $rootScope.setBody = false;
    $rootScope.revVersion = $sce.trustAsResourceUrl("1.8");
    $scope.$on("navEvent", function() {
        $rootScope.showElements = wdService.showNav;
        $rootScope.userName = "";
        $rootScope.chkRoute = $location.path();
    });
    $rootScope.loaded = false;
    $rootScope.$on('$viewContentLoaded', function(){
        if($rootScope.checkIframe()){
            if(!localStorage.iframeQuery){
                $rootScope.loaded = false;
            }
            $("#leftNav").css("width",'0px');
            $("#actionBtnList").css("left",'0px');
            $rootScope.appWidth = 'calc(100%)';
            $rootScope.appMax = 'calc(100%)';
            $("#leftNav").dxResizable("instance").option("width", 0)
        }else{
            $rootScope.loaded = true;
        }
    });
    $rootScope.checkIframe = function(){
        if(window != top){
            return true;
        }
        return false;
    }
    $scope.$watch(function(){
        return $localStorage.userData;
    }, function(newVal, oldVal) {
        if (newVal == undefined && $location.path() !== "/login") {
            var bdy = $( "body" ).hasClass( "ng-pageslide-body-open" );
            if (bdy) {
                $( "body" ).removeClass( "ng-pageslide-body-open" )
            }

            if ($sessionStorage.urlPara) {
                // $location.path('/login').search($sessionStorage.urlPara);
                window.open($localStorage.host + "/WDWEB?" + $localStorage.urlPara, "_self");
                delete $sessionStorage.urlPara;
            } else {
                // $window.location.href = "../WDWEB" + location.search;
                $location.path('/login').search();
            }
            
        }
    });

    $scope.gohome = function() {
        if(window != top){
            $location.path('/home').search({query: localStorage.iframeQuery});
            $route.reload();
        }else{
            $location.path('/landing').search({});
        }
    }
}]);
