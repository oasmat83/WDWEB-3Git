'use strict';
angular.module('WDWeb').directive('topMenu',[ function () {
    return {
        restrict: 'A',
        replace: true,
        templateUrl: './WDWEB/shared/topNav/header.html',
        controller: function($scope, $localStorage, $log, $route, $window, wdService, $rootScope, $location, fileListUI) {
            $scope.wdShowNavIco = "ms-Icon ms-Icon--DoubleChevronLeft";
            $scope.softPop = true;
            $scope.softProject = true;
            $scope.softDirectAccess = true;
            $scope.softNewTab = true;
            $rootScope.initialDocuments = false;
            $scope.dwnIco;
            $scope.dwnTxt; 
            var getQuery = $location.search();
            var userAgent = $window.navigator.userAgent;
            // $scope.getRights = $localStorage.userRights;
            $scope.$on("updateToolbar", function(evt, data) {
                console.log("jdklafj");
                $scope.$apply()
            });

            if (userAgent.indexOf('Frowser') != -1) {
                $scope.softPop = false;
                $scope.softProject = false;
                $scope.softNewTab = false;
                $scope.showChkOut = false;
                if (getQuery.attach) {
                    $scope.dwnIco = "ms-Icon ms-Icon--Attach";
                    $scope.dwnTxt = "Attach";
                } else {
                    $scope.dwnIco = "ms-Icon ms-Icon--OpenFile";
                    $scope.dwnTxt = "Open";
                }
            } else {
                $scope.showChkOut = true;
                $scope.dwnIco = "ms-Icon ms-Icon--Download";
                $scope.dwnTxt = "Download"
            }
            if(window != top){
                $scope.initialDocuments = true;
                $scope.softProject = false;
                $scope.softNewTab = false;
                $scope.softDirectAccess = false;
            }

            $scope.menu =  [
                {
                    name: "INITIAL DOCUMENTS",
                    onClick: function(e) {
                        $location.path('/home').search({query: localStorage.iframeQuery});
                        $route.reload();
                    },
                    visible: $scope.initialDocuments
                },
                { 
                    name: "ADVANCED SEARCH",
                    onClick: function(e) {
                        $rootScope.checkDetailForm = true;
                        $rootScope.$broadcast('openPanel', {'panel': e.itemData.name});
                    }
                 },
                { 
                    name: "DIRECT ACCESS",
                    onClick: function(e) {
                        $rootScope.checkDetailForm = true;
                        $rootScope.$broadcast('openPanel', {'panel': e.itemData.name});
                    },
                    elementAttr: {
                        id: "directBtn"
                    },
                    //visible: $localStorage.userRights !== undefined ? $localStorage.userRights['Direct Access'] : false
                    visible: $scope.softDirectAccess
                },
                { 
                    name: "UPLOAD",
                    onClick: function(e) {
                        $rootScope.checkDetailForm = true;
                        $rootScope.$broadcast('openPanel', {'panel': e.itemData.name});
                    },
                    visible: $scope.softPop
                    
                 },
                { 
                    name: "PROJECT",
                    onClick: function(e) {
                        var openWdl = $("#wdlUpload").dxFileUploader("instance");
                        openWdl._isCustomClickEvent = true;
                        openWdl._$fileInput.click();
                    },
                    //visible: $scope.softPop
                    visible: $scope.softProject
                },
                { 
                    name: "NEW TAB", 
                    icon: "ms-Icon ms-Icon--CircleAddition",
                    onClick: function(e) {
                        $rootScope.$broadcast('openPanel', {'panel': e.itemData.name});
                    },
                    //visible: $scope.softPop
                    visible: $scope.softNewTab
                }
            ];
            $scope.wdMenuOptions = {
                bindingOptions: {
                    items: "menu"
                },
                displayExpr: "name",
                orientation: "horizontal",
                height: 44
            }

            $scope.openMenu = {
                bindingOptions: {
                    icon: "wdShowNavIco"
                },
                text: "",
                elementAttr: {
                    class: "openCloseBtn"
                },
                onClick: function(e) {
                    $rootScope.leftMenuAction = !$rootScope.leftMenuAction;
                    if ($rootScope.leftMenuAction) {
                        $scope.wdShowNavIco = "ms-Icon ms-Icon--DoubleChevronLeft";
                    } else {
                        $scope.wdShowNavIco = "ms-Icon ms-Icon--DoubleChevronRight "
                    }

                    $rootScope.$broadcast('setLeftSize');
                }
            }

            $scope.fileActionToolbar = {
                adaptivityEnabled:true,
                bindingOptions: {
                    deep: true,
                    dataSource: "toolBarData"
                },
                height: "40px",
                onContentReady : function(e) {
                    // var getLeftNavWidth = $("#leftNav").dxResizable("instance");
                    var getLeftNavWidth = $("#leftNav").width();
                    // alert(getLeftNavWidth);
                    // if (getLeftNavWidth == 0) {
                    //     $("#actionBtnList").css("left", 200);
                    // } else {
                    //     $("#actionBtnList").css("left", getLeftNavWidth);
                    // }
                    setTimeout(function(){ e.component._windowResizeCallBack(); }, 4000);
                },
                elementAttr: {
                    id: "actionToolbar"
                }
            }

            $scope.toolBarData = [
                {
                    location: 'before',
                    widget: 'dxButton',
                    locateInMenu: 'auto',
                    //visible: $rootScope.getRights.Download,
                    options: {
                        bindingOptions: {
                            icon: "dwnIco",
                            text: "dwnTxt",
                        },
                        elementAttr: { id: "wdOpenFile"},
                        onClick: function(e) {
                            wdService.isFileHasChanged().then(function (hasChanged) {
                                var changedData = hasChanged.res;
                                if (changedData.Header.ErrorCount !== "") {
                                    var data = { title: $scope.dwnTxt, fileAction: true, action: "DownloadDocument, wdInfo", desc: hasChanged.fileData.Description, doc: hasChanged.fileData.DocId };
                                    $rootScope.$broadcast("errorAction", {visible: true, rctx: changedData.Header.wd_Error_RCTX, data: data});
                                    return false
                                } 
                                if(hasChanged.confirm){
                                    $rootScope.$broadcast('showMessageWhenFileChanged', {title:'Download', desc:hasChanged.res.items[0].Description, docid:hasChanged.res.items[0].DocId});
                                    $rootScope.$broadcast('setConfirmHashChanged', {fnc:function(){
                                        $('#popupFileChangedOptions').dxPopup().dxPopup("instance").hide();
                                        $rootScope.$broadcast("fileAction", { type: "download" });
                                        $(this).off();
                                    }});
                                }else{
                                    $rootScope.$broadcast("fileAction", { type: "download" });
                                }
                            })
                        }
                    }
                },
                {
                    location: 'before',
                    widget: 'dxButton',
                    options: {
                        icon: 'ms-Icon ms-Icon--Refresh',
                        text: 'Refresh',
                        onClick: function(e) {
                            $rootScope.$broadcast("fileAction", { type: "reFresh"});
                        }
                    }
                },
                {
                    location: 'before',
                    widget: 'dxButton',
                    options: {
                        icon: 'ms-Icon ms-Icon--PageCheckedOut',
                        text: 'Check-Out',
                        elementAttr: { id: "wdChkOut"},
                        onClick: function(e) {
                            wdService.isFileHasChanged().then(function (hasChanged) {
                                var changedData = hasChanged.res;
                                if (changedData.Header.ErrorCount !== "") {
                                    var data = { title: 'Check-Out', fileAction: true, action: "DownloadDocument, wdInfo", desc: hasChanged.fileData.Description, doc: hasChanged.fileData.DocId };
                                    $rootScope.$broadcast("errorAction", {visible: true, rctx: changedData.Header.wd_Error_RCTX, data: data});
                                    return false
                                } 

                                if(hasChanged.confirm){
                                    $rootScope.$broadcast('showMessageWhenFileChanged', {title:'Check-Out', desc:hasChanged.res.items[0].Description, docid:hasChanged.res.items[0].DocId});
                                    $rootScope.$broadcast('setConfirmHashChanged', {fnc:function(){
                                        $rootScope.$broadcast("fileAction", { type: "checkOut", data: e });
                                        $('#popupFileChangedOptions').dxPopup().dxPopup("instance").hide();
                                        $(this).off();
                                    }});
                                }else{
                                    $rootScope.$broadcast("fileAction", { type: "checkOut", data: e });
                                }
                            })
                        }
                    },
                    visible: $scope.showChkOut
                    
                },
                {
                    location: 'before',
                    widget: 'dxButton',
                    locateInMenu: 'auto',
                    options: {
                        icon: 'ms-Icon ms-Icon--Edit',
                        text: 'Edit Metadata',
                        elementAttr: { id: "wdEditProfile"},
                        onClick: function(vm) {
                            wdService.isFileHasChanged().then(function (hasChanged) {
                                var changedData = hasChanged.res;
                                if (changedData.Header.ErrorCount !== "") {
                                    var data = { title: 'Edit Metadata', fileAction: true, action: "DownloadDocument, wdInfo", desc: hasChanged.fileData.Description, doc: hasChanged.fileData.DocId };
                                    $rootScope.$broadcast("errorAction", {visible: true, rctx: changedData.Header.wd_Error_RCTX, data: data});
                                    return false
                                } 

                                if(hasChanged.confirm){
                                    $rootScope.$broadcast('showMessageWhenFileChanged', {title:'Edit Metadata', desc:hasChanged.res.items[0].Description, docid:hasChanged.res.items[0].DocId});
                                    $rootScope.$broadcast('setConfirmHashChanged', {fnc:function(){
                                        $rootScope.$broadcast("fileAction", { type: "editProfile", data: vm, meta: hasChanged.res, profile: "Edit"});
                                        $('#popupFileChangedOptions').dxPopup().dxPopup("instance").hide();
                                        $(this).off();
                                    }});
                                }else{
                                    $rootScope.$broadcast("fileAction", { type: "editProfile", data: vm, meta: hasChanged.res, profile: "Edit"});
                                }
                            })
                
                        }
                    }
                },
                {
                    location: 'before',
                    widget: 'dxButton',
                    locateInMenu: 'auto',
                    options: {
                        icon: 'ms-Icon ms-Icon--Copy',
                        text: 'Copy',
                        elementAttr: { id: "wdCopyProfile"},
                        onClick: function(vm) {
                            wdService.isFileHasChanged().then(function (hasChanged) {
                                var changedData = hasChanged.res;
                                if (changedData.Header.ErrorCount !== "") {
                                    var data = { title: "Copy", fileAction: true, action: "DownloadDocument, wdInfo", desc: hasChanged.fileData.Description, doc: hasChanged.fileData.DocId };
                                    $rootScope.$broadcast("errorAction", {visible: true, rctx: changedData.Header.wd_Error_RCTX, data: data});
                                    return false
                                } 
                                if(hasChanged.confirm){
                                    $rootScope.$broadcast('showMessageWhenFileChanged', {title:'Copy', desc:hasChanged.res.items[0].Description, docid:hasChanged.res.items[0].DocId});
                                    $rootScope.$broadcast('setConfirmHashChanged', {fnc:function(){
                                        $rootScope.$broadcast("fileAction", { type: "editProfile", data: vm, meta: hasChanged.res, profile: "Copy"});
                                        $('#popupFileChangedOptions').dxPopup().dxPopup("instance").hide();
                                        $(this).off();
                                    }});
                                }else{
                                    $rootScope.$broadcast("fileAction", { type: "editProfile", data: vm, meta: hasChanged.res, profile: "Copy"});
                                }
                            })
                            
                        }
                    }
                },
                // {
                //     location: 'before',
                //     widget: 'dxButton',
                //     locateInMenu: 'auto',
                //     options: {
                //         icon: 'ms-Icon ms-Icon--Mail',
                //         text: 'Email',
                //         elementAttr: { id: "wdEmail"},
                //         onClick: function(vm) {
                //             wdService.isFileHasChanged().then(function (hasChanged) {
                //                 if(hasChanged.confirm){
                //                     $rootScope.$broadcast('showMessageWhenFileChanged', {title:'Email', desc:hasChanged.res[0].Description, docid:hasChanged.res[0].DocId});
                //                     $rootScope.$broadcast('setConfirmHashChanged', {fnc:function(){
                //                         $rootScope.$broadcast("fileAction", { type: "eMail", data: vm, meta: hasChanged.res, profile: "Email"});
                //                         $('#popupFileChangedOptions').dxPopup().dxPopup("instance").hide();
                //                         $(this).off();
                //                     }});
                //                 }else{
                //                     $rootScope.$broadcast("fileAction", { type: "eMail", data: vm, meta: hasChanged.res, profile: "Email"});
                //                 }
                //             })
                //         }
                //     }
                // },
                {
                    location: 'before',
                    widget: 'dxButton',
                    locateInMenu: 'auto',
                    options: {
                        icon: 'ms-Icon ms-Icon--EntryView',
                        text: 'View',
                        elementAttr: { id: "wdViewFile"},
                        onClick: function(e) {
                            wdService.isFileHasChanged().then(function (hasChanged) {
                                var changedData = hasChanged.res;
                                if (changedData.Header.ErrorCount !== "") {
                                    var data = { title: "View", fileAction: true, action: "DownloadDocument, wdInfo", desc: hasChanged.fileData.Description, doc: hasChanged.fileData.DocId };
                                    $rootScope.$broadcast("errorAction", {visible: true, rctx: changedData.Header.wd_Error_RCTX, data: data});
                                    return false
                                } 
                                if(hasChanged.confirm){
                                    $rootScope.$broadcast('showMessageWhenFileChanged', {title:'View', desc:hasChanged.res.items[0].Description, docid:hasChanged.res.items[0].DocId});
                                    $rootScope.$broadcast('setConfirmHashChanged', {fnc:function(){
                                        $rootScope.$broadcast("fileAction", { type: "view", data: e });
                                        $('#popupFileChangedOptions').dxPopup().dxPopup("instance").hide();
                                        $(this).off();
                                    }});
                                }else{
                                    $rootScope.$broadcast("fileAction", { type: "view", data: e });
                                }
                            })
                        }
                    }
                }
            ];
        }
    };
}]);
