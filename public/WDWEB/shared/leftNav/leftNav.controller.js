angular.module('WDWeb').controller("leftNavCtrl",
    ['$scope', '$rootScope', '$log', '$location', 'wdService', 'homeService', 'leftNavService', '$timeout', '$localStorage',
        function ($scope, $rootScope, $log, $location, wdService, homeService, leftNavService, $timeout, $localStorage) {
            var uni = Date.now().toString(),
            uniLen = uni.slice(-4);
            $scope.cabinets = [];
            $scope.menuUpdate = "#bmkContainer";
            $scope.leftNavColumn = true;
            $rootScope.date = "Rev: 156106.1912";
            //$scope.date = "Rev: " + uni.split(uniLen)[0] + "." + uniLen;
            $scope.textValue = "";

            $scope.$on("setLeftSize", function () {
                $scope.openMenu();
            });

            $scope.checkBoxSettingNav = {
                bookmarks: {
                    value: true,
                    width: 180,
                    text: "Bookmarks"
                },
                favmatters: {
                    value: true,
                    width: 180,
                    text: "Fav Matters"
                },
                workspaces: {
                    value: true,
                    width: 180,
                    text: "Workspaces"
                },
                cabinets: {
                    value: true,
                    width: 180,
                    text: "Cabinets"
                },
                favorites: {
                    value: true,
                    width: 180,
                    text: "Favorites"
                    // onValueChanged: function(e){
                    //     alert(e.component.option('value'));
                    // }
                }
            };

            $rootScope.$watch('$root.showElements', function (x) {
                if (x) {
                    $rootScope.username = $localStorage.userData.user;
                    $rootScope.firm = $localStorage.firmName;
                    $scope.server = "Server: " + $localStorage.serverName;
                    $scope.setLeftNav();
                }
            });

            $scope.$on("closeAllPanel", function (event, data) {
                $scope.selectedTab = "";
            });


            $scope.setLeftNav = function () {
                $rootScope.leftMenuAction = true;
                homeService.checkLocalStorage();
                $scope.openedTab = [];
                $scope.spinners = {
                    "bookmarks": false,
                    "favorites": false,
                    "matters": false,
                    "cabinets": false,
                    "workspaces": false
                };
                

                leftNavService.seqIniData('VtabTree', '1').then(function (response) {
                    var data = response.data.root;
                    if (data.Header.ErrorCount !== "") {
                        var wddata = { fileAction: false };
                        $rootScope.$broadcast("errorAction", {visible: true, rctx: data.Header.wd_Error_RCTX, data: wddata});
                        $scope.setPopupDailog(true, data.Header.wd_Error_RCTX, data);
                        $scope.leftNavColumn = false;
                        return false;
                    }
                    if ($localStorage.CategoryMenu) {
                        $scope.navOrder = $localStorage.CategoryMenu;
                        $scope.leftNavColumn = false;
                    } else {
                        if (data.items == "") {
                            $scope.navOrder = ["FF", "FM", "PG", "WS", "BM", "ST"];
                            $scope.leftNavColumn = false;
                            return false
                        }
                        for (var i = 0; i < data.items.length; i++) {
                            if (data.items[i].K === "Seq") {
                                var seq = data.items[i].D.split(';');
                                for (var x = 0; x < seq.length; x++) {
                                    if (seq[x] === "MC" || seq[x] === "WF") {
                                        seq.splice(x, 1);
                                    }
                                }
                                seq.push("ST");
                                $scope.navOrder = seq;
                                $scope.leftNavColumn = false;
                                return false;
                            }
                            $scope.navOrder = ["FF", "FM", "PG", "WS", "BM", "ST"];
                            $scope.leftNavColumn = false;
                        }
                    }
                }, function (error) {
                    $scope.navOrder = ["FF", "FM", "PG", "WS", "BM", "ST"];
                    $scope.leftNavColumn = false;
                    // var data = { fileAction: false };
                    // $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
                });


                var nodeHasChildren = function (id) {
                    return $scope.cabinets.some(function (node) {
                        return node.parentId === id;
                    });
                };

                $scope.getCabinetlist = {
                    bindingOptions: {
                        items: "$parent.$parent.cabinets"
                    },
                    height: 400,
                    dataStructure: "plain",
                    displayExpr: "Desc",
                    onItemClick: function (e) {
                        $rootScope.$broadcast('cabinetEvent', { data: true });
                    }
                };

            };

            $scope.setResizable = {
                width: 200,
                minWidth: 44,
                maxWidth: 300,
                handles: "right",
                onResize: function (e) {
                    $('#leftNavOpenAdjectStyling').html('.left-nav-vert .subMenu-wrap.is-open { ' +
                        'max-height:' + ($('#leftNav').height() - (205 + $('.logo-bottom').height())).toString() + 'px !important; ' +
                        'height: ' + ($('#leftNav').height() - (205 + $('.logo-bottom').height())).toString() + 'px !important; }');

                    var checkPreview = e.model.$parent.$$childTail.wdView;

                    var getWidth = parseInt(window.innerWidth) - parseInt(e.width);
                    var getLeftNavWidth = $("#leftNav").dxResizable("instance");
                    $("#wdCabinetPanel, #wdFavMatterPanel, #wdWorkspacePanel, #actionBtnList").css("left", getLeftNavWidth.option("width"));

                    if (checkPreview) {
                        var leftNavWidth = e.width;
                        var setleftBody = parseInt(window.innerWidth) - parseInt(e.width);
                        getWidth = setleftBody - parseInt($("#homeFileMenu").css("width"));
                        //$("#appBody").css("width", setleftBody).css("maxWidth", setleftBody);
                        //$("#homedataGrid").css("width", getWidth).css("maxWidth", getWidth);
                        $rootScope.appMax = setleftBody;
                        $rootScope.appWidth = setleftBody;
                        $rootScope.gridMax = getWidth;
                        $rootScope.gridWidth = getWidth;
                    } else {
                        $rootScope.appMax = getWidth;
                        $rootScope.appWidth = getWidth;
                        $rootScope.gridMax = getWidth;
                        $rootScope.gridWidth = getWidth;
                        $("#gridContainer").css("maxWidth", getWidth);
                        //$("#appBody, #homedataGrid").css("width", getWidth).css("maxWidth", getWidth);
                    }

                    //Resize Toolbar
                    setTimeout(function () {
                        // angular.element('#homedataGrid div[dx-toolbar="fileActionToolbar"]').dxToolbar("instance")._windowResizeCallBack();
                    }, 500);
                    if (e.width === 44) {
                        $scope.selectedTab = "";
                        $rootScope.leftMenuAction = false;
                        return false;
                    }

                    $rootScope.leftMenuAction = true;
                },
                onResizeStart: function (e) {
                    e.element.find(".dx-resizable-handle-right").css("background-color", "#224e6e");
                },
                onResizeEnd: function (e) {
                    e.element.find(".dx-resizable-handle-right").removeAttr("style");
                }
            };

            $scope.leftMenuView = {
                scrollByContent: true,
                scrollByThumb: true,
                showScrollbar: "always"
            };

            $scope.openMenu = function () {
                var leftToggle = $scope.$parent.$$childTail.wdView;
                var getWidth = "";
                var setLeftWidth = "";
                // $rootScope.leftMenuAction = !$rootScope.leftMenuAction;
                $rootScope.$broadcast('cabinetEvent', { show: false, data: "", pgID: "" });
                $scope.selectedTab = "";

                if ($rootScope.leftMenuAction) {
                    setLeftWidth = 200;
                    // $("#leftNav").css("width", 200);
                    getWidth = parseInt(window.innerWidth) - parseInt(200);
                } else {
                    setLeftWidth = 44;
                    // $("#leftNav").css("width", 44);
                    getWidth = parseInt(window.innerWidth) - parseInt(44);
                }

                $scope.setBoWidth(getWidth, setLeftWidth);
            };

            $rootScope.$on("openMenuFMC", function () {
                $rootScope.leftMenuAction = false;//!$rootScope.leftMenuAction;
                $rootScope.$broadcast('cabinetEvent', { show: false, data: "", pgID: "" });
                $scope.selectedTab = "";
            });

            $scope.gohome = function () {
                $location.path('/landing').search({});
            };

            $scope.navAction = function (x) {
                $scope.fav = '';
                $scope.cabFilter = '';
                $scope.wkSpaces = '';
                $scope.fvMatter = '';
                $scope.bkMarks = '';
                var getWidth = "";
                $scope.getNavData(x);
                if ($scope.selectedTab !== x) {
                    $rootScope.$broadcast('closeAllPanel');
                }
                $scope.selectedTab = x;
                $scope.openedTab.push($scope.selectedTab);
                if (!$rootScope.leftMenuAction) {
                    var leftWidth = parseInt(window.innerWidth) - parseInt(200);
                    $scope.setBoWidth(leftWidth, 200);
                }
                $rootScope.leftMenuAction = true;
            };

            $scope.setNewHeightScroll = function (x) {
                let real_height = angular.element('#' + x).height();
                $('#' + x).dxScrollView('instance').option('height', parseInt(real_height));
            };

            $scope.setBoWidth = function (x, y) {
                var leftToggle = $scope.$parent.$$childTail.wdView;
                if (leftToggle) {
                    var setWidth = parseInt(getWidth) - parseInt($("#homeFileMenu").css("width"));
                    $("#leftNav").css("width", y);
                    $("#homedataGrid").css("width", setWidth).css("maxWidth", setWidth);
                    $("#appBody").css("width", getWidth).css("maxWidth", getWidth);
                    $rootScope.appMax = getWidth;
                    $rootScope.appWidth = getWidth;
                    $rootScope.gridMax = setWidth;
                    $rootScope.gridWidth = setWidth;
                } else {
                    $rootScope.appMax = x;
                    $rootScope.appWidth = x;
                    $rootScope.gridMax = "";
                    $rootScope.gridWidth = "";
                    $("#leftNav").css("width", y);
                    $("#appBody").css("width", x);
                    $("#gridContainer").css("maxWidth", x);
                }

            };

            $scope.showSpinner = true;

            $scope.clearOtherLists = function (shownSection) {
                switch (shownSection) {
                    case 'favorites':
                        $scope.bookmarks = [];
                        $scope.mainNavfavMatters = [];
                        $scope.cabinets = [];
                        $scope.workspaces = [];
                        break;
                    case 'bookmark':
                        $scope.favorites = [];
                        $scope.mainNavfavMatters = [];
                        $scope.cabinets = [];
                        $scope.workspaces = [];
                        break;
                    case 'matters':
                        $scope.favorites = [];
                        $scope.bookmarks = [];
                        $scope.cabinets = [];
                        $scope.workspaces = [];
                        break;
                    case 'cabinets':
                        $scope.favorites = [];
                        $scope.bookmarks = [];
                        $scope.mainNavfavMatters = [];
                        $scope.workspaces = [];
                        break;
                    case 'workspaces':
                        $scope.favorites = [];
                        $scope.bookmarks = [];
                        $scope.mainNavfavMatters = [];
                        $scope.cabinets = [];
                        break;
                }
            };

            $scope.adjustLeftNav = true;

            $scope.getNavData = function (x) {
                if ($scope.adjustLeftNav) {
                    $('#leftNavOpenAdjectStyling').html('.left-nav-vert .subMenu-wrap.is-open { ' +
                        'max-height:' + ($('#leftNav').height() - 290).toString() + 'px !important; ' +
                        //'}');
                        'height: ' + ($('#leftNav').height() - 290).toString() + 'px !important; }');
                    $scope.adjustLeftNav = false;
                }

                if (x === 'favorites') {
                    $scope.spinners.favorites = false;

                    if ($('#leftNavFilterFF #wdFilterCabinet')[0]) {
                        $('#leftNavFilterFF #wdFilterCabinet')[0].id = 'wdFilterCabinet_FF';
                    }

                    $("#wdFilterCabinet_FF").dxTextBox("instance").option("value", "");
                    $('#leftNavFilterFF .wdFilterSideBtn')[0].click();

                    leftNavService.getLeftNavItem(x).then(function (res) {

                        if (res.data.root.Header.ErrorCount !== "") {
                            $scope.ffMessage = 'Favorites failed to load!';
                            $scope.spinners.favorites = true;
                            return false;
                        }

                        if (res.data.root.Favorites === '') {
                            $scope.ffMessage = 'No Favorite files found!';
                        } else {

                            $scope.ffMessage = '';
                            if (res.data.root.Favorites.length === undefined) {
                                arr = [];
                                arr.push(res.data.root.Favorites);
                                $scope.favorites = arr;
                            } else {
                                $scope.favorites = res.data.root.Favorites;

                                $rootScope.$broadcast('setAnchor', { data: res.data.root.Favorites[0] });
                            }

                        }
                        $scope.spinners.favorites = true;
                        //$scope.setNewHeightScroll('dxScrollFavorites');
                        $scope.clearOtherLists(x);
                    }, function (err) {
                        $scope.spinners.favorites = true;
                        var data = { fileAction: false };
                        $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
                    });
                }
                else if (x === 'bookmark') {
                    $scope.spinners.bookmarks = false;

                    if ($('#leftNavFilterBM #wdFilterCabinet')[0]) {
                        $('#leftNavFilterBM #wdFilterCabinet')[0].id = 'wdFilterCabinet_BM';
                    }
                    $("#wdFilterCabinet_BM").dxTextBox("instance").option("value", "");
                    $('#leftNavFilterBM .wdFilterSideBtn')[0].click();

                    leftNavService.getLeftNavItem(x).then(function (res) {
                        if (res.data.root.Header.ErrorCount !== "") {
                            $scope.bmkMessage = 'Bookmarks failed to load!';
                            $scope.spinners.bookmarks = true;
                            return false;
                        }

                        if (res.data.root.Bookmarks === '') {
                            $scope.bmkMessage = 'No Bookmarks found!';
                        } else {
                            $scope.bmkMessage = '';
                            $scope.bookmarks = res.data.root.Bookmarks;
                            $rootScope.$broadcast('setAnchor', { data: res.data.root.Bookmarks[0] });
                        }

                        $scope.spinners.bookmarks = true;
                        //$scope.setNewHeightScroll('dxScrollBookmarks');
                        $scope.clearOtherLists(x);
                    }, function (error) {
                        $scope.spinners.bookmarks = true;
                        var data = { fileAction: false };
                        $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
                    });
                }
                else if (x === 'matters') {
                    $scope.spinners.matters = false;
                    //$scope.mainNavfavMatters = [];
                    if ($('#leftNavFilterFM #wdFilterCabinet')[0]) {
                        $('#leftNavFilterFM #wdFilterCabinet')[0].id = 'wdFilterCabinet_FM';
                    }
                    $("#wdFilterCabinet_FM").dxTextBox("instance").option("value", "");
                    $('#leftNavFilterFM .wdFilterSideBtn')[0].click();

                    leftNavService.getLeftNavItem(x).then(function (res) {
                        if (res.data.root.Header.ErrorCount !== "") {
                            $scope.favMMessage = 'Favorite Matters failed to load!';
                            $scope.spinners.matters = true;
                            $scope.mainNavfavMatters = [];
                            return false;
                        }

                        if (res.data.root.FavMatters === '') {
                            $scope.favMMessage = 'No Favorite Matters found!';
                            homeService.setMatterList(null);
                            $scope.spinners.matters = true;
                            $scope.mainNavfavMatters = [];
                        } else {

                            $scope.favMMessage = '';
                            if (res.data.root.FavMatters.length === undefined) {
                                arr = [];
                                arr.push(res.data.root.FavMatters);
                                $scope.favMatters = arr;
                                $scope.spinners.matters = true;
                                $scope.mainNavfavMatters = [];
                            } else {
                                //$scope.spinners.matters = true;
                                $scope.favMatters = res.data.root.FavMatters;
                                $scope.mainNavfavMatters = res.data.root.FavMatters.filter(function (item, pos, self) {
                                    return self.indexOf(_.find(self, function (s) {
                                        return s.szPGID === item.szPGID;
                                    })) === pos;
                                });
                                $scope.spinners.matters = true;
                                $rootScope.$broadcast('setAnchor', { data: res.data.root.FavMatters[0] });
                            }
                        }
                        $scope.clearOtherLists(x);
                    }, function (err) {
                        $scope.mainNavfavMatters = [];
                        $scope.spinners.matters = true;
                        var data = { fileAction: false };
                        $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
                    });
                }
                else if (x === 'cabinets') {
                    $scope.spinners.cabinets = false;

                    if ($('#leftNavFilterPG #wdFilterCabinet')[0]) {
                        $('#leftNavFilterPG #wdFilterCabinet')[0].id = 'wdFilterCabinet_PG';
                    }
                    $("#wdFilterCabinet_PG").dxTextBox("instance").option("value", "");
                    $('#leftNavFilterPG .wdFilterSideBtn')[0].click();

                    leftNavService.getLeftNavItem(x).then(function (res) {
                        if (res.data.root.Header.ErrorCount !== "") {
                            $scope.cabMessage = 'Cabinets failed to load!';
                            $scope.spinners.cabinets = true;
                            return false;
                        }

                        if (res.data.root.Cabinets === '') {
                            $scope.cabMessage = 'No Cabinets found!';
                        } else {
                            $scope.cabMessage = '';
                            if (res.data.root.Cabinets.length === undefined) {
                                arr = [];
                                arr.push(res.data.root.Cabinets);
                                $scope.cabinets = arr;
                            } else {
                                $scope.convertInt(res.data.root.Cabinets);
                            }
                        }
                        $scope.spinners.cabinets = true;
                        //$scope.setNewHeightScroll('dxScrollCabinates');
                        $scope.clearOtherLists(x);
                    }, function (err) {
                        $scope.spinners.cabinets = true;
                        var data = { fileAction: false };
                        $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
                    });
                } else {
                    $scope.spinners.workspaces = false;

                    if ($('#leftNavFilterWS #wdFilterCabinet')[0]) {
                        $('#leftNavFilterWS #wdFilterCabinet')[0].id = 'wdFilterCabinet_WS';
                    }
                    $("#wdFilterCabinet_WS").dxTextBox("instance").option("value", "");
                    $('#leftNavFilterWS .wdFilterSideBtn')[0].click();

                    leftNavService.workspaces(null, null, null).then(function (res) {
                        var wdWkspace = res.data.root;

                        if (wdWkspace.Header.ErrorCount !== "") {
                            $scope.wkMessage = 'Workspaces failed to load!';
                            $scope.spinners.workspaces = true;
                            return false;
                        }

                        if ($localStorage.wdWorkSpaceID) {
                            wdService.clearListfromParm($localStorage.wdWorkSpaceID).then(function (res) {
                                console.log(res);
                            }, function(err) {
                                var data = { fileAction: false };
                                $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
                            });
                        }

                        if (wdWkspace.items === '') {
                            $scope.wkMessage = 'No Workspaces found!';
                        } else {

                            $scope.wkMessage = '';
                            if (wdWkspace.items.length === undefined) {
                                arr = [];
                                arr.push(wdWkspace.items);
                                $scope.workspaces = arr;
                            } else {
                                $scope.workspaces = wdWkspace;
                                $rootScope.$broadcast('setAnchor', { data: wdWkspace.items[0] });
                            }

                        }
                        $scope.spinners.workspaces = true;
                        //$scope.setNewHeightScroll('dxScrollWorkspaces');
                        $scope.clearOtherLists(x);
                        $localStorage.wdWorkSpaceID = wdWkspace.Header.List_ID;
                    }, function (err) {
                        $scope.spinners.workspaces = true;
                        var data = { fileAction: false };
                        $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
                    });
                }
            };

            $scope.convertInt = function (x) {
                $scope.cabinets = x;
                $rootScope.$broadcast('setAnchor', { data: x[0] });
                for (var i = 0; i < x.length; i++) {
                    $scope.cabinets[i].parentId = parseInt(x[i].parentId);
                }
            };

            $scope.visiblePopup = false;

            $scope.popupTreeTabsOptions = {
                width: 280,
                height: 400,
                contentTemplate: "info",
                showTitle: true,
                title: "Configure Tree Tabs",
                closeOnOutsideClick: false,
                dragEnabled: true,
                bindingOptions: {
                    visible: "visiblePopup"
                }
            };

            $scope.showInfo = function (data) {
                $scope.currentEmployee = data.model.employee;
                $scope.visiblePopup = true;
            };
            $scope.showSettingNaveMenu = function () {
                $scope.visiblePopup = true;
                setTimeout(function () {
                    if ($localStorage.CategorySetting) {
                        $("#hdd-navOrderSetting").val($localStorage.CategorySetting.join(', '));
                        $scope.navOrderSetting = $("#hdd-navOrderSetting").val().split(", ");
                    } else {
                        $scope.navOrderSetting = ["FF", "FM", "PG", "WS", "BM"];
                    }
                }, 100);
                setTimeout(function () {
                    //console.log($("#ckc-st-favorites").dxCheckBox("instance").component);
                    if ($scope.navOrder.indexOf('FF') === -1) {
                        $("#ckc-st-favorites").dxCheckBox("instance").option('value', false);
                    } else {
                        $("#ckc-st-favorites").dxCheckBox("instance").option('value', true);
                    }

                    if ($scope.navOrder.indexOf('FM') === -1) {
                        $("#ckc-st-favmatters").dxCheckBox("instance").option('value', false);
                    } else {
                        $("#ckc-st-favmatters").dxCheckBox("instance").option('value', true);
                    }

                    if ($scope.navOrder.indexOf('PG') === -1) {
                        $("#ckc-st-cabinets").dxCheckBox("instance").option('value', false);
                    } else {
                        $("#ckc-st-cabinets").dxCheckBox("instance").option('value', true);
                    }

                    if ($scope.navOrder.indexOf('WS') === -1) {
                        $("#ckc-st-workspaces").dxCheckBox("instance").option('value', false);
                    } else {
                        $("#ckc-st-workspaces").dxCheckBox("instance").option('value', true);
                    }
                    if ($scope.navOrder.indexOf('BM') === -1) {
                        $("#ckc-st-bookmaps").dxCheckBox("instance").option('value', false);
                    } else {
                        $("#ckc-st-bookmaps").dxCheckBox("instance").option('value', true);
                    }
                }, 1000);
            };

            $scope.saveSettingNav = function () {
                $scope.visiblePopup = false;
                $scope.navOrder = [];
                for (var i = 0; i < $scope.navOrderSetting.length; i++) {
                    if ($scope.navOrderSetting[i] === 'FF' && $("#ckc-st-favorites").dxCheckBox("instance").option('value')) {
                        $scope.navOrder.push('FF');
                    }
                    if ($scope.navOrderSetting[i] === 'FM' && $("#ckc-st-favmatters").dxCheckBox("instance").option('value')) {
                        $scope.navOrder.push('FM');
                    }
                    if ($scope.navOrderSetting[i] === 'PG' && $("#ckc-st-cabinets").dxCheckBox("instance").option('value')) {
                        $scope.navOrder.push('PG');
                    }
                    if ($scope.navOrderSetting[i] === 'WS' && $("#ckc-st-workspaces").dxCheckBox("instance").option('value')) {
                        $scope.navOrder.push('WS');
                    }
                    if ($scope.navOrderSetting[i] === 'BM' && $("#ckc-st-bookmaps").dxCheckBox("instance").option('value')) {
                        $scope.navOrder.push('BM');
                    }
                }
                $scope.navOrder.push('ST');
                $localStorage.CategoryMenu = $scope.navOrder;
                $localStorage.CategorySetting = $("#hdd-navOrderSetting").val().split(", ");
            };

            $scope.upItemMenu = function (item) {
                for (var i = 0; i < $scope.navOrderSetting.length; i++) {
                    if ($scope.navOrderSetting[i] === item) {
                        var temp_sort = $scope.navOrderSetting[i - 1];
                        $scope.navOrderSetting[i - 1] = item;
                        $scope.navOrderSetting[i] = temp_sort;
                        return;
                    }
                }

            };
            $scope.downItemMenu = function (item) {
                for (var i = 0; i < $scope.navOrderSetting.length; i++) {
                    if ($scope.navOrderSetting[i] === item) {
                        var temp_sort = $scope.navOrderSetting[i + 1];
                        $scope.navOrderSetting[i + 1] = item;
                        $scope.navOrderSetting[i] = temp_sort;
                        return;
                    }

                }
            };

            //Press Ctrl + f
            $rootScope.checkOverleftNav = false;
            $rootScope.checkOverFavMat = false;
            $rootScope.checkOverCab = false;
            $rootScope.checkOverAddSear = false;
            $rootScope.checkOverDirAcc = false;
            $rootScope.checkOverUpload = false;
            $rootScope.checkOverTop = false;
            $rootScope.checkOverLanding = false;
            $rootScope.checkOverGrid = false;

            $("#leftNav").mouseover(function (e) {
                $rootScope.checkOverleftNav = true;
            });
            $("#leftNav").mouseout(function (e) {
                $rootScope.checkOverleftNav = false;
            });

            $("#wdFavMatterPanel").mouseover(function (e) {
                $rootScope.checkOverFavMat = true;
            });
            $("#wdFavMatterPanel").mouseout(function (e) {
                $rootScope.checkOverFavMat = false;
            });

            $("#wdCabinetPanel").mouseover(function (e) {
                $rootScope.checkOverCab = true;
            });
            $("#wdCabinetPanel").mouseout(function (e) {
                $rootScope.checkOverCab = false;
            });

            $("#wdxCanvasHeader").mouseover(function (e) {
                $rootScope.checkOverTop = true;
            });
            $("#wdxCanvasHeader").mouseout(function (e) {
                $rootScope.checkOverTop = false;
            });

            $(window).keydown(function (e) {
                var check_focus_input = $scope.checkFocusInput();
                if (((e.ctrlKey || e.metaKey) && e.keyCode === 70) || (e.which !== 0 && check_focus_input)) {
                    if ($rootScope.checkOverleftNav && $scope.selectedTab !== undefined) {
                        switch ($scope.selectedTab) {
                            case "favorites":
                                $("#leftNavFilterFF input").focus();
                                break;
                            case "bookmark":
                                $("#leftNavFilterBM input").focus();
                                break;
                            case "matters":
                                $("#leftNavFilterFM input").focus();
                                break;
                            case "cabinets":
                                $("#leftNavFilterPG input").focus();
                                break;
                            case "workspaces":
                                $("#leftNavFilterWS input").focus();
                                break;
                        }
                    }
                    else if ($rootScope.checkOverFavMat) {
                        $("#wdFilterFavMatter input").focus();
                    } else if ($rootScope.checkOverCab) {
                        // $("#filterCab").focus();
                        $("#wdFilterCabinet input").focus();
                    } else if ($rootScope.checkOverAddSear && !$("#popupformtest").is(":visible")) {
                        var check_focus_sub = true;
                        $("#phxTemplate form input").each(function () {
                            if ($(this).is(":focus")) {
                                check_focus_sub = false;
                            }
                        });
                        $("#phxTemplate form textarea").each(function () {
                            if ($(this).is(":focus")) {
                                check_focus_sub = false;
                            }
                        });
                        if (check_focus_sub) {
                            $("#wdFilterTemplate input").focus();
                        }
                    } else if ($rootScope.checkOverDirAcc) {
                        var check_focus_sub = true;
                        $("#formDirectAccess form input").each(function () {
                            if ($(this).is(":focus")) {
                                check_focus_sub = false;
                            }
                        });
                        $("#formDirectAccess form a").each(function () {
                            if ($(this).is(":focus")) {
                                check_focus_sub = false;
                            }
                        });
                        if (check_focus_sub && e.keyCode==70 && e.ctrlKey) {
                            $("#wdFilterDirectAccess input").focus();
                        }
                    } else if ($rootScope.checkOverUpload) {
                        var check_focus_sub = true;
                        $("#pxpUploadForm form input").each(function () {
                            if ($(this).is(":focus")) {
                                check_focus_sub = false;
                            }
                        });
                        $("#pxpUploadForm form textarea").each(function () {
                            if ($(this).is(":focus")) {
                                check_focus_sub = false;
                            }
                        });
                        if (check_focus_sub) {
                            $("#filterUpdate").focus();
                        }
                    } else if ($rootScope.checkOverTop) {
                        if ($("#gridContainer").html() !== undefined) {
                            console.log('Forcus to top');
                            $("#searchTxtInput input").focus();
                        } else {
                            $("#searchLanding input").focus();
                        }
                    } else if ($("#gridContainer").html() !== undefined) {
                        if ($rootScope.checkOverGrid) {
                            $("#gridContainer #wdFilterBox input").focus();
                        }
                    } else {
                        if ($rootScope.checkOverLanding) {
                            $("#searchLanding input").focus();
                        }
                    }
                }
            });
            $scope.checkFocusInput = function () {
                var focus = true;
                $("#leftNav input").each(function () {
                    if ($(this).is(":focus")) {
                        focus = false;
                    }
                });
                if ($("#searchLanding input").is(":focus") || $("#searchTxtInput input").is(":focus")) {
                    focus = false;
                }
                if ($("#gridContainer .dx-texteditor-input").is(":focus")) {
                    focus = false;
                }
                return focus;
            };
            $scope.popupNotFoundFilter = {
                width: 'auto',
                height: 'auto',
                maxWidth: '90vw',
                contentTemplate: "popupNotFoundFilterTemplate",
                showTitle: true,
                dragEnabled: false,
                closeOnOutsideClick: false,
                title: "Filter",
            };
            $scope.wdCancelBtnFilter = {
                text: "Cancel",
                onClick: function(e) {
                    $('#popupNotFoundFilter').dxPopup().dxPopup("instance").hide();
                },
                type: "success"
            }
        }]);
