'use strict'
angular.module('WDWeb').factory('fileListUI', ['uxService', 'wdService', '$window', '$location', '$route', '$localStorage', '$rootScope', 'homeService', '$http', function( uxService, wdService, $window, $location, $route, $localStorage, $rootScope, homeService, $http ) {
    var contextMenu = [];
    var categoryMenu = [];
    var removeDub = [];
    var fileCount = "";
    var fileID = {};
    var dwnContextual;
    var dwnIcoContextual;
    var fieldID = {};
    var columns = {
		"Description": "%:Xname%",
		"DocId": "%:DOCID%",
		"I": "%:wSTATUSID%",
		"DateUpdated": "%:wUPDATED%",
		"Size": "%:SIZE%",
        "Comments": "%:COMMENTS%",
        "FilePath": "%:PATHREAL%",
		"FilePathReal": "%:UNCPG_PATHFILE%",
		"Version": "%:VERSION%",
		"LN": "%:L#%",
		"RN": "%:R#%",
		"LID": "^wd_List_ID^",
        "profileGroupId": "%:wGROUP%",
        "Cabinet": "%:GROUP%",
        "Location": "%:PATH%",
        "Extension": "%:EXT%",
        "CAT_ID": "%:CATS_JSON%",
        "OW": "%:OWNERINIT%",
        "FF": "%:FAVORITE%",
        "GT": "%:EXT",
		"dwRC": "%:dwRC%",
		"szRC": "%:szRC%",
		"CHKOUT_TO_PREF": "%:CHKOUT_TO_PREF%",
		"CHKOUT_TO_NAME": "%:CHKOUT_TO_NAME%",
		"CHKOUT_ON_PREF": "%:CHKOUT_ON_PREF%",
		"CHKOUT_ON_DATE": "%:CHKOUT_ON_DATE%",
        "CHKOUT_TO_LINE": "%:CHKOUT_TO_LINE%",
        "HASH": "%:H#%",
	}
    var userAgent = $window.navigator.userAgent;
    if (userAgent.indexOf('Frowser') != -1) {
        dwnContextual = "Open";
        dwnIcoContextual = "ms-Icon ms-Icon--OpenFile";
    } else {
        dwnContextual = "Download";
        dwnIcoContextual = "ms-Icon ms-Icon--Download";
    }

    var security = [
        {
            name: "None",
            value: ""
        },
        {
            name: "Hidden",
            value: 16
        },
        {
            name: "Protected",
            value: 8
        }
    ];


    var shareMenu =  [
        {
            text: 'Add Category',
            icon: 'ms-Icon ms-Icon--Add',
            onItemClick: function(vm) {
                console.log(vm.component)
            }
 
        },
        {
            text: 'Create/Edit Categories',
            icon: 'ms-Icon ms-Icon--SaveAs',
            onItemClick: function(vm) {
                console.log(vm);
            }
        }
    ];

    function getColumns() {
        if ($localStorage.columnsView == undefined) {
            $localStorage.columnsView = columns;
            return columns;
        } else {
            return $localStorage.columnsView;
        }
    }
    

    function getSelectedCount() {
        return fileCount;
    }

    function categoryContextMenu(e, y) {

        if (e.row.data.CAT_ID == "") {
            categoryMenu = shareMenu;
        } else {
            var categorylist = [];
            var list = {};
            angular.forEach(e.row.data.CAT_ID, function(key, index) {
                list = {
                    text: key.CD,
                    icon: $rootScope.host + key.CI,
                    items: [
                        { 
                            text: 'Remove',  
                            icon: 'ms-Icon ms-Icon--Remove', 
                            onItemClick: function(vm) {
                                console.log(vm);
                            }
                        }
                    ],
    
                }
                categorylist.push(list);
            });
            
            var mergArr = categorylist.concat(shareMenu);
            categoryMenu = mergArr;
        }

        return categoryMenu;
    }

    var checkWdFileStatus = function(x) {
         if (x.CHKOUT_TO_NAME == undefined) {
             return false;
         } 
         var idx = (x.CHKOUT_TO_NAME.indexOf($localStorage.userData.user) != -1);
         return idx;
    }


    function getContextMenu(e) {

        var datalist = e.row.data;
        var selectedIndex = e.component.getSelectedRowsData();
        var wdIndex = [];
        angular.forEach(selectedIndex, function(key, index) {
            var subKeyLn = parseInt(key.LN) - 1;
            wdIndex.push(subKeyLn);
        })
        wdIndex.push(e.rowIndex);
        e.component.selectRows(e.row.key, false);
        $rootScope.$broadcast('setSelectedData', e.component.getSelectedRowsData().length);

        if ((e.row.data.stIc == '0' && e.row.data.stFl == '5') || (e.row.data.stIc == '0' && e.row.data.stFl == '3') || (e.row.data.stIc == '52' && e.row.data.stFl == '11') || (e.row.data.stIc == '51' && e.row.data.stFl == '19')) {
            contextMenu = [
                {
                    text: dwnContextual,
                    icon: dwnIcoContextual,
                    onItemClick: function(vm) {
                        wdService.isFileHasChanged().then(function (hasChanged) {
                            var changedData = hasChanged.res;
                            if (changedData.Header.ErrorCount !== "") {
                                var data = { title: dwnContextual, fileAction: true, action: "DownloadDocument, wdInfo", desc: hasChanged.fileData.Description, doc: hasChanged.fileData.DocId };
                                $rootScope.$broadcast("errorAction", {visible: true, rctx: changedData.Header.wd_Error_RCTX, data: data});
                                return false
                            } 
                            
                            if(hasChanged.confirm){
                                $rootScope.$broadcast('showMessageWhenFileChanged', {title:'Download', desc:hasChanged.res.items[0].Description, docid:hasChanged.res.items[0].DocId});
                                $rootScope.$broadcast('setConfirmHashChanged', {fnc:function(){
                                    e.component.selectRows(e.row.key, false);
                                    $rootScope.$broadcast('eventFired', { file: e.row, type: "download" });
                                    $('#popupFileChangedOptions').dxPopup().dxPopup("instance").hide();
                                    $(this).off();
                                }});
                            }else{
                                e.component.selectRows(e.row.key, false);
                                $rootScope.$broadcast('eventFired', { file: e.row, type: "download" });
                            }
                        })
                    },
                    visible: $localStorage.userRights.Download
                },
                {
                    text: "Refresh",
                    icon: "ms-Icon ms-Icon--Refresh",
                    onItemClick: function() {
                        var grid = $("#gridContainer").dxDataGrid("instance");
                        grid.refresh();
                    }
                },
                {
                    text: 'Check-Out',
                    icon: 'ms-Icon ms-Icon--PageCheckedOut',
                    onItemClick: function(vm) {
                        wdService.isFileHasChanged().then(function (hasChanged) {
                            var changedData = hasChanged.res;
                            if (changedData.Header.ErrorCount !== "") {
                                var data = { title: "Check-Out", fileAction: true, action: "DownloadDocument, wdInfo", desc: hasChanged.fileData.Description, doc: hasChanged.fileData.DocId };
                                $rootScope.$broadcast("errorAction", {visible: true, rctx: changedData.Header.wd_Error_RCTX, data: data});
                                return false
                            } 

                            if(hasChanged.confirm){
                                $rootScope.$broadcast('showMessageWhenFileChanged', {title:'Check-Out', desc:hasChanged.res.items[0].Description, docid:hasChanged.res.items[0].DocId});
                                $rootScope.$broadcast('setConfirmHashChanged', {fnc:function(){
                                    var selectChOut = e.component.getSelectedRowsData();
                                    (selectChOut.length>1)?checkoutSeveralRecords(selectChOut):checkoutRecord(e.row.data, 0);
                                    $('#popupFileChangedOptions').dxPopup().dxPopup("instance").hide();
                                    $(this).off();
                                }});
                            }else{
                                var selectChOut = e.component.getSelectedRowsData();
                                (selectChOut.length>1)?checkoutSeveralRecords(selectChOut):checkoutRecord(e.row.data, 0);
                            }
                        })
                    },
                    visible: $localStorage.userRights["Check-Out"]
                },
                {
                    text: 'Edit Metadata',
                    icon: 'ms-Icon ms-Icon--Edit',
                    onItemClick: function(vm) {
                        setProfile("Edit", "editProfile", "Profile", e, vm, 0);
                    },
                    visible: $localStorage.userRights["Edit Metadata"]
                },
                {
                    text: 'Copy',
                    icon: 'ms-Icon ms-Icon--Copy',
                    onItemClick: function(vm) {
                        setProfile("Copy", "editProfile", "Profile", e, vm, 0);
                        // e.component.selectRowsByIndexes([e.rowIndex]);
                        // homeService.setSelected(e.component.getSelectedRowsData());
                        // openPanel(e, vm, 0, 'Profile');
                        // var gridModel = getDataGridControlerScope(vm);
                        // vm.model.$parent.$parent.checked = true;
                        // $rootScope.$broadcast('editIcon', {"flag": "Copy"});
                    },
                    visible: $localStorage.userRights["Copy"]
                },
                {
                    text: "View",
                    icon: "ms-Icon ms-Icon--EntryView",
                    onItemClick: function(vm) {
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
                                    e.component.selectRows(e.row.key, false);
                                    openPanel(e, vm, 0, 'View');
                                    vm.model.$parent.$parent.wdView = true;
                                    $('#gridContainer').css("max-width", "none").css("width", "");
                                    $rootScope.$broadcast('eventFired', { file: e.row, type: "view" });
                                    setTimeout(function(){
                                        $("#listTitle").css({'max-width': "0px", "width" : "0px"});
                                        var grid = $("#gridContainer").dxDataGrid("instance");
                                        grid._windowResizeCallBack();
                                        $rootScope.setTitleHeaderWidth();
                                    }, -1)
                                    $('#popupFileChangedOptions').dxPopup().dxPopup("instance").hide();
                                    $(this).off();
                                }});
                            }else{
                                e.component.selectRows(e.row.key, false);
                                openPanel(e, vm, 0, 'View');
                                vm.model.$parent.$parent.wdView = true;
                                $('#gridContainer').css("max-width", "none").css("width", "");
                                $rootScope.$broadcast('eventFired', { file: e.row, type: "view" });
                                setTimeout(function(){
                                    $("#listTitle").css({'max-width': "0px", "width" : "0px"});
                                    var grid = $("#gridContainer").dxDataGrid("instance");
                                    grid._windowResizeCallBack();
                                    $rootScope.setTitleHeaderWidth();
                                }, -1)
                            }
                        })


                    },
                    visible: $localStorage.userRights["View"]
                },
                {
                    text: 'Move',
                    icon: 'ms-Icon ms-Icon--Move',
                    onItemClick: function(vm) {
                        setProfile("Move", "editProfile", "Profile", e, vm, 0);
                        // e.component.selectRowsByIndexes([e.rowIndex]);
                        // homeService.setSelected(e.component.getSelectedRowsData());
                        // openPanel(e, vm, 0, 'Profile');
                        // var gridModel = getDataGridControlerScope(vm);
                        // vm.model.$parent.$parent.checked = true;
                        // $rootScope.$broadcast('editIcon', {"flag": "Move"});
                    },
                    visible: $localStorage.userRights["Move"]
                },
                // {
                //     text: 'Email',
                //     icon: 'ms-Icon ms-Icon--Mail',
                //     onItemClick: function(vm) {
                //         setProfile("", "eMail", "Email", e, vm, 1);
                //         // e.component.selectRowsByIndexes([e.rowIndex]);
                //     }
                // },
                {
                    text: 'Delete',
                    icon: 'ms-Icon ms-Icon--Delete',
                    onItemClick: function(vm) {
                        wdService.isFileHasChanged().then(function (hasChanged) {
                            var changedData = hasChanged.res;
                            if (changedData.Header.ErrorCount !== "") {
                                var data = { title: "Delete", fileAction: true, action: "DownloadDocument, wdInfo", desc: hasChanged.fileData.Description, doc: hasChanged.fileData.DocId };
                                $rootScope.$broadcast("errorAction", {visible: true, rctx: changedData.Header.wd_Error_RCTX, data: data});
                                return false
                            } 

                            if(hasChanged.confirm){
                                $rootScope.$broadcast('showMessageWhenFileChanged', {title:'Delete', desc:hasChanged.res.items[0].Description, docid:hasChanged.res.items[0].DocId});
                                $rootScope.$broadcast('setConfirmHashChanged', {fnc:function(){
                                    e.component.selectRowsByIndexes([e.rowIndex]);
                                    $rootScope.$emit("openDeletePopup", e.component.getSelectedRowsData());
                                    $('#popupFileChangedOptions').dxPopup().dxPopup("instance").hide();
                                    $(this).off();
                                }});
                            }else{
                                e.component.selectRowsByIndexes([e.rowIndex]);
                                $rootScope.$emit("openDeletePopup", e.component.getSelectedRowsData());
                            }
                        })
                    },
                    visible: $localStorage.userRights["Delete"]
                }
            ];
        } 
        else if ((e.row.data.I == '0' && e.row.data.stFl == '36' && e.row.data.stIc == "0")){
            contextMenu = [
                {
                    text: dwnContextual,
                    icon: dwnIcoContextual,
                    onItemClick: function(vm) {
                        wdService.isFileHasChanged().then(function (hasChanged) {
                            var changedData = hasChanged.res;
                            if (changedData.Header.ErrorCount !== "") {
                                var data = { title: dwnContextual, fileAction: true, action: "DownloadDocument, wdInfo", desc: hasChanged.fileData.Description, doc: hasChanged.fileData.DocId };
                                $rootScope.$broadcast("errorAction", {visible: true, rctx: changedData.Header.wd_Error_RCTX, data: data});
                                return false
                            } 
                            
                            if(hasChanged.confirm){
                                $rootScope.$broadcast('showMessageWhenFileChanged', {title:'Download', desc:hasChanged.res.items[0].Description, docid:hasChanged.res.items[0].DocId});
                                $rootScope.$broadcast('setConfirmHashChanged', {fnc:function(){
                                    e.component.selectRows(e.row.key, false);
                                    $rootScope.$broadcast('eventFired', { file: e.row, type: "download" });
                                    $('#popupFileChangedOptions').dxPopup().dxPopup("instance").hide();
                                    $(this).off();
                                }});
                            }else{
                                e.component.selectRows(e.row.key, false);
                                $rootScope.$broadcast('eventFired', { file: e.row, type: "download" });
                            }
                        })
                    },
                    visible: $localStorage.userRights.Download
                },
                {
                    text: "Refresh",
                    icon: "ms-Icon ms-Icon--Refresh",
                    onItemClick: function() {
                        var grid = $("#gridContainer").dxDataGrid("instance");
                        grid.refresh();
                    }
                },
                // {
                //     text: 'Edit Metadata',
                //     icon: 'ms-Icon ms-Icon--Edit',
                //     onItemClick: function(vm) {
                //         setProfile("Edit", "editProfile", "Profile", e, vm, 0);
                //     }
                // },
                {
                    text: 'Copy',
                    icon: 'ms-Icon ms-Icon--Copy',
                    onItemClick: function(vm) {
                        setProfile("Copy", "editProfile", "Profile", e, vm, 0);
                    },
                    visible: $localStorage.userRights['Copy']
                },
                {
                    text: "View",
                    icon: "ms-Icon ms-Icon--EntryView",
                    onItemClick: function(vm) {
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
                                    e.component.selectRows(e.row.key, false);
                                    openPanel(e, vm, 0, 'View');
                                    vm.model.$parent.$parent.wdView = true;
                                    $('#gridContainer').css("max-width", "none").css("width", "");
                                    $rootScope.$broadcast('eventFired', { file: e.row, type: "view" });
                                    setTimeout(function(){
                                        $("#listTitle").css({'max-width': "0px", "width" : "0px"});
                                        var grid = $("#gridContainer").dxDataGrid("instance");
                                        grid._windowResizeCallBack();
                                        $rootScope.setTitleHeaderWidth();
                                    }, -1)
                                    $('#popupFileChangedOptions').dxPopup().dxPopup("instance").hide();
                                    $(this).off();
                                }});
                            }else{
                                e.component.selectRows(e.row.key, false);
                                openPanel(e, vm, 0, 'View');
                                vm.model.$parent.$parent.wdView = true;
                                $('#gridContainer').css("max-width", "none").css("width", "");
                                $rootScope.$broadcast('eventFired', { file: e.row, type: "view" });
                                setTimeout(function(){
                                    $("#listTitle").css({'max-width': "0px", "width" : "0px"});
                                    var grid = $("#gridContainer").dxDataGrid("instance");
                                    grid._windowResizeCallBack();
                                    $rootScope.setTitleHeaderWidth();
                                }, -1)
                            }
                        })


                    },
                    visible: $localStorage.userRights['View']
                },
                // {
                //     text: 'Move',
                //     icon: 'ms-Icon ms-Icon--Move',
                //     onItemClick: function(vm) {
                //         setProfile("Move", "editProfile", "Profile", e, vm, 0);

                //     }
                // },

                // {
                //     text: 'Delete',
                //     icon: 'ms-Icon ms-Icon--Delete',
                //     onItemClick: function(vm) {
                //         wdService.isFileHasChanged().then(function (hasChanged) {
                //             var changedData = hasChanged.res;
                //             if (changedData.Header.ErrorCount !== "") {
                //                 var data = { title: "Delete", fileAction: true, action: "DownloadDocument, wdInfo", desc: hasChanged.fileData.Description, doc: hasChanged.fileData.DocId };
                //                 $rootScope.$broadcast("errorAction", {visible: true, rctx: changedData.Header.wd_Error_RCTX, data: data});
                //                 return false
                //             } 

                //             if(hasChanged.confirm){
                //                 $rootScope.$broadcast('showMessageWhenFileChanged', {title:'Delete', desc:hasChanged.res.items[0].Description, docid:hasChanged.res.items[0].DocId});
                //                 $rootScope.$broadcast('setConfirmHashChanged', {fnc:function(){
                //                     e.component.selectRowsByIndexes([e.rowIndex]);
                //                     $rootScope.$emit("openDeletePopup", e.component.getSelectedRowsData());
                //                     $('#popupFileChangedOptions').dxPopup().dxPopup("instance").hide();
                //                     $(this).off();
                //                 }});
                //             }else{
                //                 e.component.selectRowsByIndexes([e.rowIndex]);
                //                 $rootScope.$emit("openDeletePopup", e.component.getSelectedRowsData());
                //             }
                //         })
                //     }
                // }
            ];
        }
        else if ((e.row.data.stFl == '42' ) || (e.row.data.stFl == '34' && e.row.data.stIc == "0") || (e.row.data.stFl == '50' && e.row.data.stIc == "51") || (e.row.data.stFl == '178' && e.row.data.stIc == "51")) {
            contextMenu = [
                {
                    text: dwnContextual,
                    icon: dwnIcoContextual,
                    onItemClick: function(vm) {
                        wdService.isFileHasChanged().then(function (hasChanged) {
                            var changedData = hasChanged.res;
                            if (changedData.Header.ErrorCount !== "") {
                                var data = { title: dwnContextual, fileAction: true, action: "DownloadDocument, wdInfo", desc: hasChanged.fileData.Description, doc: hasChanged.fileData.DocId };
                                $rootScope.$broadcast("errorAction", {visible: true, rctx: changedData.Header.wd_Error_RCTX, data: data});
                                return false
                            } 

                            if(hasChanged.confirm){
                                $rootScope.$broadcast('showMessageWhenFileChanged', {title:'Download', desc:hasChanged.res.items[0].Description, docid:hasChanged.res.items[0].DocId});
                                $rootScope.$broadcast('setConfirmHashChanged', {fnc:function(){
                                    e.component.selectRows(e.row.key, false);
                                    $rootScope.$broadcast('eventFired', { file: e.row, type: "download" });
                                    $('#popupFileChangedOptions').dxPopup().dxPopup("instance").hide();
                                    $(this).off();
                                }});
                            }else{
                                e.component.selectRows(e.row.key, false);
                                $rootScope.$broadcast('eventFired', { file: e.row, type: "download" });
                            }
                        })
                    },
                    visible: $localStorage.userRights.Download
                },
                {
                    text: "Refresh",
                    icon: "ms-Icon ms-Icon--Refresh",
                    onItemClick: function() {
                        var grid = $("#gridContainer").dxDataGrid("instance");
                        grid.refresh();
                    }
                },
                
                {
                    text: 'Check-In',
                    icon: 'ms-Icon ms-Icon--PageCheckedin',
                    items: [
                        
                        {
                            text: "Overwrite",
                            // disabled: function() {
                            //   return ($("#gridContainer").dxDataGrid("instance").getSelectedRowsData().length>1)?true:false;
                            // },
                            onItemClick: function(vm) {
                                wdService.isFileHasChanged().then(function (hasChanged) {
                                    var changedData = hasChanged.res;
                                    if (changedData.Header.ErrorCount !== "") {
                                        var data = { title: "Check-In", fileAction: true, action: "DownloadDocument, wdInfo", desc: hasChanged.fileData.Description, doc: hasChanged.fileData.DocId };
                                        $rootScope.$broadcast("errorAction", {visible: true, rctx: changedData.Header.wd_Error_RCTX, data: data});
                                        return false
                                    } 

                                    if(hasChanged.confirm){
                                        $rootScope.$broadcast('showMessageWhenFileChanged', {title:'Overwrite', desc:hasChanged.res.items[0].Description, docid:hasChanged.res.items[0].DocId});
                                        $rootScope.$broadcast('setConfirmHashChanged', {fnc:function(){
                                            var fileUploader = $('#checkin').dxFileUploader('instance');
                                            fileUploader._isCustomClickEvent = true;
                                            fileUploader._$fileInput.click();
                                            $rootScope.checkinType = "R";
                                            $('#popupFileChangedOptions').dxPopup().dxPopup("instance").hide();
                                            $(this).off();
                                        }});
                                    }else{
                                        var fileUploader = $('#checkin').dxFileUploader('instance');
                                        fileUploader._isCustomClickEvent = true;
                                        fileUploader._$fileInput.click();
                                        $rootScope.checkinType = "R";
                                    }
                                })
                            }
                        },
                        {
                            text: "New version",
                            // disabled: function() {
                            //   return ($("#gridContainer").dxDataGrid("instance").getSelectedRowsData().length>1)?true:false;
                            // },
                            onItemClick: function(vm) {
                                wdService.isFileHasChanged().then(function (hasChanged) {
                                    var changedData = hasChanged.res;
                                    if (changedData.Header.ErrorCount !== "") {
                                        var data = { title: "Versions", fileAction: true, action: "DownloadDocument, wdInfo", desc: hasChanged.fileData.Description, doc: hasChanged.fileData.DocId };
                                        $rootScope.$broadcast("errorAction", {visible: true, rctx: changedData.Header.wd_Error_RCTX, data: data});
                                        return false
                                    } 

                                    if(hasChanged.confirm){
                                        $rootScope.$broadcast('showMessageWhenFileChanged', {title:'New version', desc:hasChanged.res.items[0].Description, docid:hasChanged.res.items[0].DocId});
                                        $rootScope.$broadcast('setConfirmHashChanged', {fnc:function(){
                                            var fileUploader = $('#checkin').dxFileUploader('instance');
                                            fileUploader._isCustomClickEvent = true;
                                            fileUploader._$fileInput.click();
                                            $rootScope.checkinType = "N";
                                            $('#popupFileChangedOptions').dxPopup().dxPopup("instance").hide();
                                            $(this).off();
                                        }});
                                    }else{
                                        var fileUploader = $('#checkin').dxFileUploader('instance');
                                        fileUploader._isCustomClickEvent = true;
                                        fileUploader._$fileInput.click();
                                        $rootScope.checkinType = "N";
                                    }
                                })
                            }
                        },
                        {
                            text: "Discard",
                            onItemClick: function(vm) {
                                wdService.isFileHasChanged().then(function (hasChanged) {
                                    var changedData = hasChanged.res;
                                    if (changedData.Header.ErrorCount !== "") {
                                        var data = { title: "Check-In", fileAction: true, action: "DownloadDocument, wdInfo", desc: hasChanged.fileData.Description, doc: hasChanged.fileData.DocId };
                                        $rootScope.$broadcast("errorAction", {visible: true, rctx: changedData.Header.wd_Error_RCTX, data: data});
                                        return false
                                    } 
                                    if(hasChanged.confirm){
                                        $rootScope.$broadcast('showMessageWhenFileChanged', {title:'Discard', desc:hasChanged.res.items[0].Description, docid:hasChanged.res.items[0].DocId});
                                        $rootScope.$broadcast('setConfirmHashChanged', {fnc:function(){
                                            var recordsSelected = e.component.getSelectedRowsData();
                                            (recordsSelected.length>1)?checkinSeveralRecords(recordsSelected):checkinSingleRecord(e.row.data, 0);
                                            $('#popupFileChangedOptions').dxPopup().dxPopup("instance").hide();
                                            $(this).off();
                                        }});
                                    }else{
                                        var recordsSelected = e.component.getSelectedRowsData();
                                        console.log(changedData);
                                        (recordsSelected.length>1)?checkinSeveralRecords(recordsSelected):checkinSingleRecord(e.row.data, 0);
                                    }
                                })
                            }
                        }
                    ],
                    visible: $localStorage.userRights['Check-In']
                },
                // {
                //     text: 'Edit Metadata',
                //     icon: 'ms-Icon ms-Icon--Edit',
                //     onItemClick: function(vm) {
                //         setProfile("Edit", "editProfile", "Profile", e, vm, 0);
                //     }
                // },
                {
                    text: 'Copy',
                    icon: 'ms-Icon ms-Icon--Copy',
                    onItemClick: function(vm) {
                        setProfile("Copy", "editProfile", "Profile", e, vm, 0);
                    },
                    visible: $localStorage.userRights['Copy']
                },
                {
                    text: "View",
                    icon: "ms-Icon ms-Icon--EntryView",
                    onItemClick: function(vm) {
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
                                    e.component.selectRows(e.row.key, false);
                                    openPanel(e, vm, 0, 'View');
                                    vm.model.$parent.$parent.wdView = true;
                                    $rootScope.$broadcast('eventFired', { file: e.row, type: "view" });
                                    $('#gridContainer').css("max-width", "none").css("width", "");
                                    setTimeout(function(){
                                        $("#listTitle").css({'max-width': "0px", "width" : "0px"});
                                        var grid = $("#gridContainer").dxDataGrid("instance");
                                        grid._windowResizeCallBack();
                                        $rootScope.setTitleHeaderWidth();
                                    }, -1)
                                    $('#popupFileChangedOptions').dxPopup().dxPopup("instance").hide();
                                    $(this).off();
                                }});
                            }else{
                                e.component.selectRows(e.row.key, false);
                                openPanel(e, vm, 0, 'View');
                                vm.model.$parent.$parent.wdView = true;
                                $rootScope.$broadcast('eventFired', { file: e.row, type: "view" });
                                $('#gridContainer').css("max-width", "none").css("width", "");
                                setTimeout(function(){
                                    $("#listTitle").css({'max-width': "0px", "width" : "0px"});
                                    var grid = $("#gridContainer").dxDataGrid("instance");
                                    grid._windowResizeCallBack();
                                    $rootScope.setTitleHeaderWidth();
                                }, -1)
                            }
                        })
                    },
                    visible: $localStorage.userRights['View']
                },
                // {
                //     text: 'Move',
                //     icon: 'ms-Icon ms-Icon--Move',
                //     onItemClick: function(vm) {
                //         setProfile("Move", "editProfile", "Profile", e, vm, 0);
                //     }
                // },
                // {
                //     text: 'Email',
                //     icon: 'ms-Icon ms-Icon--Mail',
                //     onItemClick: function(vm) {
                //         setProfile("", "eMail", "Email", e, vm, 1);
                //     }
                // },
                {
                    text: 'Delete',
                    icon: 'ms-Icon ms-Icon--Delete',
                    onItemClick: function(vm) {
                        wdService.isFileHasChanged().then(function (hasChanged) {
                            var changedData = hasChanged.res;
                            if (changedData.Header.ErrorCount !== "") {
                                var data = { title: "Delete", fileAction: true, action: "DownloadDocument, wdInfo", desc: hasChanged.fileData.Description, doc: hasChanged.fileData.DocId };
                                $rootScope.$broadcast("errorAction", {visible: true, rctx: changedData.Header.wd_Error_RCTX, data: data});
                                return false
                            } 

                            if(hasChanged.confirm){
                                $rootScope.$broadcast('showMessageWhenFileChanged', {title:'Delete', desc:hasChanged.res.items[0].Description, docid:hasChanged.res.items[0].DocId});
                                $rootScope.$broadcast('setConfirmHashChanged', {fnc:function(){
                                    e.component.selectRowsByIndexes([e.rowIndex]);
                                    $rootScope.$emit("openDeletePopup", e.component.getSelectedRowsData());
                                    $('#popupFileChangedOptions').dxPopup().dxPopup("instance").hide();
                                    $(this).off();
                                }});
                            }else{
                                e.component.selectRowsByIndexes([e.rowIndex]);
                                $rootScope.$emit("openDeletePopup", e.component.getSelectedRowsData());
                            }
                        })
                    },
                    visible: $localStorage.userRights['Delete']
                }
            ];
        } 
        else if ( (e.row.data.stFl == '36' && e.row.data.stIc == '0')) {
            contextMenu = [
                {
                    text: dwnContextual,
                    icon: dwnIcoContextual,
                    onItemClick: function(vm) {
                        wdService.isFileHasChanged().then(function (hasChanged) {
                            var changedData = hasChanged.res;
                            if (changedData.Header.ErrorCount !== "") {
                                var data = { title: dwnContextual, fileAction: true, action: "DownloadDocument, wdInfo", desc: hasChanged.fileData.Description, doc: hasChanged.fileData.DocId };
                                $rootScope.$broadcast("errorAction", {visible: true, rctx: changedData.Header.wd_Error_RCTX, data: data});
                                return false
                            } 

                            if(hasChanged.confirm){
                                $rootScope.$broadcast('showMessageWhenFileChanged', {title:'Download', desc:hasChanged.res.items[0].Description, docid:hasChanged.res.items[0].DocId});
                                $rootScope.$broadcast('setConfirmHashChanged', {fnc:function(){
                                    e.component.selectRows(e.row.key, false);
                                    $rootScope.$broadcast('eventFired', { file: e.row, type: "download" });
                                    $('#popupFileChangedOptions').dxPopup().dxPopup("instance").hide();
                                    $(this).off();
                                }})
                            }else{
                                e.component.selectRows(e.row.key, false);
                                $rootScope.$broadcast('eventFired', { file: e.row, type: "download" });
                            }
                        })
                    },
                    visible: $localStorage.userRights.Download
                },
                {
                    text: "Refresh",
                    icon: "ms-Icon ms-Icon--Refresh",
                    onItemClick: function() {
                        var grid = $("#gridContainer").dxDataGrid("instance");
                        grid.refresh();
                    }
                },
                {
                    text: "View",
                    icon: "ms-Icon ms-Icon--EntryView",
                    onItemClick: function(vm) {
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
                                    e.component.selectRows(e.row.key, false);
                                    openPanel(e, vm, 0, 'View');
                                    vm.model.$parent.$parent.wdView = true;
                                    $rootScope.$broadcast('eventFired', { file: e.row, type: "view" });
                                    $('#gridContainer').css("max-width", "none").css("width", "");
                                    setTimeout(function(){
                                        $("#listTitle").css({'max-width': "0px", "width" : "0px"});
                                        var grid = $("#gridContainer").dxDataGrid("instance");
                                        grid._windowResizeCallBack();
                                        $rootScope.setTitleHeaderWidth();
                                    }, -1)
                                    $('#popupFileChangedOptions').dxPopup().dxPopup("instance").hide();
                                    $(this).off();
                                }});
                            }else{
                                e.component.selectRows(e.row.key, false);
                                openPanel(e, vm, 0, 'View');
                                vm.model.$parent.$parent.wdView = true;
                                $rootScope.$broadcast('eventFired', { file: e.row, type: "view" });
                                $('#gridContainer').css("max-width", "none").css("width", "");
                                setTimeout(function(){
                                    $("#listTitle").css({'max-width': "0px", "width" : "0px"});
                                    var grid = $("#gridContainer").dxDataGrid("instance");
                                    grid._windowResizeCallBack();
                                    $rootScope.setTitleHeaderWidth();
                                }, -1)
                            }
                        })
                    },
                    visible: $localStorage.userRights['View']
                },
                // {
                //     text: 'Email',
                //     icon: 'ms-Icon ms-Icon--Mail',
                //     onItemClick: function(vm) {
                //         setProfile("", "eMail", "Email", e, vm, 1);
                //     }
                // }
            ];
        }
        else if (e.row.data.I == "55") {
            contextMenu = [];
        }
        else {
            contextMenu = [
                {
                    text: dwnContextual,
                    icon: dwnIcoContextual,
                    onItemClick: function(vm) {
                        wdService.isFileHasChanged().then(function (hasChanged) {
                            var changedData = hasChanged.res;
                            if (changedData.Header.ErrorCount !== "") {
                                var data = { title: dwnContextual, fileAction: true, action: "DownloadDocument, wdInfo", desc: hasChanged.fileData.Description, doc: hasChanged.fileData.DocId };
                                $rootScope.$broadcast("errorAction", {visible: true, rctx: changedData.Header.wd_Error_RCTX, data: data});
                                return false
                            } 

                            if(hasChanged.confirm){
                                $rootScope.$broadcast('showMessageWhenFileChanged', {title:'Download', desc:hasChanged.res.items[0].Description, docid:hasChanged.res.items[0].DocId});
                                $rootScope.$broadcast('setConfirmHashChanged', {fnc:function(){
                                    e.component.selectRows(e.row.key, false);
                                    $rootScope.$broadcast('eventFired', { file: e.row, type: "download" });
                                    $('#popupFileChangedOptions').dxPopup().dxPopup("instance").hide();
                                    $(this).off();
                                }});
                            }else{
                                e.component.selectRows(e.row.key, false);
                                $rootScope.$broadcast('eventFired', { file: e.row, type: "download" });
                                // var selectChOut = e.component.getSelectedRowsData();
                            }
                        })
                    },
                    visible: $localStorage.userRights.Download
                },
                {
                    text: "Refresh",
                    icon: "ms-Icon ms-Icon--Refresh",
                    onItemClick: function() {
                        var grid = $("#gridContainer").dxDataGrid("instance");
                        grid.refresh();
                    }
                },
                
                // {
                //     text: 'Edit Metadata',
                //     icon: 'ms-Icon ms-Icon--Edit',
                //     onItemClick: function(vm) {
                //         setProfile("Edit", "editProfile", "Profile", e, vm, 0);
                //     }
                // },
                {
                    text: 'Copy',
                    icon: 'ms-Icon ms-Icon--Copy',
                    onItemClick: function(vm) {
                        setProfile("Copy", "editProfile", "Profile", e, vm, 0);
                        // homeService.setSelected(e.component.getSelectedRowsData());
                        // openPanel(e, vm, 0, 'Profile');
                        // var gridModel = getDataGridControlerScope(vm);
                        // vm.model.$parent.$parent.checked = true;
                        // $rootScope.$broadcast('editIcon', {"flag": "Copy"});
                    },
                    visible: $localStorage.userRights['Copy']
                },
                // {
                //     text: 'Move',
                //     icon: 'ms-Icon ms-Icon--Move',
                //     onItemClick: function(vm) {
                //         setProfile("Move", "editProfile", "Profile", e, vm, 0);
                //         // homeService.setSelected(e.component.getSelectedRowsData());
                //         // openPanel(e, vm, 0, 'Profile');
                //         // var gridModel = getDataGridControlerScope(vm);
                //         // vm.model.$parent.$parent.checked = true;
                //         // $rootScope.$broadcast('editIcon', {"flag": "Move"});
                //     }
                // },
                // {
                //     text: 'Email',
                //     icon: 'ms-Icon ms-Icon--Mail',
                //     onItemClick: function(vm) {
                //         setProfile("", "eMail", "Email", e, vm, 1);
                //     }
                // },
                // {
                //     text: 'Delete',
                //     icon: 'ms-Icon ms-Icon--Delete',
                //     onItemClick: function(vm) {
                //         wdService.isFileHasChanged().then(function (hasChanged) {
                //             if(hasChanged.confirm){
                //                 $rootScope.$broadcast('showMessageWhenFileChanged', {title:'Delete', desc:hasChanged.res[0].Description, docid:hasChanged.res[0].DocId});
                //                 $rootScope.$broadcast('setConfirmHashChanged', {fnc:function(){
                //                     e.component.selectRowsByIndexes([e.rowIndex]);
                //                     $rootScope.$emit("openDeletePopup", e.component.getSelectedRowsData());
                //                     $('#popupFileChangedOptions').dxPopup().dxPopup("instance").hide();
                //                     $(this).off();
                //                 }});
                //             }else{
                //                 e.component.selectRowsByIndexes([e.rowIndex]);
                //                 $rootScope.$emit("openDeletePopup", e.component.getSelectedRowsData());
                //             }
                //         })
                //     }
                // },
                {
                    text: "View",
                    icon: "ms-Icon ms-Icon--EntryView",
                    onItemClick: function(vm) {
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
                                    e.component.selectRows(e.row.key, false);
                                    vm.model.$parent.$parent.wdView = true;
                                    $rootScope.$broadcast('eventFired', { file: e.row, type: "view" });
                                    $('#gridContainer').css("max-width", "none").css("width", "");
                                    setTimeout(function(){
                                        $("#listTitle").css({'max-width': "0px", "width" : "0px"});
                                        var grid = $("#gridContainer").dxDataGrid("instance");
                                        grid._windowResizeCallBack();
                                        $rootScope.setTitleHeaderWidth();
                                    }, -1)
                                    $('#popupFileChangedOptions').dxPopup().dxPopup("instance").hide();
                                    $(this).off();
                                }});
                            }else{
                                e.component.selectRows(e.row.key, false);
                                vm.model.$parent.$parent.wdView = true;
                                $rootScope.$broadcast('eventFired', { file: e.row, type: "view" });
                                $('#gridContainer').css("max-width", "none").css("width", "");
                                setTimeout(function(){
                                    $("#listTitle").css({'max-width': "0px", "width" : "0px"});
                                    var grid = $("#gridContainer").dxDataGrid("instance");
                                    grid._windowResizeCallBack();
                                    $rootScope.setTitleHeaderWidth();
                                }, -1)
                            }
                        })
                    },
                    visible: $localStorage.userRights['View']
                },
            ];
        }
        if (e.row.data.Version !== undefined && e.row.data.I !== "55") {
            contextMenu.push(
                {
                    text: 'Versions',
                    icon: 'ms-Icon ms-Icon--Documentation',
                    onItemClick: function(vm) {
                        wdService.isFileHasChanged().then(function (hasChanged) {
                            var changedData = hasChanged.res;
                            if (changedData.Header.ErrorCount !== "") {
                                var data = { title: "Versions", fileAction: true, action: "DownloadDocument, wdInfo", desc: hasChanged.fileData.Description, doc: hasChanged.fileData.DocId };
                                $rootScope.$broadcast("errorAction", {visible: true, rctx: changedData.Header.wd_Error_RCTX, data: data});
                                return false
                            } 
                            if(hasChanged.confirm){
                                $rootScope.$broadcast('showMessageWhenFileChanged', {title:'Versions', desc:hasChanged.res.items[0].Description, docid:hasChanged.res.items[0].DocId});
                                $rootScope.$broadcast('setConfirmHashChanged', {fnc:function(){
                                    if(window != top){
                                        $rootScope.$broadcast("setTitleVersionPopup",{id:hasChanged.fileData.DocId , desc:hasChanged.fileData.Description})
                                        $('#popupVersionIframe').dxPopup().dxPopup("instance").show();
                                        setTimeout(function(){
                                            $("#wdVersionIframeNewTab").dxButton('instance').option('onClick',function(){
                                                $window.open('./home?verid=' + e.row.data.LID + "&verRec=" + e.row.data.RN + "&typeid=version", '_blank');
                                                $('#popupVersionIframe').dxPopup().dxPopup("instance").hide();
                                            })
                                            $("#wdVersionIframeEither").dxButton('instance').option('onClick',function(){
                                                $location.path('/home').search({verid: e.row.data.LID, verRec:e.row.data.RN, typeid:'version'});
                                                $route.reload();
                                            })
                                        }, -1)
                                    }else{
                                        $window.open('./home?verid=' + e.row.data.LID + "&verRec=" + e.row.data.RN + "&typeid=version", '_blank');
                                    }
                                    $('#popupFileChangedOptions').dxPopup().dxPopup("instance").hide();
                                    $(this).off();
                                }});
                            }else{
                                if(window != top){
                                    $rootScope.$broadcast("setTitleVersionPopup",{id:hasChanged.fileData.DocId , desc:hasChanged.fileData.Description})
                                    $('#popupVersionIframe').dxPopup().dxPopup("instance").show();
                                    setTimeout(function(){
                                        $("#wdVersionIframeNewTab").dxButton('instance').option('onClick',function(){
                                            $window.open('./home?verid=' + e.row.data.LID + "&verRec=" + e.row.data.RN + "&typeid=version", '_blank');
                                            $('#popupVersionIframe').dxPopup().dxPopup("instance").hide();
                                        })
                                        $("#wdVersionIframeEither").dxButton('instance').option('onClick',function(){
                                            $location.path('/home').search({verid: e.row.data.LID, verRec:e.row.data.RN, typeid:'version'});
                                            $route.reload();
                                        })
                                    }, -1)
                                }else{
                                    $window.open('./home?verid=' + e.row.data.LID + "&verRec=" + e.row.data.RN + "&typeid=version", '_blank');
                                }
                            }
                        })
                    }
                }
            )
        }
        if(e.row.data.I !== "55" && window != top){
            contextMenu.push(
                {
                    text: "Open with Worldox",
                    icon: "ms-Icon ms-Icon--NavigateExternalInline",
                    onItemClick: function() {
                        $window.location.href = 'wdox://'+ e.row.data.DocId;
                    }
                }
            )
        }
        return contextMenu;
    }

    function securitySelect() {
        return security;
    }

    function setSelectedCount(e) {
        this.fileCount = e;
    }

    function getDataGridControlerScope(vm) {
      return vm.model.$parent.$parent.$$childTail.$$childTail;
    }

    function openPanel(x, y, z, n, i) {
        var config;

        if (i === "toolbar") {
            config = y.model.$parent.$parent;
        } else {
            config = y.model;
        }

        config.selectedTab = n;
        config.checked = true;
        
        config.getComment = {
            "Comment": x.row.data.Comments
        }

        for (var i = 1; i <= 7; i++) {
            if (x.row.data['Field' + i] != ""){
                config.fieldContainer['Field' + i] = true;
                config.editFields['placeholder' + i] = x.row.data['Field' + i + 'Name'];
                config.editFields['field' + i] = x.row.data['Field' + i];
            } else {
                config.fieldContainer['Field' + i] = false;
            }
        }

    
        
        // $("#tabPanelItems").dxTabPanel("instance").option("selectedIndex", z);
        config.toggle(x.row.data, true);
    }

    // function download(element) {
    //   var x = {
    //       "RN": element.RN,
    //       "LID": element.LID,
    //       "LN": element.LN,
    //       "PGID": element.profileGroupId,
    //       "Field1": element.Field1,
    //       "Field2": element.Field2,
    //       "Field3": element.Field3,
    //       "Field4": element.Field4,
    //       "Field5": element.Field5,
    //       "Field6": element.Field6,
    //       "Field7": element.Field7
    //     }
    //     wdService.download(x).then(function(res){
    //         var dwnData = res.data.download;
    //         if (dwnData.errorStatus.ErrorCount != "") {
    //         } else if (dwnData.message) {
    //         } else {
    //             if (userAgent.indexOf('Frowser') != -1) {
    //                 wdService.getFolderLevel().then(function(response) {
    //                     for (var i = 0; i < response.data.root.Cabinets.length; i++) {
    //                         if ( response.data.root.Cabinets[i].pgID == x.profileGroupId ) {
    //                             var folderList = response.data.root.Cabinets[i].pgFields.split('|');
    //                             $scope.getResponse(res.data, x, folderList);
    //                             return false;
    //                         }
    //                     }
    //                 }, function(error){
    //                 });
    //             } else {
    //                 $window.location.href = ($localStorage.host + res.data.download.fileLoc);
    //             }
    //         }
    //     }, function(error) {
    //     });
    //     var getTableData = $("#gridContainer").dxDataGrid("instance");
    //     getTableData.refresh();
    // }



    /**
     * Makes sequentially several requests to checkout records, using promises.
     * @param vm, current element in datagrid.
     */
    function checkoutSeveralRecords(vm) {
        angular.forEach(vm, function(key, index) {
            if (index === vm.length - 1){
                checkoutRecord(key, index);
                return false 
            }
            checkoutRecord(key, index);
        });
   
    }

    ///**
    // * Checkouts a single record.
    // * @param element, current element in datagrid.
    // */
    function checkoutRecord(element, index, reload) {
        var getselectedFiles = $("#gridContainer").dxDataGrid("instance").getSelectedRowsData();
        for (var i = 0; i < getselectedFiles.length; i++) {
            $rootScope.$broadcast("fileAction", { type: "checkOut", data: undefined });
            //var getloopData = checkOutput(getselectedFiles[i]);
        }
        
    }


    function errortype(fileResource, x) {
        var setErrorData;
        if (fileResource.errorStatus.wd_Error_DOCID !== "") {
            setErrorData = { title: fileResource.errorStatus.wd_Error_DOCID, desc: fileResource.errorStatus.wd_Error_DOCNAME, wdMsg: fileResource.errorStatus.wd_Error_MSG, status: "failed", type: false, action: x };
            $rootScope.$broadcast('setDialogStatus', setErrorData);
            return false;
        }
        
        setErrorData = { wdMsg: fileResource.errorStatus.wd_Error_MSG, status: "failed", type: true, action: x };
        $rootScope.$broadcast('setDialogStatus', setErrorData);
    }

    ///**
    // * Checks-in single record.
    // * @param element, record object to checkIn.
    // */

    function checkinSingleRecord(element, index, reload) {
        //If index is sent as undefined, change to 0 to allow toast to display correctly

        wdService.checkIn(element).then(function(res) {
            var fileResource = res.data.fileStatus;
            
            if (fileResource.errorStatus.ErrorCount !== "") {
                errortype(fileResource, "Check-in");
                return false;
            }

            wdService.isFileHasChanged().then(function (hasChanged) {
                var wdChKSerGrid = $("#gridContainer").dxDataGrid("instance"),
                src = wdChKSerGrid.option('dataSource');
                src.store.update(hasChanged.res.items[0].DocId, hasChanged.res.items[0])
            });

            //var setErrorData = { title: element.DocId, desc: element.Description, wdMsg: "File Checked in successfully", status: "success", action: "Check-In" }
            //$rootScope.$broadcast('setDialogStatus', setErrorData);
        

        }, function(err){
            var data = { fileAction: false };
            $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
        });
    }

    function showContextual(e) {
        console.log(e);
    }

    ///**
    // * Checks-in several records at once, sequentially.
    // * @param recordsSelected, records array to checkIn.
    // */
    function checkinSeveralRecords(recordsSelected) {
        angular.forEach(recordsSelected, function(key, index){
            if (index === recordsSelected.length - 1){
                checkinSingleRecord(key, index); 
                return false;
            }
            checkinSingleRecord(key, index);
        });
        // recordsSelected.reduce(
        //     function (sequence, value, index) {
        //         return sequence.then(function() {
        //             return promiseCall(value, index);
        //         });
        //     },
        //     Promise.resolve()
        // ).then(function() {
        //     setTimeout(function() {
        //         ////$("#gridContainer").dxDataGrid("instance").clearSelection();
        //         $rootScope.$$childTail.$$childHead.selectedRow = 0;
        //         $rootScope.$$childTail.$$childHead.$apply();
        //     }, 2000);
        // });

        // function promiseCall(value, index){
        //     return new Promise(function (fulfill, reject){
        //         var delayDisplayResults = 1500;
        //         setTimeout(function() {
        //           checkinSingleRecord(value, index);
        //           fulfill({ value: value });
        //         }, delayDisplayResults);
        //     });
        // }
    }
    return {
        getContextMenu: getContextMenu,
        getSelectedCount: getSelectedCount,
        setSelectedCount: setSelectedCount,
        securitySelect: securitySelect,
        openPanel: openPanel,
        getDataGridControlerScope: getDataGridControlerScope,
        checkinSeveralRecords: checkinSeveralRecords,
        checkinSingleRecord: checkinSingleRecord,
        categoryContextMenu: categoryContextMenu,
        getCategoryList: getCategoryList,
        setCategory: setCategory,
        getCategory: getCategory,
        getFieldId: getFieldId,
        getColumns: getColumns
    }

    function setCategory(e) {
        addCategory = e;
    }

    function getCategory(){
        return addCategory;
    }

    function setProfile(a, b, c, e, vm, x) {
        wdService.isFileHasChanged().then(function (hasChanged) {
            var changedData = hasChanged.res;
            if (changedData.Header.ErrorCount !== "") {
                var data = { title: a, fileAction: true, action: "DownloadDocument, wdInfo", desc: hasChanged.fileData.Description, doc: hasChanged.fileData.DocId };
                $rootScope.$broadcast("errorAction", {visible: true, rctx: changedData.Header.wd_Error_RCTX, data: data});
                return false
            } 

            if(hasChanged.confirm){
                $rootScope.$broadcast('showMessageWhenFileChanged', {title:'Edit Metadata', desc:hasChanged.res.items[0].Description, docid:hasChanged.res.items[0].DocId});
                $rootScope.$broadcast('setConfirmHashChanged', {fnc:function(){
                    $rootScope.$broadcast("fileAction", { type: b, data: [], meta: hasChanged.res, profile: a});
                    $('#popupFileChangedOptions').dxPopup().dxPopup("instance").hide();
                    $(this).off();
                }});
            }else{
                $rootScope.$broadcast("fileAction", { type: b, data: [], meta: hasChanged.res, profile: a});
            }

            homeService.setSelected(e.component.getSelectedRowsData());
            //openPanel(e, vm, x, c);
            vm.model.$parent.$parent.checked = true;
            $rootScope.$broadcast('editIcon', {"flag": a});
        });
    }

    function getCategoryList(e) {
        var request = {
            method: 'GET',
            // transformResponse: function (data, headersGetter) {
            //     return { data: data }
            // },
            url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?CATLIST+wd_SID=' + $localStorage.userData.session + '+html=/api/categories/categories-list.json+wd_File_Path_Value=' + encodeURIComponent(e) + '+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now()
        }
        return $http(request);
    }

        function getFieldId() {
            fieldID = {
                WDX_PROF_UNKNOWN: 0,
                WDX_PROF_XNAME: 1,
                WDX_PROF_FILENAME: 2,
                WDX_PROF_EXTENSION: 3,
                WDX_PROF_DATE_MODIFIED: 4,
                WDX_PROF_OWNER: 5,
                WDX_PROF_SIZE: 6,
                WDX_PROF_PATH: 7,
                WDX_PROF_LIBRARY: 8,
                WDX_PROF_DATE_CREATED: 9,
                WDX_PROF_FIELD1: 10,
                WDX_PROF_FIELD2: 11,
                WDX_PROF_FIELD3: 12,
                WDX_PROF_FIELD4: 13,
                WDX_PROF_FIELD5: 14,
                WDX_PROF_FIELD6: 15,
                WDX_PROF_FIELD7: 16,
                WDX_PROF_HITS: 17,
                WDX_PROF_ATTRIBS: 18,
                WDX_PROF_GROUP: 19,
                WDX_PROF_VERSION: 20,
                WDX_PROF_BITMAPS: 21,
                WDX_PROF_PATHFILE: 22,
                WDX_PROF_DATE_ACCESSED: 23,
                WDX_PROF_OWNERSHIP: 24,
                WDX_PROF_PATHMAP: 25,
                WDX_PROF_AAMETHOD: 26,
                WDX_PROF_RIGHTS: 27,
                WDX_PROF_CLASSNAME: 28,
                WDX_PROF_FIELD1DESC: 29,
                WDX_PROF_FIELD2DESC: 30,
                WDX_PROF_FIELD3DESC: 31,
                WDX_PROF_FIELD4DESC: 32,
                WDX_PROF_FIELD5DESC: 33,
                WDX_PROF_FIELD6DESC: 34,
                WDX_PROF_FIELD7DESC: 35,
                WDX_PROF_RELATIONS: 36,
                WDX_PROF_EMAIL_FROM: 37,
                WDX_PROF_EMAIL_TO: 38,
                WDX_PROF_EMAIL_CC: 39,
                WDX_PROF_EMAIL_BCC: 40,
                WDX_PROF_EMAIL_SENT: 41,
                WDX_PROF_EMAIL_RCVD: 42,
                WDX_PROF_EMAIL_RFDATE: 43,
                WDX_PROF_EMAIL_RFWHO: 44,
                WDX_PROF_EMAIL_ATTACHS: 45,
                WDX_PROF_EMAIL_ADDR: 46,
                WDX_PROF_RETENTION_WHEN: 47,
                WDX_PROF_RETENTION_WHAT: 48,
                WDX_PROF_WILD: 49,
                WDX_PROF_FIELDS: 50
            };
     
        return fieldID 
    }
}]);
