'use strict'
angular.module('WDWeb');
landingController.$inject = ['$scope', '$http', '$localStorage', '$location', '$q', '$window', 'fileListUI', 'uxService', 'wdService', 'uploader', 'homeService', '$rootScope', '$timeout', 'leftNavService', '$cookies', 'wdxLogoutService'];
angular.module('WDWeb').controller('landingController', landingController);
function landingController($scope, $http, $localStorage, $location, $q, $window, fileListUI, uxService, wdService, uploader, homeService, $rootScope, $timeout, leftNavService, $cookies, wdxLogoutService) {
            
    var vm = this;
    var userAgent = $window.navigator.userAgent;
    var authSession = $cookies.get("wdSession");
    $scope.searchPlaceholder = "Search by Doc ID/Description";
    $rootScope.pageTitle = "Welcome to Worldox Web";
    $scope.openCats = false;
    $scope.errorDailog = false;
    $scope.wdErrorRctx = "";
    $scope.WDXHOST = $localStorage.host;
    $scope.wdFileData = "";

    vm.init = function() {
        $timeout(function() { 
            $scope.parentPanel = true;
            if (authSession !== undefined) {
                $cookies.remove("wdSession");
            }
        }, -1000);
        vm.setWdRights();
    }

    $scope.$on("openPanel", function (evt, data) {
        switch (data.panel) {
            case 'ADVANCED SEARCH' :
                $scope.templates = true; 
                $scope.getDefaultTemplate(true)
                break;
            case 'DIRECT ACCESS' :
                $scope.showDirectAccess();
                break; 
            case 'UPLOAD' : 
                $scope.showUpload();
                break;
            case 'NEW TAB' : 
                $scope.openNewTab();
                break;
        }
    });

    $scope.$on("frowserLogOff", function(e, data) {
        wdxLogoutService.logout().then(function(res) {
            $cookies.put('wdSession', 'noSession');
            $location.path('/login');
            $location.url($location.path());
        }, function(error) {
            console.log("logout failed");
        });
        // var showDialog = true,
        // wdFileData = { fileAction: false },
        // wdRTX = "LOGOFF_QUES";
        // $scope.setPopupDailog(showDialog, wdRTX, wdFileData);
    });

    $scope.setPopupDailog = function(x, y, z) {
        $scope.errorDailog = x;
        $scope.wdErrorRctx = y;
        $scope.wdFileData = z;
    }

    window.addEventListener("dragover", function(e) {
        e.preventDefault();
    }, false);
    window.addEventListener("drop", function(e) {
        e && e.preventDefault();
    }, false);

    $scope.openNewTab = function() {
        $window.open('./landing', '_blank');
    }

    $scope.softPop = false;
    if (userAgent.indexOf('Frowser') != -1) {
        $scope.softPop = true;
    }

    $scope.setPanelWidth = function() {
        if ($(window).width() <= 1280) {
            return "100%";
        } else {
            return "60%";
        }
    }
    
    $scope.getDefaultTemplate = function(x) {
        
        leftNavService.iniData('FindTemplatesList', '1').then(function(response) {
            
            var defaultTemplate = response.data.root;
            var setObj = {};

            if (defaultTemplate.Header.ErrorCount != "") {
                var data = { fileAction: false };
                $scope.setPopupDailog(true, defaultTemplate.Header.wd_Error_RCTX, data);
                return false;
            }

            angular.forEach(defaultTemplate.items, function(item, index) {
                if (item.K == "FindTemplatesTreePublic" || item.K == "FindTemplatesTreeOnlyMe" || item.K == "FindTemplatesTree" || item.K == "DefaultTab") {
                    setObj[item.K] = item.D;
                }
            });

            $scope.setTemplate(setObj, x);
        }, function(error) {
            var data = { fileAction: false };
            $scope.setPopupDailog(true, "FAILED_SERVER", data);
        });
    }

    $scope.showUpload = function() {
        $scope.uploadToggle = true;
        $scope.$broadcast ('setFavQuick');
    }

    $scope.showDirectAccess = function() {
        $scope.directAccess = true;
        $scope.$broadcast ('setDirectAccess');
    }

    $scope.setTemplate = function(item, x) {
        $scope.$broadcast('setTemplates', {"defaults": item, "type": x});
    }

    $scope.cancelPanel = function() {
        homeService.setUploadPanel(1);
        $rootScope.viewOpt = homeService.getUploadPanel();
        $scope.uploadToggle = false;
        $scope.directAccess = false;
        $scope.templates = false;
        $scope.openCats = false;
        $scope.$broadcast('closeCats', {panelupdate: false});
        $scope.$broadcast('closespinner');
    }

    $scope.parentPanel = false;
    $scope.searchBox = "";
    $scope.uploadToggle = false;
    vm.searchTypeFlag = 0;

    vm.contexualList = [
        { 
            text: "Search by Doc ID/Description",
            value: 0,
            setTo: "Default",
            onClick: function(e) {
                $scope.searchPlaceholder = e.itemData.text;
            }
        },
        { 
            text: "Search by Text",
            value: 1,
            setTo: "",
            onClick: function(e) {
                $scope.searchPlaceholder = e.itemData.text;
            }
        },
        { 
            text: "Search Doc ID/Description and Text",
            value: 2,
            setTo: "",
            onClick: function(e) {
                $scope.searchPlaceholder = e.itemData.text;
            }
        },
        { 
            text: "Search Doc ID/Description or Text",
            value: 3,
            setTo: "",
            onClick: function(e) {
                $scope.searchPlaceholder = e.itemData.text;
            }
        }
    ];

    vm.searchTxtBox = {
        elementAttr: {"id": "searchLanding"},
        bindingOptions: {
            value: "searchBox",
            placeholder: "searchPlaceholder",
        },

        width: "50%",
        onValueChanged: function(e) {
            $scope.searchBox = e.value.trim();
        },
        onKeyUp: function(e) {
            if(e.event.keyCode == 13){
                if (e.event.target.value == "") {
                    var data = { fileAction: false };
                    $scope.setPopupDailog(true, "SEARCH_REQUIRED", data);
                    return false;
                }
                vm.searchWorldox(e.event.target.value);
            }
        },
        onInitialized: function(e) {
            setTimeout(function () {
                e.component.focus();
            }, 0);
        }
    }

    vm.searchBtn = {
        icon: "ms-Icon ms-Icon--Search",
        onClick: function(e) {
            if ($scope.searchBox == "") {
                var data = { fileAction: false };
                $scope.setPopupDailog(true, "SEARCH_REQUIRED", data);
                return false;
            }
            $rootScope.searchTemplateType = false;
            vm.searchWorldox($scope.searchBox);
        }
    }

    vm.contexualMenuBtn = {
        icon: "ms-Icon ms-Icon--FabricFolderSearch",
        onClick: function() {
            $("#searchContext").dxContextMenu("toggle", true);
        }
    }
    $(".laContain").on("mouseover",function()
    {
        $(document).bind("keydown",function(e) {
            $("#searchTxtBox input").focus();
        });
    }).on("mouseout",function()
    {
        $(document).unbind("keydown");
    });

    vm.contexualMenu = {
        items: vm.contexualList,
        target: "#contextBtn",
        onItemClick: function(e) {
            angular.forEach(vm.contexualList, function(key, idx) {
                if (key.setTo == "Default") {
                    key.setTo = ""
                }
                if (key.text == e.itemData.text) {
                    key.setTo = "Default"
                }
            });
            vm.searchTypeFlag = e.itemData.value;
        },
        itemTemplate: "contextItem"
    }

    vm.searchWorldox = function(e) {
        if (vm.searchTypeFlag === 1) {
            $rootScope.title = "Text: " + e;
            $rootScope.bc = "";
            $location.path('/home').search({query: '?t ' + encodeURIComponent(e)});
        } else if (vm.searchTypeFlag === 0) {
            $location.path('/home').search({query: encodeURIComponent(e)});
        } else if (vm.searchTypeFlag === 2) {
            $location.path('/home').search({query: '?D ' + encodeURIComponent(e) + ' OR ?E ' + encodeURIComponent(e) + ' AND ?T' + encodeURIComponent(e) });
        } else {
            $location.path('/home').search({query: '?D ' + encodeURIComponent(e) + ' OR ?E ' + encodeURIComponent(e) + ' OR ?T' + encodeURIComponent(e) + " OR"});
        }
    }
    $("#landingContainer").mouseover(function(e){
        $rootScope.checkOverLanding = true;
    });
    $("#landingContainer").mouseout(function(e){
        $rootScope.checkOverLanding = false;
    });


    vm.setWdRights = function() {
        var getWdMenu = $('#wdMenuOptions').dxMenu('instance'),
        getWdItems = getWdMenu.option("items");
        angular.forEach(getWdItems, function(key, idx) {
            switch (key.name) {
                case "DIRECT ACCESS":
                    if(window != top){
                        getWdItems[idx].visible = false;
                    }else{
                        getWdItems[idx].visible = $localStorage.userRights["Direct Access"];
                    }
                break;
                case "UPLOAD":
                getWdItems[idx].visible = $localStorage.userRights.Upload;
                break;
                case "PROJECT":
                    if(window != top){
                        getWdItems[idx].visible = false;
                    }else{
                        getWdItems[idx].visible = $localStorage.userRights.Project;
                    }
                break;
                case "ADVANCED SEARCH":
                getWdItems[idx].visible = $localStorage.userRights.Search;
                break;
            }
        });
        getWdMenu.option("items", getWdItems)
    }
}