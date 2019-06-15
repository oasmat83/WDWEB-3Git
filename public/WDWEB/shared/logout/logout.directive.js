'use strict'
angular.module('WDWeb').directive('wdxLogout',[ function () {
  return {
      restrict: 'E',
      replace: true,
      templateUrl: './WDWEB/shared/logout/logout.html',
      controller: function($scope, $timeout, $localStorage, $location, wdxLogoutService, $rootScope, wdService, $sessionStorage, $window) {
            $scope.wdLogOffBtn = true;
            var DialogContainer = document.querySelector(".header-limiter");
            var Dialog = DialogContainer.querySelector(".ms-Dialog");
            var LogOut = DialogContainer.querySelector(".logOut");
            var DialogComponents = new fabric['Dialog'](Dialog);
            $scope.init = function() {
                $timeout(function() {
                    angular.element(document).ready(function(){
                        LogOut.onclick = function() {
                            DialogComponents.open();
                        }
                        DialogContainer.onclick = function(e) {
                            var convertStr = e.target.className;
                            if (convertStr.indexOf('ms-Overlay') != -1) {
                                DialogComponents.open();
                            }
                        }

                    });
                }, 0);
            }

            $scope.userDesc = function() {
                return "Logout " + $rootScope.username
            }


            //Closes the user session.
            $scope.logOff = function() {
                $scope.wdLogOffBtn = false;
                var array = [$localStorage.wdListID, $localStorage.ftListId, $localStorage.wdWorkSpaceID];
                $rootScope.$broadcast('closeAllPanel');
                angular.forEach(array, function(key, index, arr) {
                    if (key !== undefined) {
                        wdService.clearListfromParm(key).then(function(res) {
                            console.log("List Id" + key + " deleted");
                        });
                    }
                });
                
                $timeout(function() {
                    wdxLogoutService.logout().then(function(res){
                        $scope.redirect();
                    }, function(error) {
                        $scope.redirect();
                    });
                }, 1000);
            }

            $scope.redirect = function() {
                $rootScope.showElements = false;
                if ($sessionStorage.urlPara) {
                    $window.location.href = $localStorage.host + 'WDWEB?' + $localStorage.urlPara;
                    //$location.path('/login').search($sessionStorage.urlPara);
                    //$localStorage.$reset();
                } else {
                    $window.location.href = $localStorage.host + "WDWEB";
                    // $localStorage.$reset();
                    // $location.path('/login').search({});
                    // $location.url($location.path()); 
                }
                
                    
                $(".logout-module .ms-Dialog.is-open").removeClass("is-open");
                $(".logout-module .ms-Overlay.is-visible").removeClass("is-visible");
                $scope.wdLogOffBtn = true;
            }

            $scope.cancelLogOff = function() {
                DialogComponents.close();
            }
        }
  } ;
}]);
