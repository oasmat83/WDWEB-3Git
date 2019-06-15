'use strict'
angular.module('WDWeb').controller("versionCtrl",
['$scope', '$timeout', '$log', '$route', 'uxService', 'profileService', 'wdService', '$rootScope', '$localStorage',
function ($scope, $timeout, $log, $route, uxService, profileService, wdService, $rootScope, $localStorage) {
    var vm = this;

    $scope.versionList = [];
    
    window.onresize = function() {
        $("#dxVerList").dxList("instance").option("height", (vm.getHeight()));
    }

    // $scope.$watch(function() { return uxService.getVersion() }, function(newValue, oldValue) {
    //     vm.showVersion = false;
    //     vm.getVerList(newValue);
    // });

    vm.init = function() {
        if ($scope.listOptions[0].Version != "") {
            wdService.getVersion($scope.listOptions[0]).then(function(res){
                var version = res.data.root;
                if (version.Header.ErrorCount != "") {
                    return false;
                }
                //vm.showVersion = true;
                uxService.setVersion(version);
            }, function(error){
            });
        }
    }

    // vm.verLoader = {
    //     shadingColor: "rgba(0,0,0,10)",
    //     position: { of: "#fileVersions" },
    //     bindingOptions: {
    //         visible: "loadingVisible"
    //     },
    //     onInitialized: function(){
    //         console.log('loader');
    //     }
    // }
    
    vm.setVersionList = {
        bindingOptions: {
            dataSource: "versionList"
        },
        itemTemplate: "vers",
        height: function() {
            return vm.getHeight();
        },
        useNativeScrolling: true
    }

    vm.getHeight = function() {
        return window.innerHeight - 210;
    }

    vm.getVerList = function(e) {
        if (e.length == 0) {
            $scope.versionList = [];
        } else {
            $scope.versionList = e;
        }
        $timeout(function() {
            vm.showVersion = true;
        }, 1000);
        vm.closeList();
        
    }

    vm.closeList = function() {
        if($localStorage.verId) {
            wdService.clearListfromParm($localStorage.verId).then(function(res) {
            }, function(err) {
            })
            return false
        }
        $localStorage.verId = uxService.getVersionId();
    }

    vm.getTypeLogo = function (type) {
        switch (type) {
            case 'DOCX' :
            case 'DOC' :
            case 'DOTX' :
            case 'ODT' :
                return "<span class='ms-BrandIcon--icon16 ms-BrandIcon--word'></span>";
                break;
            case 'CSV' :
            case 'ODS' :
            case 'XLS' :
            case 'XLSX' :
            case 'XLTX' :
                return "<span class='ms-BrandIcon--icon16 ms-BrandIcon--excel'></span>";
                break;
            case 'MSG' :
                return "<span class='ms-BrandIcon--icon16 ms-BrandIcon--outlook'></span>";
                break;
            case 'ODP' :
            case 'POTX' :
            case 'PPSX' :
            case 'PPTX' :
            case 'ODP' :
            case 'POT' :
            case 'PPS' :
            case 'PPT' :
                return "<span class='ms-BrandIcon--icon16 ms-BrandIcon--powerpoint'></span>";
                break;
            case 'PDF' :
                return "<span class='ms-BrandIcon--icon16 ms-BrandIcon--pdf'></span>";
                break;
            case 'JPG' :
            case 'PNG' :
            case 'GIF' :
            case 'JPEG' :
            case 'TIFF' :
                return "<span class='ms-BrandIcon--icon16 ms-BrandIcon--image'></span>";
                break;
            default:
                return "<span class='ms-BrandIcon--icon16 ms-BrandIcon--filler'></span>";
        }
    }

    // vm.getPreview = function (x) {
    //     $scope.$parent.$parent.$parent.selectedTab = "View";
    //     $rootScope.tabTypeFlag = false;
    //     $scope.$parent.$parent.$parent.$parent.$parent.filePage(x);
    // }

    
    
}]);