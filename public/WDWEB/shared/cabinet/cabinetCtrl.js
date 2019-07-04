angular.module('WDWeb').controller("cabinetCtrl", ['$scope', '$rootScope', '$route', '$routeParams', '$timeout', '$log', '$window', '$localStorage', '$location', 'wdService', 'homeService', function ($scope, $rootScope, $route, $routeParams, $timeout, $log, $window, $localStorage, $location, wdService, homeService) {
    var vm = this;
    vm.cabinet = [];
    vm.cabinetTitle = "";
    vm.spinner = true;
    $scope.textValue = "";
    $scope.btnText = "Select"

    $timeout(function () {
        angular.element(document).ready(function () {
            var SpinnerElements = document.querySelectorAll(".cabinetSpinner");
            for (var i = 0; i < SpinnerElements.length; i++) {
                new fabric['Spinner'](SpinnerElements[i]);
            }
        });
    }, 1000);

    angular.element($window).bind('resize', function () {
        $("#scrollCab").dxScrollView("instance").option("height", (window.innerHeight - 190));
    });

    $scope.$on("closeAllPanel", function (event, data) {
        vm.showCabPanel = false;
    });

    $scope.$on("cabinetCheckPanel", function (event, data) {
        if(vm.showCabPanel) {
            $rootScope.$broadcast('cabinetEvent', data);
        }
    });

    $scope.$on("cabinetEvent", function (event, data) {
        vm.showCabPanel = data.show;
        vm.cabinetTitle = data.data.Desc;
        vm.spinner = false;
        vm.filterCab = "";
        var cabinetList = $("#scrollCab").dxScrollView("instance");
        cabinetList.scrollTo(0);
        if (data.show) {
            wdService.cabinetData(data.pgID).then(function (res) {
                var folderlist = res.data.root;
                if (folderlist.Header.ErrorCount != "") {
                    var data = { fileAction: false };
                    $rootScope.$broadcast("errorAction", {visible: true, rctx: folderlist.Header.wd_Error_RCTX, data: data});
                    vm.spinner = true;
                    return false;
                };
                

                if (folderlist.items == "") {
                    vm.message = "No folders found!";
                    vm.cabinet = [];
                    vm.spinner = true;
                    return false;
                }

                angular.forEach(folderlist.items, function (item, index) {
                    vm.message = "";
                    item.nodes = [{"dummy": "node"}];
                });

                vm.cabinet = folderlist.items;
                vm.spinner = true;

            }, function (err) {
                vm.spinner = true;
                var data = { fileAction: false };
                $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
            });
        }
    });

    $scope.wdFilterBox = {
        placeholder: "Filter",
        elementAttr: {
            id: "wdFilterCabinet"
        },
        onEnterKey: function(e) {
            $scope.textValue = e.event.target.value;
            $scope.checkFilterNav();
        },
        showClearButton: true
    }

    $scope.wdFilterSideBtn = {
        icon: "ms-Icon ms-Icon--Accept",
        onClick: function (e) {
            var wdFilter = $(".wdx-Body-cabinet #wdFilterCabinet").dxTextBox("instance");
            $scope.textValue = wdFilter.option("value");
            $scope.checkFilterNav();
        },
        elementAttr: {
            class: "wdFilterSideBtn"
        } 
    }

    $scope.checkFilterNav = function(){
        setTimeout(function(){
            if(vm.spinner && $("#scrollCab  li").html() == undefined){
                $('#popupNotFoundFilter').dxPopup().dxPopup("instance").show();
            }
        }, 200)
    }
    
    vm.closeCabinet = function () {
        vm.showCabPanel = false;
    }

    vm.setNodeId = function(e) {
        return "cabId" + e.rn;
    }

    vm.setIcoId = function(e) {
        return "wdIcoId" + e.rn;
    }

    vm.setSelectMenu = function(x) {
        vm.setFmSelect = x;
    }

    vm.getChild = function (x, y) {
        vm.setFmSelect = x;
        wdService.cabinetData(x.pr).then(function (res) {
            var folderlist = res.data.root;
            if (folderlist.Header.ErrorCount != "") {
                var data = { fileAction: false };
                $rootScope.$broadcast("errorAction", {visible: true, rctx: folderlist.Header.wd_Error_RCTX, data: data});
                angular.element('#cabId' + x.rn).css("visibility", "hidden");
                return false;
            }
            if (folderlist.items == "") {
                folderlist.items = [{"dummy": "node"}];
                // angular.element('#cabId' + x.rn).css("visibility", "hidden");
                return false;
            }
            x.nodes = folderlist.items;


        }, function (err) {
            var data = { fileAction: false };
            $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
        });
        y.$parent.toggle();
    }

    vm.showFiles = function (x, y, n) {
        n.btnText = "Go To";
        if($(window).width()<=1024){
            $rootScope.$emit("openMenuFMC", {});
        }

        if (x.nodes == undefined) {
            x.nodes = [];
        }

        
        if((x.nodes.length >= 1 && !y) || x.nodes.length === 0) {
            $rootScope.$broadcast('cabinetEvent', {show: false, data: "", pgID: ""});
            vm.goToUrl(x);
            if($(window).width()<=1024){
                $rootScope.$emit("openMenuFMC", {});
            }
            return false;
        }

        $timeout(function() {
            angular.element('#cabId' + x.rn).triggerHandler('click');
        }, 0);
        
    }
    
    vm.showNodes = function(x) {
        console.log(x);
    }

    vm.goToUrl = function(x) {
        var locUrl = $location.search();
        $localStorage.isOpeningDocPanel = false;
        if (locUrl.query !== x.pr) {
            $location.path('/home').search({query: x.pr});
            return false;
        }
        $route.reload();
    }

    $scope.scrollCab = {
        scrollByContent: true,
        scrollByThumb: true, 
        showScrollbar: "always",
        useNative: true,
        height: function() {
            return window.innerHeight - 190;
        }   
    }

    $scope.setHeight = function() {
        return window.innerHeight - 190;
    }

}]).directive('cabMenu', function ($document, $rootScope) {
        return {
            templateUrl: './WDWEB/shared/cabinet/cabinetMenu.html',
            link: function (scope, el, attr) {
                $document.on('click', function (e) {
                    if (el !== e.target && !el[0].contains(e.target)) {
                        // scope.$apply(function () {
                        // });
                    }
                });
            }
        }
}).directive('getSibling', function () {
    return {
        scope: true,
        link: function(scope,element,attrs){
           scope.clicked = function () {
              element.siblings('div').removeClass('clicked');
              element.addClass('clicked');
           }
        }
     }
});