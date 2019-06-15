'use strict'
angular.module('WDWeb');
homeController.$inject = ['$scope', '$timeout', '$localStorage', '$window', '$location', '$rootScope', '$log', 'wdService', 'homeService', 'providerService', 'previewService', 'leftNavService','uxService', '$sce', '$cookies', 'wdxLogoutService'];
angular.module('WDWeb').controller('homeController', homeController).run(function($templateCache, $http, $window) {
    $http.get('loader.html', { cache: $templateCache });
});
function homeController($scope, $timeout, $localStorage, $window, $location, $rootScope, $log, wdService, homeService, providerService, previewService, leftNavService,uxService, $sce, $cookies, wdxLogoutService) {
    var userAgent;
    var fileID = {};
    var searchQuery = $location.search();
    var authSession = $cookies.get("wdSession");
    $scope.fileError = false;
    $scope.$storage = $localStorage;
    $scope.panelWidth = "50%";
    $scope.fileErrorMessage = [];
    $scope.fileSuccessMessage = [];
    $scope.dialogTitle = "";
    $scope.sethandle = "";
    $rootScope.timeStamp = "";
    $scope.userType = "";
    $scope.wdattachGroup = 0;
    $rootScope.chkedPanel = "";
    $scope.errorDailog = false;
    $scope.wdErrorRctx = "";
    $scope.WDXHOST = $localStorage.host;
    $scope.wdFileData = "";
    // $rootScope.wdTempCabinet = false;
    
    window.addEventListener("dragover", function(e) {
        e.preventDefault();
    }, false);
    window.addEventListener("drop", function(e) {
        e && e.preventDefault();
    }, false);

    var onExit = function() {
        //var array = [$localStorage.wdListID, $localStorage.ftListId];
        var array = [$localStorage.ftListId];
        angular.forEach(array, function(key, index) {
            if (key !== undefined) {
                wdService.clearListfromParm(key).then(function(res) {
                    //console.log("List Id" + key + "deleted") 
                });
            }
        })
        delete $localStorage.wdListID;
        delete $localStorage.ftListId;
        //delete $localStorage.wdWorkSpaceID;
        //$localStorage.$reset();
        return "bye"
    }

    $window.onbeforeunload = onExit();

    $scope.$on("errorAction", function(e, data) {
        var showDialog = data.visible,
        wdFileData = data.data,
        wdRTX = data.rctx;
        $scope.setPopupDailog(showDialog, wdRTX, wdFileData);
    });


    $scope.$on("openSearchPanel", function(e, data) {
        $scope.getDefaultTemplate(false);
        $scope.templates = true;
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

    $scope.$on("favMattersEvent", function(event, data) {
        $scope.cancelPanel();
    });

    $scope.$on("cabinetEvent", function(event, data) {
        $scope.cancelPanel();
    });

    $scope.$on("setDialogStatus", function(event, data) {
        $scope.fileErrorMessage = [];
        $scope.fileSuccessMessage = [];
        $scope.dialogTitle = data.action;
        if (data.status == "failed") {
            $scope.fileErrorMessage.push(data);
            $scope.genericError = data.type;
        } else {
            $scope.checked = false;
            $scope.fileSuccessMessage.push(data);
        }
        $scope.errorTypeDialog = "action";
        $scope.fileError = true;
    });

    $scope.$watch('wdView', function (e) {
    // $scope.$watch('checked', function (e) {
        $scope.resizeHomedataGrid();
        if (e) {
            $(".dx-datagrid-rowsview.dx-fixed-columns .dx-scrollable-scrollbar").addClass('openViewPanel');
            $("#homedataGrid .dx-resizable-handle-right").css("display", "block");
            //$scope.sethandle = "right";
            return false;
        };
        //$scope.sethandle = "";
        $("#homedataGrid .dx-resizable-handle-right").css("display", "none");
        $(".dx-datagrid-rowsview.dx-fixed-columns .dx-scrollable-scrollbar").removeClass('openViewPanel');
    });

    $scope.scrollPreview = {
        scrollByContent: true,
        scrollByThumb: true, 
        showScrollbar: "always",
        height: function() {
            return window.innerHeight - 185;
        },
        useNative: true
    }
    
    $scope.chkPanel = function() {
        return $scope.checked;
    }

    $scope.setPopupDailog = function(x, y, z) {
        $scope.errorDailog = x;
        $scope.wdErrorRctx = y;
        $scope.wdFileData = z;
    }

    $scope.expandPanel = false;
    $scope.listOptions = [];
    $scope.viewType = true;
    $scope.parentPanel = false;
    $scope.visiblePopup = false;

    $rootScope.$on("searchPanel", function(event, data) {
        if (data.flag == true) {
            $scope.templates = true;
        }
    });

    $scope.selectAttType = [
        {
           text: "Full copies of the files",
           value: 0 
        },
        {
            text: "In a Worldox file list (internal use only)",
            value: 1 
        },
        {
            text: "Encrypted container (i.e. a passworded ZIP file)",
            value: 2 
        }
    ];

    $scope.attachPopup = {
        showTitle: true,
        title: "ATTACH",   
        width: 625,
        height: 550,
        dragEnabled: false,
        closeOnOutsideClick: true,
        contentTemplate: "attached",
        bindingOptions: {
            visible: "visiblePopup",
        },
        onShowing: function(e) {
            var getInstance = $("#gridContainer").dxDataGrid("instance");
            var getSelected = getInstance.getSelectedRowsData();
            $scope.attachedFiles = getSelected;
            $scope.attachLength = getSelected.length;
        }
    }

    $scope.width_popupStatus = 550;
    if($( window ).width()<768) {
        $scope.width_popupStatus = '80%';
    }

    $scope.fileErrorControl = {
        showTitle: true,   
        width: 'auto',
        maxWidth: '90vw',
        //width: $scope.width_popupStatus,
        height: 'auto',
        shading: false,
        closeOnOutsideClick: true,
        contentTemplate: "fileError",
        bindingOptions: {
            visible: "fileError",
            title: "dialogTitle",
        },
        onShown: function(e) {
            var errorCalc = $("#errorView").dxScrollView("instance");
        }
    }

    $scope.errorBtn = {
         text: "Open", 
         type: "success",
         onClick: function() {
            $scope.$broadcast ('openReadOnly');
         }
    }

    $scope.openTypeSelected = {
        bindingOptions: {
            text: "openSelected"
        },
        type: "success",
        onClick: function(e) {
            var grid = $("#gridContainer").dxDataGrid("instance"),
            gridData = grid.getSelectedRowsData()[0];
            $scope.setFileActionDwnload(gridData, true);
            $scope.fileError = false;
        }
    }

    $scope.setFileActionDwnload = function(x, y) {
        var fileData = {
            "LN": x.LN,
            "RN": x.RN,
            "LID": x.LID,
            "Status": x.I,
            "DocId": x.DocId,
            "tags": x.CAT_ID,
            "Description": x.Description,
            "profileGroupId": x.profileGroupId,
            "Extension": x.Extension,
            "FilePath": x.FilePath,
            "ver": x.version
        }
        $rootScope.$broadcast("fileActionOpen", { data: fileData, listId: false, attType: y });
    }

    $scope.attachMentsType = [
        { text: "A Full copy of the file", value: 0 },
        { text: "In a Worldox file list (internal use only)", value: 1}
    ];

    

    $scope.openTypeVerList = {
        text: "Display the Version list",
        type: "success",
        onClick: function(e) {
            var grid = $("#gridContainer").dxDataGrid("instance");
            var gridData = grid.getSelectedRowsData();
            $rootScope.$broadcast("fileActionOpen", { data: gridData[0], listId: true });
            $scope.fileError = false;
        }
    }

    $scope.wdAttachType = {
        dataSource: $scope.attachMentsType,
        value: $scope.attachMentsType[0].value,
        valueExpr: 'value',
        onValueChanged: function(e) {
            $scope.wdattachGroup = e.value;
        }
    }

    $scope.wdAttachSend = {
        text: "Attach",
        type: "success",
        onClick: function(e) {
            var grid = $("#gridContainer").dxDataGrid("instance"),
            gridData = grid.getSelectedRowsData()[0];
            if ($scope.wdattachGroup == 0) {
                $scope.setFileActionDwnload(gridData, false);
                return false;
            }
            $scope.setWdlAttachment(gridData);
        }
    }

    $scope.setWdlAttachment = function(x) {
        wdService.wdlOpen('New').then(function(res) {
            var newWdl = res.data.project;
            if (newWdl.errorStatus.ErrorCount !== "") {
                console.log(newWdl.errorStatus.wd_Error_MSG);
                return false
            }
            $scope.setWdlList(newWdl.path, x);
        });
    };

    $scope.setWdlList = function(x, y) {
        wdService.getWdList(x, 0, 200).then(function(res) {
            var wdlList = res.data.root.Header;
            if (wdlList.ErrorCount !== "") {
                console.log(wdlList.wd_Error_MSG);
                return false;
            }
            $scope.setfileToWdl(y, wdlList);
        });
    }

    $scope.setfileToWdl = function(x, y) {
        wdService.fileToWdl(x.FilePathReal, y.List_ID).then(function(res) {
            var addedFile = res.data.fileStatus;
            if (addedFile.errorStatus.ErrorCount !== "") {
                console.log(addedFile.errorStatus.wd_Error_MSG);
                return false
            }
            $scope.nameWdl(x, y);
        });
    }

    $scope.nameWdl = function(x, y) {
        wdService.setWdlName(x, y, 0, 1, -1).then(function(res) {
            var setName = res.data.setField;
            if (setName.errorStatus.ErrorCount !== "") {
                console.log(setName.errorStatus.wd_Error_MSG);
                return false;
            }
            $scope.downloadWdl(y.List_ID);
        });
    };

    $scope.downloadWdl = function(x) {
        var y = {
            RN: '-1',
            LID: x,
            LN: 0
        }
        wdService.download(y).then(function(res) {
            var dwnWdl = res.data.download;
            if (dwnWdl.errorStatus.errorStatus !== "") {
                return false;
            }
        });
    }

    $scope.attachedList = {
        scrollByContent: true,
        scrollByThumb: true,
        height: 150         
    }

    $scope.attachType = {
        items: $scope.selectAttType,
        valueExpr: 'value',
    }

    $scope.attachSetName = {
        value: true,
        text: "Attach with Doc IDs instead of Document Descriptions."
    }

    $scope.sendAttach = {
        text: "Send",
        type: "success"
    }

    $scope.classExpandIcon = {'ms-Icon--BackToWindow':$scope.expandPanel,'ms-Icon--FullScreen':!$scope.expandPanel}

    //Inits customs home controller.
    $scope.init = function() {

        homeService.checkLocalStorage();
        $scope.softpopFlag = 1;

        if (authSession !== undefined) {
            $cookies.remove("wdSession");
        }

        $timeout(function(){
            angular.element(document).ready(function(){
                var SpinnerElements = document.querySelectorAll(".dwnSpinner");
                for (var i = 0; i < SpinnerElements.length; i++) {
                    new fabric['Spinner'](SpinnerElements[i]);
                }
                $scope.parentPanel = true;
                $rootScope.wdDom = false;

                $scope.resizeHomedataGrid();
            });
        }, 1000);

        // if ($localStorage.wdListID) {
        //     wdService.clearList().then(function(response){
        //         var data = response.data.root;
        //         if (data.ErrorCount != "") {
        //             return false;
        //         }
        //     }, function(error) {
        //         console.log(error);
        //     });
        // }

        userAgent = $window.navigator.userAgent;

        $scope.softPop = false;
        if (userAgent.indexOf('Frowser') != -1) {
            $scope.softPop = true;
            if (searchQuery.attach) {
                $scope.openSelected = "Attach the Selected file";
            } else {
                $scope.openSelected = "Open the Selected file";
            }
            
        } else {
            $scope.openSelected = "Download the Selected file"
        }


        $scope.checked = false;
        $scope.wdView = false;
        $scope.directAccess = false;
        $scope.dwnSpinner = true;
        $scope.hgt;
        $scope.projects = false;
        $scope.queryTitle = searchQuery.query;
        $scope.showFilter = true;
        $scope.templates = false;
        $scope.uploadToggle = false;
        $scope.openCats = false;

        var windowHeight = $(window).innerHeight();
        windowHeight= windowHeight - 145;

        $scope.windowHeight = {
            "height": windowHeight + 'px'
        };

        $scope.showUpload = function() {
            $scope.uploadToggle = true;
            $scope.$broadcast ('setFavQuick');
        };

        $scope.showDirectAccess = function() {
            $scope.directAccess = true;
            $scope.$broadcast ('setDirectAccess');
        }

        $scope.setChkWidth = function() {
            if ($rootScope.chkedPanel == undefined){
                return false;
            }
            return $rootScope.chkedPanel.width
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

        $scope.setTemplate = function(item, x) {
            $scope.$broadcast('setTemplates', {"defaults": item, "type": x});
        }

        wdService.getColumnID().then(function(response) {
            if (response.data.root.errorStatus.ErrorCount !== ""){
                console.log(response.data.root.errorStatus.wd_Error_MSG);
                return false;
            }
            $localStorage.columnId = response.data.root.data;

        }, function(error) {
            var data = { fileAction: false };
            $scope.setPopupDailog(true, "FAILED_SERVER", data);
        });
    }

    $scope.loadPreviewWhenStartup = function (listfiles) {
        if( $localStorage.isOpeningDocPanel){
            var infoData;
            // var infoData = listfiles.find(function (item) {
            //     return item.DocId == $localStorage.currentFile.DocId
            // })

            angular.forEach(listfiles, function(key, index) {
                if (key.DocId == $localStorage.currentFile.DocId) {
                    infoData = key;
                    return false;
                }
            });

            if(typeof infoData != 'undefined'){
                //$scope.checked = true;
                $scope.wdView = true;
                $scope.filePage($localStorage.currentFile);
                $rootScope.$broadcast('loadInfoPanelStartup', infoData);
                $scope.listOptions = [infoData];
                $("#gridContainer").dxDataGrid({
                    onContentReady: function (e) {
                        e.component.selectRows([{"DocId":$localStorage.currentFile.DocId}]);
                    }
                }).dxDataGrid("instance");
            }

        }
    }

    /**
     * Closes the file menu panel right.
     * @param x, boolean value
     * @param y, boolean value
     */
    $scope.toggle = function(x, y, z) {
        $scope.listOptions = [x];
        $scope.wdUnLockFile();
        if ($scope.wdView && !y) {
            $scope.checked = y;
            $scope.wdView = true;
            $scope.expandPanel = y;
            $localStorage.isOpeningDocPanel = y;
        } else if(!$scope.wdView && !y) {
            $scope.checked = y;
            $scope.wdView = y;
            $scope.expandPanel = y;
            $localStorage.isOpeningDocPanel = y;
            
        }

        if(z) {
            $scope.checked = y;
            $scope.wdView = y;
            $scope.expandPanel = y;
            $localStorage.isOpeningDocPanel = y
        }
    }

     /**
     * Expand / Compact the file menu panel right.
     */
    $scope.toggleExpandPanel = function(){
        $scope.expandPanel = !$scope.expandPanel
    }


    // Closes tab panels.
    $scope.cancelPanel = function() {
        homeService.setUploadPanel(1);
        $rootScope.viewOpt = homeService.getUploadPanel();
        $scope.uploadToggle = false;
        $scope.directAccess = false;
        $scope.templates = false;
        $scope.projects = false;
        $scope.openCats = false;
        $scope.$broadcast('closeCats', {panelupdate: false});
        $scope.$broadcast('closespinner');
    }

    $scope.openNewTab = function() {
        $window.open('./landing', '_blank');
    }

    $scope.wdUnLockFile = function() {
        var infoData = $("#gridContainer").dxDataGrid("instance").getSelectedRowsData().pop();
        if ($rootScope.chkedPanel.panel && $scope.chkPanel()) {
            wdService.setFileLock(infoData.LID).then(function(res) {
                console.log(res);
            }, function(err) {
                console.log(err);
            });
        }
    }


    $scope.setSelecteItems = function(e) {
        if (e === undefined || e === 0) {
            return false;
        } 
        return true;
    }

    /* Vihang [20181221]: START => Code to convert file menu panel from sliding panel to resizable panel */
    $scope.marginBetweenPanels = 10;
    $scope.homeFileMenuDefaultWidth = 520;

    $scope.resizeHomedataGrid = function () {

        if ($scope.wdView && parseInt($("#homeFileMenu").css("width")) <= 0) {
            // if ($scope.checked && parseInt($("#homeFileMenu").css("width")) <=0 ) {
            $("#homeFileMenu").css("width", $scope.homeFileMenuDefaultWidth);
        }

        var getHomeFileMenuWidth = ($scope.wdView ? $("#homeFileMenu").css("width") : 0);
        // var getHomeFileMenuWidth = ($scope.checked ? $("#homeFileMenu").css("width") : 0);
        var getLeftNavWidth = parseInt($("#leftNav").innerWidth());
        var getWidth = parseInt(window.innerWidth) - parseInt(getHomeFileMenuWidth) - getLeftNavWidth - $scope.marginBetweenPanels + 10;
        $("#homedataGrid").css("width", getWidth);
        $(".dx-freespace-row").css("height", 1);

        // Resize Toolbar
        // setTimeout(function () {
        //     angular.element('#homedataGrid div[dx-toolbar="fileActionToolbar"]').dxToolbar("instance")._windowResizeCallBack();
        // }, 500);
    }

    $scope.validateAndResizeHomeFileMenu = function (eventObj) {
        var toolbarWidth = $("#gridContainer .dx-toolbar-after").width();
        var getLeftNavWidth = parseInt($("#leftNav").innerWidth());
        var getHomedataGridWidth = eventObj.width != undefined && eventObj.width > 0
            ? parseInt(eventObj.width)
            : parseInt($("#homedataGrid").dxResizable("instance").option("width"));
        var getWidth = parseInt(window.innerWidth) - getLeftNavWidth - getHomedataGridWidth - $scope.marginBetweenPanels + 10;
        var setTitle = parseInt(eventObj.width) - parseInt(toolbarWidth) - 45;
        
        // Validation: START -  file menu panel width should not violate min/max width rules
        var getHomeFileMenuMinWidth = parseInt($("#homeFileMenu").css("min-width"));
        var getHomeFileMenuMaxWidth = parseInt($("#homeFileMenu").css("max-width"));
        //$("#listTitle").css("width", setTitle)
        if ((getHomeFileMenuMinWidth > 0 && getWidth <= getHomeFileMenuMinWidth)
            || (getHomeFileMenuMaxWidth > 0 && getWidth >= getHomeFileMenuMaxWidth)) {

                $scope.resizeHomedataGrid();
                return false;
        }
        else {
            $("#homeFileMenu").css("width", getWidth);
            return true;
        }
        // Validation: END -  file menu panel width should not violate min/max width rules       
    }

    $scope.setHomeResizable = {
        minWidth: 400,
        maxWidth: 1200,
        // bindingOptions: {
        //     handles: "sethandle",
        // },
        handles: "right",
        onInitialized: function(e) {
            var windowWidth = parseInt(window.innerWidth);
            var leftWidth = $("#leftNav").innerWidth();
            var bodyWidth = parseInt(windowWidth) - parseInt(leftWidth);
            $("#appBody").css("width", bodyWidth);
        },
        onResize: function (e) {
            setTimeout(function(){
                $("#listTitle").css({'max-width': "0px", "width" : "0px"});
                var grid = $("#gridContainer").dxDataGrid("instance");
                grid._windowResizeCallBack();
                // angular.element('#homedataGrid div[dx-toolbar="fileActionToolbar"]').dxToolbar("instance")._windowResizeCallBack();
                var windowWidth = parseInt(window.innerWidth);
                var leftWidth = parseInt($("#leftNav").innerWidth());
                var bodyWidth = parseInt(windowWidth) - parseInt(leftWidth);
                var maxWidthGrid = bodyWidth - parseInt(300);
                $("#gridContainer, #homedataGrid").css("maxWidth", maxWidthGrid);
                $("#gridContainer").css("width", "auto");
                $rootScope.setTitleHeaderWidth();
                $scope.validateAndResizeHomeFileMenu(e);
            }, -1)

        },
        onResizeStart: function (e) {
            e.element.find(".dx-resizable-handle-right").css("background-color", "#224e6e");
        },
        onResizeEnd: function (e) {
            e.element.find(".dx-resizable-handle-right").removeAttr("style");
        }
    }
    /* Vihang [20181221]: END => Code to convert file menu panel from sliding panel to resizable panel */


    // Opens the file menu panel right.
    $scope.setToggle = function (x) {
        setTimeout(function(){
            $("#gridContainer").dxDataGrid("instance")._windowResizeCallBack();
        }, -1);
        if (x.Extension !== "WDL") {
            $scope.wdView = true;
            $localStorage.isOpeningDocPanel = true;
            $scope.resizeHomedataGrid();
            return false;
        }
        // homeService.setTitle({"flag": "project", "name": x.Name });
        $location.path('/home').search({ query: 'Project: ' + encodeURIComponent(x.FilePath + "\\" + x.DocId) });
    }
    // Opens the version menu right.
    $scope.openVersionTab = function(x) {
        // homeService.setTitle({"flag": "project", "name": x.Name });
        $scope.checked = true;
        $localStorage.isOpeningDocPanel = true
        $("#tabPanelItems").dxTabPanel({
            selectedIndex: 3
        });
        $timeout(function () {
            $('#fileMenuTab3').click();
        }, 0);
    }

    /**
     * Loads the file content menu PREVIEW MODULE.
     * @param x, the document object to be loaded.
     */

    $scope.errorType = function(viewData) {
        var setErrorData;
        if (viewData.errorStatus.wd_Error_DOCID !== "") {
            setErrorData = { title: viewData.errorStatus.wd_Error_DOCID, desc: viewData.errorStatus.wd_Error_DOCNAME, wdMsg: viewData.errorStatus.wd_Error_MSG };
            $scope.fileErrorMessage.push(setErrorData);
            $scope.genericError = false;
            $scope.errorTypeDialog = "action";
            $scope.fileError = true;
            return false;
        }
        
        setErrorData = { wdMsg: viewData.errorStatus.wd_Error_MSG };
        $scope.fileErrorMessage.push(setErrorData);
        $scope.genericError = true;
        $scope.errorTypeDialog = "action";
        $scope.fileError = true;
    };

    $scope.filePage = function(x) {
        $localStorage.currentFile  = x;
        $scope.loadPreview = false;
        $scope.fileView = "<p></p>";
        $scope.fileErrorMessage = [];
        $scope.fileSuccessMessage = [];
        $rootScope.timeStamp = Date.now();
        previewService.getSession(x, $rootScope.timeStamp).then(function(res) {
            var viewData = res.data.preview;
            var getExt;

            if (viewData.errorStatus.req_ID == $rootScope.timeStamp) {
                if (viewData.errorStatus.ErrorCount != "") {
                    $scope.errorDailog = true;
                    $scope.wdErrorRctx = viewData.errorStatus.wd_Error_RCTX;
                    $scope.wdFileData = {
                        title: "View",
                        desc: x.Description,
                        doc: x.DocId,
                        action: "EntryView, wdInfo",
                        fileAction: true
                    }
                    $scope.fileView = "<p>" + viewData.errorStatus.wd_Error_MSG + "</p>";
                    $scope.loadPreview = true;
                    return false;
                }

                if (viewData.fileLoc == "") {
                    // $scope.errorDailog = true;
                    // $scope.wdErrorRctx = viewData.errorStatus.wd_Error_RCTX;
                    // $scope.wdFileData = {
                    //     title: "View",
                    //     desc: x.Description,
                    //     doc: x.DocId,
                    //     action: "EntryView, wdInfo",
                    //     fileAction: true
                    // }
                    $scope.fileView = "<p>Viewer failed to load file.</p>";
                    $scope.loadPreview = true;
                    return false;
                }
    
                getExt = viewData.fileLoc.split('.')[1];
    
                switch (getExt) {
                    case 'HTM':
    
                        $scope.viewType = true;
    
                        previewService.getPreview(viewData).then(function(response) {
                            var cleared = response.data.replace(/face="Times New Roman"/g, '');
                            $scope.fileView = $sce.trustAsHtml(cleared);
                            $scope.loadPreview = true;
                        }, function(err) {
                            console.log('Error to load resource.')
                        });
                    break;
    
                    case 'PDF':
    
                        $scope.viewType = false;
                        PDFObject.embed($localStorage.host + viewData.fileLoc, "#pdfViewer", {height: "inherit"});
                        $scope.loadPreview = true;
                        break;
                    case 'WDL':

                        $scope.fileView = "<p class='not-support'>WDL are not compatible.</p>";
                        $scope.loadPreview = true;
                        break;
    
                    case (['jpg','png','gif'].indexOf(getExt.toLowerCase()) > -1 ? getExt :''):
                        $scope.viewType = true;
                        $scope.fileView = '<img class="img-responsive" src="'+$localStorage.host + viewData.fileLoc+'" />';
                        $scope.loadPreview = true;
                        break;
                    default:
                    console.log('blank');
                }
                
                $scope.loadPreview = true;
            }

           
        }, function(err){
            var data = { fileAction: false };
            $scope.setPopupDailog(true, "FAILED_SERVER", data);
        });
    }

    var arrayElements = [];
    var Current = -1;
    populateArray();
    function populateArray() {
        var SEARCH = 'search',
            FILTER = 'filter',
            DESCRIPTION = 'Description';
        var threadId = setInterval( function () {
            var searchElement = $('.wdx-SearchBox'),
                inputFilterElement = $('#wdFilterBox .dx-texteditor-input'),
                inputDescElement = $($('div.dx-datagrid-text-content:contains('+DESCRIPTION+')').parent().parent().siblings().find('td')[2]),
                leftMenuElements = $('#leftNav .left-nav-vert ul.nav li .subMenu-wrap');

            if ( document.readyState === 'complete' && searchElement.length !== 0 && inputFilterElement.length !==0 && inputDescElement.length !==0) {
                if(searchElement.length!==0) {
                    arrayElements.push('.focussed_'+SEARCH);
                    searchElement.addClass('focussed_'+SEARCH);
                }
                if(inputFilterElement.length!==0){
                    arrayElements.push('.focussed_'+FILTER);
                    inputFilterElement.addClass('focussed_'+FILTER);
                }
                if (inputDescElement.length!== 0 && inputDescElement.attr('aria-label').indexOf(DESCRIPTION) >= 0) {
                    arrayElements.push('.focussed_'+DESCRIPTION);
                    inputDescElement.find('input.dx-texteditor-input').addClass('focussed_'+DESCRIPTION);
                }

                $.each(leftMenuElements, function (index, value) {
                    var inputText = $(value).siblings().find('.nav-item-title').text().replace(/\s+/, "");
                    $(value).find('.ms-SearchBox-field').addClass('leftMenu_'+inputText);
                    arrayElements.push('.leftMenu_'+inputText);
                });
                clearInterval( threadId );
            }
        }, 100 );
    }

    /**
     * Focus elements tab-navigation.
     */
     $( document ).keyup(function(event) {
          var TAB_KEY = 9;
          if(!event.shiftKey && event.keyCode === TAB_KEY ){
            var elementFocus = next();
            elementFocused(elementFocus);
          }
          if (event.shiftKey && event.keyCode === TAB_KEY) {
            var elementFocus = prev();
            elementFocused(elementFocus);
          }

        function getCurrentFocus(activeElement) {
            var currentIndex;
            arrayElements.forEach(function (element, index){
                if(activeElement.attr('class').indexOf(element) >= 0) {
                    currentIndex = index;
                } else
                  currentIndex = Current;
            });
            return currentIndex--;
        }

         function next() {
           if(Current === arrayElements.length - 1)
              Current = 0
           else
              Current++;
          return Current;
         }
         function prev() {
           if(Current == 0)
              Current = arrayElements.length - 1;
           else
              Current--;
          return Current;
         }
         function elementFocused(elementFocus) {
             if (arrayElements[elementFocus].indexOf('leftMenu') >= 0) {
                 $(arrayElements[elementFocus]).parent().parent().siblings().trigger('click')
                 $(arrayElements[elementFocus]).focus();
             } else {
                $(arrayElements[elementFocus]).focus().click();
             }
         }
     });
}

