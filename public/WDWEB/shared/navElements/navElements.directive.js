'use strict'
angular.module('WDWeb').directive('wdxNavElements', ['homeService', '$location', '$rootScope', '$localStorage', 'wdService', 'leftNavService', '$route', '$timeout', function (homeService, $location, $rootScope, $localStorage, wdService, leftNavService, $route, $timeout) {
    return {
        restrict: 'A',
        replace: true,
        scope: {
            type: '='
        },
        templateUrl: './WDWEB/shared/navElements/subMenu.html',
        link: function (scope, element, attr) {
            scope.bmkMessage = scope.$parent.bmkMessage;
            scope.favMMessage = scope.$parent.favMMessage;
            scope.wkMessage = scope.$parent.wkMessage;
            scope.ffMessage = scope.$parent.ffMessage;
            scope.ttlLeftMenu = ' ';

            scope.$on("setAnchor", function (event, data) {
                scope.selected = data.data;
            });

            scope.$on("wdErrorList", function(event, data) {
                scope.wkMessage = data.text;
            });

            scope.leftMenuView = {
                scrollByContent: true,
                scrollByThumb: true,
                showScrollbar: "always",
                useNative: true
            };

            scope.wdFilterBox = {
                placeholder: "Filter",
                elementAttr: {
                    id: "wdFilterCabinet"
                },
                onEnterKey: function (e) {
                    scope.textValue = e.event.target.value;
                    scope.checkFilterNav();
                },
                showClearButton: true
            };

            scope.wdFilterSideBtn = {
                icon: "ms-Icon ms-Icon--Accept",
                onClick: function (e) {
                    let section = e.element[0].parentElement.children[1].id.split('_')[1];
                    var wdFilter = $("#wdFilterCabinet_" + section).dxTextBox("instance");
                    scope.textValue = wdFilter.option("value");
                    scope.checkFilterNav();
                },
                elementAttr: {
                    class: "wdFilterSideBtn"
                }
            };

            scope.checkFilterNav = function(){
                setTimeout(function(){
                    switch (scope.$parent.$parent.selectedTab) {
                        case 'cabinets':
                            if(scope.$parent.$parent.spinners.cabinets && $("#dxScrollCabinates .subMenu.list li").html() == undefined){
                                $('#popupNotFoundFilter').dxPopup().dxPopup("instance").show();
                            }
                            break;
                        case 'matters':
                            if(scope.$parent.$parent.spinners.matters && $("#dxScrollFavMatters .subMenu.list li").html() == undefined){
                                $('#popupNotFoundFilter').dxPopup().dxPopup("instance").show();
                            }
                            break;
                        case 'favorites':
                            if(scope.$parent.$parent.spinners.favorites && $("#dxScrollFavorites .subMenu.list li").html() == undefined){
                                $('#popupNotFoundFilter').dxPopup().dxPopup("instance").show();
                            }
                            break;
                        case 'workspaces':
                            if(scope.$parent.$parent.spinners.workspaces && $("#dxScrollWorkspaces .subMenu.list li").html() == undefined){
                                $('#popupNotFoundFilter').dxPopup().dxPopup("instance").show();
                            }
                            break;
                        case 'bookmark':
                            if(scope.$parent.$parent.spinners.bookmarks && $("#dxScrollBookmarks .subMenu.list li").html() == undefined){
                                $('#popupNotFoundFilter').dxPopup().dxPopup("instance").show();
                            }
                            break;
                    }
                }, 500)
            }

            scope.selectMenu = function (x, y, z) {
                scope.selected = x;
                var getLeftNavWidth;
                if (y === "fm") {
                    getLeftNavWidth = $("#leftNav").dxResizable("instance");
                    $("#wdFavMatterPanel").css("left", getLeftNavWidth.option("width"));
                    $rootScope.$broadcast('favMatterCheckPanel', { li: x, items: scope.$parent.favMatters });
                } else if (y === "wk") {
                    getLeftNavWidth = $("#leftNav").dxResizable("instance");
                    $("#wdWorkspacePanel").css("left", getLeftNavWidth.option("width"));
                    $localStorage.wdNavlIst = {
                        wdlist: z,
                        rec: x["Rec#"]
                    };
                    $rootScope.$broadcast('workSpacePanel', { show: true, data: x, listId: z });
                } else {
                    getLeftNavWidth = $("#leftNav").dxResizable("instance");
                    $("#wdCabinetPanel").css("left", getLeftNavWidth.option("width"));
                    $rootScope.$broadcast('cabinetCheckPanel', { show: true, data: x, pgID: encodeURIComponent(x.basepath) });
                }
            };

            scope.setListId = function (x, y) {
                return y + x;
            };

            scope.listPreLoader = {
                width: 16,
                height: 16,
                visible: false
            };

            scope.setSelected = function (x) {
                scope.selected = x;
            };

            scope.goTo = function (x, y, z, xn) {

                angular.forEach(xn, function (key, index) {
                    var wdListLoader = $("#" + y + index).dxLoadIndicator("instance");
                    if (index === z) {
                        wdListLoader.option('visible', true);
                    }
                    else {
                        //wdListLoader.option('visible', false);
                    }
                });

                scope.setUrl(x, $("#" + y + z).dxLoadIndicator("instance"), y);

                if ($(window).width() <= 1024) {
                    $rootScope.leftMenuAction = !$rootScope.leftMenuAction;
                    scope.$parent.$parent.selectedTab = "";
                }


                switch (y) {
                    case 'bm':
                        scope.$parent.bkMarks = '';
                        break;
                    case 'fm':
                        scope.$parent.matters = '';
                        break;
                    case 'ws':
                        scope.$parent.wkSpaces = '';
                        break;
                    case 'ff':
                        scope.$parent.fav = '';
                        break;
                    default:
                        console.log("data");
                }
            };

            scope.setUrl = function (x, y, z) {
                // if (z == 'bm' && x.type == "WDAPI_GBL_FLAG_FINDEDIT"){
                    // $rootScope.searchEdit = true;
                    $rootScope.bmTemplateData = x; 
                    // $rootScope.$broadcast("openSearchPanel");
                    // y.option('visible', false);
                // } else {
                    $rootScope.$broadcast('setWDGridLoader');
                    var locUrl = $location.search();
                    $localStorage.isOpeningDocPanel = false;
                    $timeout(function () {
                        if (locUrl.query !== x.Loc) {
                            $location.path('/home').search({ query: x.Loc });
                        } else {
                            $route.reload();
                        }

                        y.option('visible', false);

                    }, 1000);
                // }
            };

            scope.isActive = function (x) {
                return scope.selected === x;
            };

            scope.getCabinet = function (x) {
                $(".wdx-Body-cabinet #wdFilterCabinet").dxTextBox("instance").option("value", "");
                $('.wdx-Body-cabinet .wdFilterSideBtn')[0].click();

                var getLeftNavWidth = $("#leftNav").dxResizable("instance");
                scope.selected = x;
                $("#wdCabinetPanel").css("left", getLeftNavWidth.option("width"));
                $rootScope.$broadcast('cabinetEvent', { show: true, data: x, pgID: encodeURIComponent(x.basepath) });
            };

            scope.getMenuFavMatters = function (x) {
                var getLeftNavWidth = $("#leftNav").dxResizable("instance");
                scope.selected = x;
                $("#wdFavMatterPanel").css("left", getLeftNavWidth.option("width"));
                $rootScope.$broadcast('favMattersEvent', { li: x, items: scope.$parent.favMatters });
                $rootScope.$broadcast('clearFilterFavMatter');
            };

            scope.getWorkSpace = function (x, y) {
                var getLeftNavWidth = $("#leftNav").dxResizable("instance");
                scope.selected = x;
                $("#wdWorkspacePanel").css("left", getLeftNavWidth.option("width"));
                scope.ckListData(x, y);
            };

            scope.ckListData = function (x, y) {

                $localStorage.wdNavlIst = {
                    wdlist: y,
                    rec: x["Rec#"]
                };

                $rootScope.$broadcast('workspaceEvent', { show: true, data: x, listId: y });

            };

            scope.hoverMenuList = function(e){
                var ptnt = e.currentTarget.parentElement;
                if (ptnt.scrollWidth > ptnt.clientWidth) {
                    scope.ttlLeftMenu = 'str';
                } else {
                    scope.ttlLeftMenu = ' ';
                }
            };

            scope.checkRights = function(x) {
                var setFlag
                switch (x) {
                    case "BM":
                    setFlag = $localStorage.userRights !== undefined ? $localStorage.userRights.Bookmarks : true
                    break
                    case "PG":
                    setFlag = $localStorage.userRights !== undefined ? $localStorage.userRights.Cabinets : true
                    break
                    case "WS":
                    setFlag = $localStorage.userRights !== undefined ? $localStorage.userRights.Project : true
                    break 
                }
                return setFlag;
            }

            scope.getIco = function(e) {
                switch (e.type) {
                    case "WDAPI_GBL_FLAG_FINDEDIT":
                    return "ms-Icon--Edit";    
                    break;
                    case "WDAPI_GBL_FLAG_FINDGO":
                    return "ms-Icon--Forward";
                    break
                    case "WDAPI_GBL_FLAG_FAVFILES":
                    return "ms-Icon--FavoriteStar";
                    break
                    case "WDAPI_GBL_FLAG_FOLDER":
                    return "ms-Icon--OpenFolderHorizontal"
                    break;
                    case "WDAPI_GBL_FLAG_PROJECT":
                    return "ms-Icon--ProjectCollection"
                    break;
                    default:
                    return "ms-Icon--SingleBookmark"
                }
            }
        }
    };
}]);
