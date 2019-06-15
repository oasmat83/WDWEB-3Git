angular.module('WDWeb').controller("favmatterCtrl", ['$scope', '$rootScope', '$route', '$routeParams', '$timeout', '$log', '$window', '$localStorage', '$location', 'wdService', 'homeService', function($scope, $rootScope, $route, $routeParams, $timeout, $log, $window, $localStorage, $location, wdService, homeService) {
    var vm = this;
    vm.favmatters = [];
    vm.favMattersTitle = "";
    vm.showFavMattersPanel = false;
    vm.spinner = false;
    vm.allFavMatters = [];
    $scope.textValue = "";


    $timeout(function(){
        angular.element(document).ready(function(){
            var SpinnerElements = document.querySelectorAll(".cabinetSpinner");
            for (var i = 0; i < SpinnerElements.length; i++) {
                new fabric['Spinner'](SpinnerElements[i]);
            }
        });
    }, 1000);

    angular.element($window).bind('resize', function () {
        $("#fmContainer").dxScrollView("instance").option("height", (window.innerHeight - 191));
    });

    $scope.$on("closeAllPanel", function(event, data) {
        vm.showFavMattersPanel = false;
    })

    $scope.$on("favMattersEvent", function(event, data) {
        var li = data.li
        vm.allFavMatters = data
        vm.showFavMattersPanel = true;
        vm.favMattersTitle = li.szPGID;
        vm.spinner = true;
        vm.fmlistdata = [];
        vm.filterFm = "";
        var combine = [];
        


        var items = data.items.filter(function (item) {
            return item.szPGID == li.szPGID
        }).map(function (item) {
            item.name = item.Desc.replace(item.szPGID+'\\','')
            return item
        })

        vm.favmatters = items;
    });

    $scope.$on("favMatterCheckPanel", function(event, data) {
        if (vm.showFavMattersPanel) {
            $rootScope.$broadcast('favMattersEvent', data);
        }
    });

    $scope.wdFilterBox = {
        placeholder: "Filter",
        elementAttr: {
            id: "wdFilterFavMatter"
        },
        onEnterKey: function(e) {
            $scope.textValue = e.event.target.value;
            $scope.checkFilterNav();
        },
        showClearButton: true
    }

    $scope.$on("clearFilterFavMatter", function () {
        $("#wdFilterFavMatter").dxTextBox("instance").option('value','');
        $("#wdFilterFavMatter input").val('');
        $scope.textValue = '';
    })

    $scope.wdFilterSideBtn = {
        icon: "ms-Icon ms-Icon--Accept",
        onClick: function (e) {
            var wdFilter = $(".wdx-Body-favmatter #wdFilterFavMatter").dxTextBox("instance");
            $scope.textValue = wdFilter.option("value");
            $scope.checkFilterNav();
        },
        elementAttr: {
            class: "wdFilterSideBtn"
        } 
    }

    $scope.checkFilterNav = function(){
        setTimeout(function(){
            if($("#fmContainer  li").html() == undefined){
                $('#popupNotFoundFilter').dxPopup().dxPopup("instance").show();
            }
        }, 200)
    }
    
    $scope.scrollFM = {
        scrollByContent: true,
        scrollByThumb: true,
        showScrollbar: "always",
        useNative: true,
        height: function() {
            return window.innerHeight - 191;
        }    
    }

    $scope.setHeight = function() {
        return window.innerHeight - 191;
    }

    

    vm.closeFavmatter = function() {
        vm.showFavMattersPanel = false;
    }

    vm.setSelectMenu = function(x) {
        vm.setFmSelect = x;
    }

    vm.goTo = function (x, y) {
        if($(window).width()<=1024){
            $rootScope.$emit("openMenuFMC", {});
        }
        vm.showFavMattersPanel = false;
        vm.goToUrl(x);
        vm.setFmSelect = x;
        //$location.path('/home').search({query: x.Loc});
    }

    vm.goToUrl = function(x) {
        var locUrl = $location.search();
        $localStorage.isOpeningDocPanel = false;
        if (locUrl.query !== x.Loc) {
            $location.path('/home').search({query: x.Loc});
            return false;
        }
        $route.reload();
    }

    // $scope.filterFm = function(e) {
    //     console.log(e);
    // }
}])

.directive('favmatterMenu', function($document, $rootScope) {
    return {
        templateUrl: './WDWEB/shared/favmatter/favMatterMenu.html',
        link: function(scope, el, attr) {

            $document.on('click', function (e) {
                if (el !== e.target && !el[0].contains(e.target)) {
                    //  scope.$apply(function () {
                    // });
                 }
            });
            scope.hoverMenuList = function(e){
                scope.str = e.currentTarget.parentElement.innerText;
                var ptnt = e.currentTarget.parentElement;
                if (ptnt.scrollWidth > ptnt.clientWidth) {
                    scope.ttlLeftMenu = 'str';
                } else {
                    scope.ttlLeftMenu = ' ';
                }
            }

        }
    }
});