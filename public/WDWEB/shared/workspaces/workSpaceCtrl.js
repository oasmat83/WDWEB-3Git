angular.module('WDWeb').controller("workSpaceCtrl", ['$scope', '$rootScope', '$route', '$routeParams', '$timeout', '$log', '$window', '$localStorage', '$location', 'wdService', 'homeService', 'leftNavService', function ($scope, $rootScope, $route, $routeParams, $timeout, $log, $window, $localStorage, $location, wdService, homeService, leftNavService) {
    var vm = this;
    vm.message = "";
    vm.thisToggle = true;
    var expandId = function(x) {
        var id
        if (x == 1) {
            id = 3
        } else {
            id = 5
        }
        return id;
    }
    // vm.cabinet = [];
    // vm.workSpaceTitle = "";
    // vm.spinner = true;

    // $timeout(function () {
    //     angular.element(document).ready(function () {
    //         var SpinnerElements = document.querySelectorAll(".cabinetSpinner");
    //         for (var i = 0; i < SpinnerElements.length; i++) {
    //             new fabric['Spinner'](SpinnerElements[i]);
    //         }
    //     });
    // }, 1000);

    $(window).keydown(function(e){
        if ((e.ctrlKey || e.metaKey) && e.keyCode === 70) {
            e.preventDefault();
        }
    });

    $scope.$on("closeAllPanel", function (event, data) {
        vm.showWksPanel = false;
    });

    $scope.$on("workSpacePanel", function(event, data) {
        if (vm.showWksPanel) {
            $rootScope.$broadcast('workspaceEvent', data);
        };
    });


    $scope.$on("workspaceEvent", function (event, data) {
        // vm.showWksPanel = data.show;
        vm.workSpaceTitle = data.data.Text;
        vm.spinner = false;
        vm.wdListId = data.listId;

        if (data.data.Flags == 0) {
            vm.spinner = true;
            vm.message = "No folders found!";
            vm.workSpaces = [];
            return false;
        }


        leftNavService.getChild(data.listId, data.data["Rec#"], expandId(data.data.Flags)).then(function(res) {
            var childResponse = res.data.root;
            if (childResponse.Header.ErrorCount != "") {
                vm.showWksPanel = false;
                vm.CheckError(childResponse.Header);
                vm.spinner = true;
                return false;
            }
            vm.showWksPanel = data.show;

            angular.forEach(childResponse.items, function (item, index) {
                vm.message = "";
                item.nodes = [[{"dummy": "node"}]];
            });

            vm.spinner = true;
            vm.workSpaces = childResponse.items;
            vm.message = "";
        }, function(error) {
            var data = { fileAction: false };
                $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
        });

    });

    vm.setSelectMenu = function(x) {
        vm.setFmSelect = x;
    }

    vm.CheckError = function(x) {
        if (x.wd_Error_RCTX == "WDRC_LISTID_INVALID") {
            $rootScope.$broadcast("wdErrorList", {text: "Your Workspace list expired, please refresh."});
            return false
        }
    }

    vm.getChild = function (x, y, z) {
        vm.setFmSelect = x;
        var getExpand;
        if (x.Flags == 0) {
            return false
        }

        y.thisToggle = y.thisToggle = !y.thisToggle;
        
        if (y.thisToggle) {
            getExpand = 3
        } else {
            getExpand = 5
        }
        
        leftNavService.getChild(vm.wdListId, x["Rec#"], getExpand).then(function(res) {
            var folderlist = res.data.root;
            if (folderlist.Header.ErrorCount != "") {
                var data = { fileAction: false };
                $rootScope.$broadcast("errorAction", {visible: true, rctx: folderlist.Header.wd_Error_RCTX, data: data});
                return false;
            }
            x.nodes = folderlist.items;
        }, function(error) {
            var data = { fileAction: false };
                $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
        });

        y.$parent.toggle();
    }

    vm.closeCabinet = function () {
        vm.showWksPanel = false;
        // angular.forEach($localStorage.wdWorkSpaceID, function(key, index) {
        //     if (index !== 0 ) {
        //         wdService.clearListfromParm(key).then(function(res) {
        //             $localStorage.wdWorkSpaceID.splice(index, 1);
        //         });
        //     }
        // });
    }

    $scope.scrollWk = {
        scrollByContent: true,
        scrollByThumb: true, 
        showScrollbar: "always",
        useNative: true,
        height: function() {
            return window.innerHeight - 150;
        }    
    }

    $scope.setHeight = function() {
        return window.innerHeight - 150;
    }


    vm.showFiles = function (x) {
        $location.path('/home').search({listId: $localStorage.wdWorkSpaceID, recId: x["Rec#"], flagId: 0, typeid: "workspaces"});
        vm.closeCabinet();
    }

}])

    .directive('workMenu', function ($document, $rootScope) {
        return {
            templateUrl: './WDWEB/shared/workspaces/workMenu.html',
            link: function (scope, el, attr) {
                $document.on('click', function (e) {
                    if (el !== e.target && !el[0].contains(e.target)) {
                        // scope.$apply(function () {
                        // });
                    }
                });
            }
        }
    });