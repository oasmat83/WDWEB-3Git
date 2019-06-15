'use strict'
angular.module('WDWeb');
dataGridController.$inject = ['$scope', '$http', '$localStorage', '$location', '$q', '$window', 'fileListUI', 'uxService', 'wdService', 'uploader', 'homeService', '$rootScope', '$timeout', 'TIMEOUT'];
angular.module('WDWeb').controller('dataGridController', dataGridController);
function dataGridController($scope, $http, $localStorage, $location, $q, $window, fileListUI, uxService, wdService, uploader, homeService, $rootScope, $timeout, TIMEOUT) {
    var searchQuery = $location.search().query;
    var getQuery = $location.search();
    $scope.wdNumbPag = 50;
    $scope.before = 0;
    $scope.getQuery = getQuery;
    var fileID = {};
    var userAgent = $window.navigator.userAgent;
    var descFlag = true;
    var mouseLeftD1 = false;
    var mouseLeftD2 = false;
    var initialColumnChooser = $localStorage.ColumnsChooser || ["Doc ID", "Ver #", "Modified", "Categories", "Updated", "Size"];
    $scope.dwnIco;
    $scope.dwnTxt;
    $scope.openTypeSelected = {};
    $scope.openTypeVerList = {};
    $scope.wdPgLimit = -5;
    $scope.loaderTxt = "Loading..."
    var parameters = {};
    var urlParam = "";
    var verb = "";
    var wdListId = "";
    var config = {};
    var gridData;
    var gridRfId = 1;

    // Check on IE to toggle useKeyboard
    var isIE = /*@cc_on!@*/false || !!document.documentMode;

    $scope.showComments = true;
    if ($localStorage.showComments != undefined) {
        $scope.showComments = $localStorage.showComments;
    };
    $scope.selectedFile = "";
    $rootScope.host = $localStorage.host;
    $scope.listFailed = false;
    $scope.tableLoader = true;
    $scope.queryTitle = searchQuery;
    $scope.softpopFlag = 1;
    $scope.checked = false;
    $rootScope.tabTypeFlag = true;
    $scope.sortType = 1;
    $scope.sortFlag = false;
    $scope.columnID = "5375";
    $scope.shareMenu = [];
    $scope.loadingVisible = false;
    $scope.attach = false;
    $scope.gridMessage = "";
    $scope.showVersion = false;
    $scope.showComment = true;
    $scope.showDocID = false;
    $scope.showModified = false;
    $scope.sortColumn = 'asc';
    $scope.showCheckout = true;
    $scope.showWorkFlow = true;
    $scope.ttl_dsc = ' ';
    $scope.setIconWidth;
    $scope.showPagination = true;
    $rootScope.parentColumnChoose = "#btnColumnChooser";
    $scope.deleteValue = "";
    $scope.showSize = false;
    $scope.showCreated = false;
    $scope.showAccessed = false;
    $scope.showName = false;
    $scope.markModified = false;
    $scope.markSize = false;
    $scope.markCreated = false;
    $scope.markVersion = false;
    $scope.markAccessed = false;
    $scope.markDocId = false;
    $scope.maxWidthDesc = 20000;
    $scope.maxWidthCategories = 250;
    $scope.categoryMenu = [];
    $scope.showPageSize = false;
    $scope.pageSize = 50;
    $scope.hidePrev = false;
    $scope.pagination = [
        { 
            display: 1, 
            skip: 0, 
            take: $scope.wdNumbPag + parseInt(1),
            select: true
        }
    ];
    $scope.pageLimit = [];
    var paginate = false;
    $scope.messOnlyTitle = false;
    var clickTimer, lastRowCLickedId;

    $scope.$on("openReadOnly", function (e) {
        $scope.getResponse($scope.saveReadOnlyData.fileData, $scope.saveReadOnlyData.resData, $scope.saveReadOnlyData.folderData);
    });

    $scope.convertToJson = function(e) {
        return JSON.parse(e);
    }

    $scope.$on("setWDGridLoader", function (e) {
        $scope.removeLoader(true);
        $scope.tableLoader = true;

    });

    $scope.chkWdFileStatus = function(x) {
        if (x == undefined) {
            return false;
        }
        var idx = (x.indexOf($localStorage.userData.user) != -1);
        return idx;
    }

    $scope.titlePopupFileChangedOptions = "Error";
    $scope.popupFileChangedOptions = {
        width: 'auto',
        height: 'auto',
        maxWidth: '90vw',
        contentTemplate: "popupFileChangedTemplate",
        showTitle: true,
        dragEnabled: false,
        closeOnOutsideClick: false,
        bindingOptions: {
            title: "titlePopupFileChangedOptions",
            visible: "visiblePopupFileChangedOptions",
        }
    };

    $scope.visiblePopupFileChangedOptions = false;
    $rootScope.$on("setConfirmHashChanged", function(event, data) {
        $rootScope.confirmChangeHash = data.fnc;
    })
    $rootScope.$on("showMessageWhenFileChanged", function(event, data) {
        $scope.titlePopupFileChangedOptions = data.title;
        $scope.fileChange = {};
        $scope.fileChange.wdMsg = "The file has changed, please click 'OK' to refresh the list";
        $scope.fileChange.docid = data.docid;
        $scope.fileChange.desc = data.desc;
        $scope.fileChange.action = data.title;
        $scope.fileChange.icon = data.title;
        $scope.checked = false;
        $scope.hashData = data;
        switch (data.title) {
            case 'Download':
                $scope.fileChange.action = 'Download'
                $scope.fileChange.icon = 'Download';
                break;
            case 'Check-Out':
                $scope.fileChange.action = 'Check-Out'
                $scope.fileChange.icon = 'PageCheckedOut';
                break;
            case 'Edit Metadata':
                $scope.fileChange.action = 'Edit Metadata'
                $scope.fileChange.icon = 'Edit';
                break;
            case 'Copy':
                $scope.fileChange.action = 'Copy';
                $scope.fileChange.icon = 'Copy';
                break;
            case 'Email':
                $scope.fileChange.action = 'Email'
                $scope.fileChange.icon = 'Mail';
                break;
            case 'View':
                $scope.fileChange.action = 'View'
                $scope.fileChange.icon = 'EntryView';
                break;
            case 'Move':
                $scope.fileChange.action = 'Move'
                $scope.fileChange.icon = 'Move';
                break;
            case 'Delete':
                $scope.fileChange.action = 'Delete'
                $scope.fileChange.icon = 'Delete';
                break;
            case 'Revert':
                $scope.fileChange.action = 'Revert'
                $scope.fileChange.icon = 'PageCheckedin';
                break;
            case 'Overwrite':
                $scope.fileChange.action = 'Overwrite'
                $scope.fileChange.icon = 'PageCheckedin';
                break;
            case 'New Version':
                $scope.fileChange.action = 'New Version'
                $scope.fileChange.icon = 'PageCheckedin';
                break;
            default:
                $scope.fileChange.action = 'Edit Metadata'
                $scope.fileChange.icon = 'Edit';
                break;
        }
        $('#popupFileChangedOptions').dxPopup().dxPopup("instance").show();
    });

    $rootScope.$on("hideMessageWhenFileChanged", function(event, data) {
        $('#popupFileChangedOptions').dxPopup().dxPopup("instance").hide();
        $scope.$parent.checked = false;
        $scope.$parent.wdView = false;
    });
    $rootScope.$on("hideProlieView", function(event, data) {
        //$scope.$parent.checked = false;
    });
    $scope.cancelCommandChangeFile = function(){
        $rootScope.$broadcast('hideMessageWhenFileChanged');
    }

    $scope.$on("readOnly", function (e) {
        $window.location = $scope.readOnlyUrl;
        $timeout(function(){
            $scope.readOnlyUrl = "";
        }, 1000)
    });

    $scope.confirmChangeHash = function() {
        var popup = $("#popupFileChangedOptions").dxPopup("instance"),
        grid = $("#gridContainer").dxDataGrid("instance");
        grid.refresh();
        popup.hide();
    }
    /*
     * ----------------- end popup file changed -------------
     * */

    $scope.titlePopupErrorLockOptions = "Error";
    $scope.popupLockErrorOptions = {
        width: 'auto',
        height: 'auto',
        maxWidth: '90vw',
        contentTemplate: "popupLockErrorTemplate",
        showTitle: true,
        dragEnabled: false,
        closeOnOutsideClick: false,
        bindingOptions: {
            title: "titlePopupErrorLockOptions",
            visible: "visiblePopupLockErrorOptions",
        }
    };

    $scope.visiblePopupLockErrorOptions = false;

    $rootScope.$on("showMessageLockError", function(event, data) {
        $scope.titlePopupErrorLockOptions = data.title;
        $scope.errLock = {};
        delete data.content[1];
        $scope.errLock.wdMsg = data.content;
        $scope.errLock.docid = data.docid;
        $scope.errLock.desc = data.desc;
        $scope.errLock.action = data.title;
        $scope.errLock.icon = data.title;
        switch (data.title) {
            case 'editProfile':
                $scope.errLock.action = 'Edit Metadata'
                $scope.errLock.icon = 'Edit';
                break;
            default:
                $scope.errLock.action = 'Edit Metadata'
                $scope.errLock.icon = 'Edit';
                break;
        }
        $('#popupLockError').dxPopup().dxPopup("instance").show();
    });

    $rootScope.$on("hidePopupErrorLock", function(event, data) {
        $('#popupLockError').dxPopup().dxPopup("instance").hide();
        $scope.$parent.checked = false;
        $scope.$parent.wdView = false;
    });

    $scope.confirmErrorLockPopup = function(){
        $rootScope.$broadcast('hidePopupErrorLock');
    }

    $scope.$on("updateDataGrid", function(e, data) {
    var grid = $("#gridContainer").dxDataGrid("instance")
        wdService.isFileHasChanged().then(function (hasChanged) {
            var changedData = hasChanged.res;
            if (changedData.Header.ErrorCount !== "") {
                var data = { fileAction: false };
                $rootScope.$broadcast("errorAction", {visible: true, rctx: changedData.Header.wd_Error_RCTX, data: data});
                return false
            }
            var source = grid.option('dataSource');
            source.store.update(hasChanged.res.items[0].DocId, hasChanged.res.items[0])
        });
    });

    $scope.$on("updateGridLoader", function(e, data) {
        $scope.loaderTxt = data.message;
        // $scope.tableLoader = true;
    });

    $scope.$on("fileAction", function (evt, data) {
        var grid = $("#gridContainer").dxDataGrid("instance");
        var getSelected = grid.getSelectedRowsData();
        var infoData = $("#gridContainer").dxDataGrid("instance").getSelectedRowsData().pop();
        switch (data.type) {
            case "download":
                $scope.download(grid.getSelectedRowsData()[0]);
                break;
            case "checkOut":
                checkoutRecords(data.data);
                break;
            case "editProfile":
                wdService.lockFile().then(function (lock) {
                    if(!lock.error){
                        var getTopObj = {
                            "row": {
                                "data": grid.getSelectedRowsData().pop()
                            }
                        }
                        homeService.setSelected(grid.getSelectedRowsData());
                        $scope.$parent.selectedTab = "Profile";
                        $rootScope.$broadcast('editIcon', { "flag": data.profile, "newData": data.meta[0] });
                        $scope.toggle(getTopObj.row.data, true);
                        $rootScope.chkedPanel = {
                            width: "80%",
                            panel: true
                        }
                        $scope.$parent.checked = true;
                    } else {
                        var setDialogData = {title: "Lock", desc: grid.getSelectedRowsData().pop().Description, doc: grid.getSelectedRowsData().pop().DocId, action: "PageLock, wdInfo", fileAction: true}
                        $scope.setPopupDailog(true, lock.res.data.fileStatus.errorStatus.wd_Error_RCTX, setDialogData);
                    }
                })
                break;
            case "eMail":
                // var gridModel = fileListUI.getDataGridControlerScope(data.data);
                var getTopObj = {
                    "row": {
                        "data": grid.getSelectedRowsData().pop()
                    }
                }
                homeService.setSelected(data.meta[0]);
                // $("#tabPanelItems").dxTabPanel("instance").option("selectedIndex", 1);
                $scope.toggle(getTopObj.row.data, true);
                $scope.$parent.dialogTitle = data.profile;
                $rootScope.chkedPanel = {
                    width: "50%",
                    panel: false
                }
                $scope.$parent.checked = true;
             
                break;
            case "view":
                var selectedData = getSelected.pop();
                if (selectedData.GT == "WDL") {
                    $scope.$parent.wdView = false;
                    var decodeWdl = decodeURIComponent(selectedData.FilePath + '\\' + selectedData.DocId);
                    var encodeWdl = encodeURIComponent(decodeWdl);
                    $window.open('./home?query=Project: ' + encodeURIComponent(encodeWdl), '_blank');
                } else {
                    $scope.$parent.wdView = !$scope.$parent.wdView;
                    if ($scope.$parent.wdView) {
                        var getTopObj = {
                            "row": {
                                "data": selectedData
                            }
                        }
                        
                        var gridModel = fileListUI.getDataGridControlerScope(data.data);
                        $scope.$parent.wdView = true;
                        $('#gridContainer').css("max-width", "none").css("width", "");
                        loadPreview($scope.gridData.component, $scope.gridData.component.getSelectedRowsData().pop(), $scope.gridData);
                        setTimeout(function () {
                            $("#listTitle").css({ 'max-width': "0px", "width": "0px" });
                            grid._windowResizeCallBack();
                            $rootScope.setTitleHeaderWidth();
                        }, -1);
                    }else{
                        var getLeftNavWidth = $("#leftNav").dxResizable("instance").option("width");
                        $("#gridContainer").css("width", (window.innerWidth - getLeftNavWidth)).css("max-width", (window.innerWidth - getLeftNavWidth));
                        $("#listTitle").css({'max-width': "0px", "width" : "0px"});
                        $("#gridContainer").dxDataGrid("instance")._windowResizeCallBack();
                    }
                }
               
                break;
            case "reFresh":
                $scope.tableLoader = true;
                $scope.removeLoader(true);
                grid.refresh();
        }
    });

    $scope.$on("fileActionOpen", function (evt, data) {
        if (data.listId) {
            $scope.setVersion(data.data);
            return false;
        }
        $scope.chkDwnLoadType(data);
    });
    $scope.filterValue = '';
    $scope.wdFilterBox = {
        placeholder: "Filter",
        elementAttr: {
            class: "wdFilterBox",
            id: "wdFilterBox"
        },
        onEnterKey: function (e) {
            if(e.event.target.value!= '' || (e.event.target.value== '' && $scope.filterValue!='')){
                $scope.tableLoader = true;
                $scope.removeLoader(true);
                $scope.filterValue = e.event.target.value;
                $scope.filterGrid();
                if(e.event.target.value== '' && $scope.filterValue==''){
                    $(".wdFilterBtn").dxButton("instance").option('visible',false);
                }else{
                    $(".wdFilterBtn").dxButton("instance").option('visible',true);
                }
            }
        },
        showClearButton: true,
        onKeyUp: function(e){
            if(e.event.target.value== '' && $scope.filterValue==''){
                $(".wdFilterBtn").dxButton("instance").option('visible',false);
            }else{
                $(".wdFilterBtn").dxButton("instance").option('visible',true);
            }
        }
    }

    $scope.wdFilterBtn = {
        icon: "ms-Icon ms-Icon--Accept",
        onClick: function (e) {
            var wdFilter = $("#wdFilterBox").dxTextBox("instance"),
                textValue = wdFilter.option("value");
            if(textValue!= '' || (textValue== '' && $scope.filterValue!='')){
                $scope.filterValue = textValue;
                $scope.filterGrid(textValue);
                $scope.tableLoader = true;
                $scope.removeLoader(true);
                if(textValue == '' && $scope.filterValue==''){
                    $(".wdFilterBtn").dxButton("instance").option('visible',false);
                }else{
                    $(".wdFilterBtn").dxButton("instance").option('visible',true);
                }
            }
        },
        elementAttr: {
            class: "wdFilterBtn"
        },
        visible: false

    }

    $scope.filterGrid = function (e) {
        var gridSource = $("#gridContainer").dxDataGrid("instance"),
        selectedRow = gridSource.getSelectedRowsData()[0],
        setParam = {
            skip: 0,
            take: 51
        };
        
        $scope.filterFlag = true;
        $scope.loadPagination(undefined, setParam);
    }

    $scope.setCatIco = function(e) {
        return $rootScope.host + e.CI; 
    }

    $scope.chkDwnLoadType = function (x) {
        if (getQuery.attach && x.attType) {
            $scope.$parent.changeDialogOption = false;
            return false;
        }
        $scope.download(x.data);
    }

    // Set line number of Comment
    $scope.commentLineNumber = "";

    // Set Font by API
    // The font underlined
    $scope.fontUnderline = 'unset';
    // The font Italic
    $scope.fontItalic = 'normal';
    // Does the font have strikeout
    $scope.fontStrikeout = 0;
    // Font color
    $scope.fontColor = '#333';
    // Padding left
    $scope.fontPaddingl = 0;
    // Padding right
    $scope.fontPaddingr = 0;
    // Padding top
    $scope.fontPaddingt = 0;
    // Padding bottom
    $scope.fontPaddingb = 0;
    // Corresponds to line in customize dialog
    $scope.fontSectionLabel = 'Hide Comments';
    if ($scope.showComments == false) {
        $scope.fontSectionLabel = 'Display Comments';
    }
    // Font name
    $scope.fontName = 'Calibri';
    // Font ID
    $scope.fontId = 0;
    // Font size
    $scope.fontPointsize = 14;
    // Font weight
    $scope.fontWeight = 400;
    // Font height
    $scope.fontHeight = 20;
    $scope.fontStyle = [];

    $scope.setFontData = function () {
        $http.get($localStorage.host + 'cgi-bin/wdwebcgi.exe?FONTGET+wd_SID=' + $localStorage.userData.session + '+html=/api/font/getfonts.json+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now())
            .then(function (response) {
                $scope.setCss(response.data.root.items);
                $scope.commentLineNumber = parseInt(response.data.root.Extra.MaxCommentLines);
                if (navigator.userAgent.indexOf("Firefox") != -1) {
                    $scope.commentLineNumber += parseInt(1);
                }

                if (response.data.root) {
                    $scope.fontStyle = response.data.root.items.map(function (item) {
                        return item
                    });


                    $scope.fontStyle = angular.fromJson($scope.fontStyle);

                    for (var i = 0; i < $scope.fontStyle.length; i++) {
                        var temp = $scope.fontStyle[i]["crTEXT"];
                        if (temp < 0) {
                            temp = 0xFFFFFFFF + temp + 1;
                        }
                        $scope.fontStyle[i]["crTEXT"] = temp.toString(16).toUpperCase();
                        if ($scope.fontStyle[i]['bITALIC'] == 1) {
                            $scope.fontStyle[i]['bITALIC'] = 'italic';
                        } else {
                            $scope.fontStyle[i]['bITALIC'] = 'normal'
                        }
                        if ($scope.fontStyle[i]['bUNDERLINE'] == 1 || $scope.fontStyle[i]['bSTRIKEOUT'] == 1) {
                            if ($scope.fontStyle[i]['bUNDERLINE'] == 1) {
                                $scope.fontStyle[i]['bUNDERLINE'] = 'underline';
                            } else {
                                $scope.fontStyle[i]['bUNDERLINE'] = 'line-through';
                            }
                        } else {
                            $scope.fontStyle[i]['bUNDERLINE'] = 'unset';
                        }
                        var screenHeight = screen.height;
                        //$scope.fontStyle[i]['uHEIGHT'] = 10*(-$scope.fontStyle[i]['uHEIGHT']*72)/screenHeight;
                        $scope.fontStyle[i]['uHEIGHT'] = '1.1em';
                    }
                }

            }, function (err) {
                var data = { fileAction: false };
                $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
            });
    };

    //get API Property line
    $scope.propertyLineSetting = [];
    $http.get($localStorage.host + 'cgi-bin/wdwebcgi.exe?SERVE+wd_SID=' + $localStorage.userData.session + '+html=/api/ini/iniRead.json+szSection=List%20View+szINI=1+szKey=PropLineProfIDs+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now())
        .then(function (response) {
            if (response.data.root) {
                var str_propLine = response.data.root.PropLineProfIDs;
                $scope.propertyLineSetting = str_propLine.split(",");
                for (var i = 0; i < $scope.propertyLineSetting.length; i++) {
                    switch ($scope.propertyLineSetting[i]) {
                        case "4":
                            $scope.showModified = true;
                            $scope.markModified = true;
                            break;
                        case "6":
                            $scope.showSize = true;
                            $scope.markSize = true;
                            break;
                        case "9":
                            $scope.showCreated = true;
                            $scope.markCreated = true;
                            break;
                        case "20":
                            $scope.showVersion = true;
                            $scope.markVersion = true;
                            break;
                        case "23":
                            $scope.showAccessed = true;
                            $scope.markAccessed = true;
                            break;
                        case "2":
                            $scope.showDocID = true;
                            $scope.markDocId = true;
                            break;
                    }
                }
                for (var i = 0; i < initialColumnChooser.length; i++) {
                    if (initialColumnChooser[i] == "Comments") {
                        $scope.showComments = false;
                    }
                    if (initialColumnChooser[i] == "Ver #") {
                        $scope.showVersion = false;
                    }
                    if (initialColumnChooser[i] == "Modified") {
                        $scope.showModified = false;
                    }
                    if (initialColumnChooser[i] == "Doc ID") {
                        $scope.showDocID = false;
                    }
                    if (initialColumnChooser[i] == "Size") {
                        $scope.showSize = false;
                    }
                    if (initialColumnChooser[i] == "Created") {
                        $scope.showCreated = false;
                    }
                    if (initialColumnChooser[i] == "Accessed") {
                        $scope.showAccessed = false;
                    }
                }
            }
        }, function (response) {
            var data = { fileAction: false };
            $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
        });
    $scope.multiple = false;
    $scope.accept = "*";
    $scope.value = [];
    $scope.uploadMode = "instantly";
    $scope.selectedText = "";

    //Move this code to top
    // $scope.widthDes = (($scope.getWidth)*35)/100;
    $scope.widthDes = "75%";
    //Set auto size for width of Description
    if ($(window).width() <= 1024) {
        $scope.widthDes = "30%";
    }

    $scope.widthFit = "240";
    //Set auto size for width of Filter textbox
    if ($(window).width() <= 414) {
        $scope.widthFit = 295;
    }
    if ($(window).width() <= 375) {
        $scope.widthFit = 255;
    }
    if ($(window).width() <= 360) {
        $scope.widthFit = 240;
    }
    if ($(window).width() <= 320) {
        $scope.widthFit = 200;
    }

    if ($localStorage.ColumnsChooser) {
        var arr_widthcolumn = $localStorage.ColumnsWidths;
        var arr_columnchooser = $localStorage.ColumnsChooser;
        for (var i = 0; i < arr_widthcolumn.length; i++) {
            switch (arr_columnchooser[i]) {
                case "Ver #":
                    $scope.widthVer = arr_widthcolumn[i];
                    break;
                case "Doc ID":
                    $scope.widthDocID = arr_widthcolumn[i];
                    break;
                case "Categories":
                    $scope.widthCategories = arr_widthcolumn[i];
                    break;
                case "Created":
                    $scope.widthCreated = arr_widthcolumn[i];
                    break;
                case "Accessed":
                    $scope.widthAccessed = arr_widthcolumn[i];
                    break;
                case "Updated":
                    $scope.widthUpdated = arr_widthcolumn[i];
                    break;
                case "Modified":
                    $scope.widthUpdated = arr_widthcolumn[i];
                    break;
                case "Size":
                    $scope.widthSize = arr_widthcolumn[i];
                    break;
                case "Cabinet":
                    $scope.widthCabinet = arr_widthcolumn[i];
                    break;
                case "Location":
                    $scope.widthLocation = arr_widthcolumn[i];
                    break;
            }
        }
        $scope.widthDes = $localStorage.DescriptionWidth;
    } else {
        $scope.widthVer = 70;
        $scope.widthDocID = 120;
        $scope.widthCategories = 180;
        $scope.widthCreated = 180;
        $scope.widthAccessed = 180;
        $scope.widthModified = 180;
        $scope.widthUpdated = 180;
        $scope.widthSize = 80;
        $scope.widthCabinet = 100;
        $scope.widthLocation = 200;
    }

    $scope.setCss = function (x) {
        let styling = $scope.processCssStylingResponse(x);

        let chkOutLabel = styling.fileListCheckoutLabel !== undefined ? 
            '.chkLabel {' +
            'font-size:' + styling.fileListCheckoutLabel.uPOINTSIZE + 'pt;' +
            'font-family:' + styling.fileListCheckoutLabel.szFACENAME + ';' +
            'font-style:' + (styling.fileListCheckoutLabel.bITALIC !== "0" ? "italic" : "normal") + ';' +
            'font-weight:' + styling.fileListCheckoutLabel.uWEIGHT + ';' +
            'color:' + styling.fileListCheckoutLabel.crTEXT + ';}' : '';

        let chkOutName = styling.fileListCheckoutValue !== undefined ? 
            '.chkName {' +
            'font-style:' + (styling.fileListCheckoutValue.bITALIC !== "0" ? "italic" : "normal") + ';' +
            'font-family:' + styling.fileListCheckoutValue.szFACENAME + ';' +
            'font-weight:' + styling.fileListCheckoutValue.uWEIGHT + ';' +
            'font-size:' + styling.fileListCheckoutValue.uPOINTSIZE + 'pt;' +
            'line-height:' + styling.fileListCheckoutValue.uHEIGHT + 'px;' +
            'text-decoration:' + (styling.fileListCheckoutValue.bUNDERLINE !== "0" ? "underline" : "normal") + ';' +
            'color:' + styling.fileListCheckoutValue.crTEXT + ';}' : '';

        let chkInLink = styling.fileListCheckoutLabel !== undefined ? 
            '.chkLink {' +
            'font-size:' + styling.fileListCheckoutLabel.uPOINTSIZE + 'pt;}' : '';

        let chkOutPadding = styling.fileListCheckoutLabel !== undefined ? 
            '.chkPadding {' +
            'padding-top:' + styling.fileListCheckoutLabel["RC.TOP"] + 'px;' +
            'padding-bottom:' + styling.fileListCheckoutLabel["RC.BOTTOM"] + 'px;}' : '';

        let commLine = styling.fileListComments !== undefined ? 
            '.commLine {' +
            'font-size:' + styling.fileListComments.uPOINTSIZE + 'pt;' +
            'font-family:' + styling.fileListComments.szFACENAME + ';' +
            'font-weight:' + styling.fileListComments.uWEIGHT + ';' +
            'font-style:' + (styling.fileListComments.bITALIC !== "0" ? "italic" : "normal") + ';' +
            'line-height:' + (-1 * styling.fileListComments.uHEIGHT) + 'px !important;' +
            'color:' + styling.fileListComments.crTEXT + ';' +
            'text-decoration:' + (styling.fileListComments.bUNDERLINE !== "0" ? "underline" : "none") + ';' +
            ' overflow: hidden; position: relative;}' : '';

        let commPadding = styling.fileListComments !== undefined ? 
            '.commPadding {' +
            'padding:' + styling.fileListComments["RC.TOP"] + 'px ' +
            styling.fileListComments["RC.RIGHT"] + 'px ' +
            styling.fileListComments["RC.BOTTOM"] + 'px ' +
            styling.fileListComments["RC.LEFT"] + 'px;}' : '';

        let propLineLabel = styling.fileListPropsLabel !== undefined ? 
            '.propLabel {' +
            'font-size:' + styling.fileListPropsLabel.uPOINTSIZE + 'pt;' +
            'font-family:' + styling.fileListPropsLabel.szFACENAME + ';' +
            'font-weight:' + styling.fileListPropsLabel.uWEIGHT + ';' +
            'font-style:' + (styling.fileListPropsLabel.bITALIC !== "0" ? "italic" : "normal") + ';' +
            'line-height:' + styling.fileListPropsLabel.uHEIGHT + 'px;' +
            'text-decoration:' + (styling.fileListPropsLabel.bUNDERLINE !== "0" ? "underline" : "none") + ';' +
            'color:' + styling.fileListPropsLabel.crTEXT + ';}' : '';

        let propLineValue = styling.fileListPropsValue !== undefined ? 
            '.propValue {' +
            'font-size:' + styling.fileListPropsValue.uPOINTSIZE + 'pt;' +
            'font-family:' + styling.fileListPropsValue.szFACENAME + ';' +
            'font-weight:' + styling.fileListPropsValue.uWEIGHT + ';' +
            'font-style:' + (styling.fileListPropsValue.bITALIC !== "0" ? "italic" : "normal") + ';' +
            'line-height:' + styling.fileListPropsValue.uHEIGHT + 'px;' +
            'text-decoration:' + (styling.fileListPropsValue.bUNDERLINE !== "0" ? "underline" : "none") + ';' +
            'color:' + styling.fileListPropsValue.crTEXT + ';}' : '';

        let propLineTop = styling.fileListPropsLabel !== undefined ? 
            '.propTopPadding {' +
            'padding-top:' + styling.fileListPropsLabel["RC.TOP"] + 'px;}' : '';

        let propLinePadding = styling.fileListPropsLabel !== undefined ? 
            '.propPadding {' +
            'padding:' + styling.fileListPropsLabel["RC.TOP"] + 'px ' +
            styling.fileListPropsLabel["RC.RIGHT"] + 'px ' +
            styling.fileListPropsLabel["RC.BOTTOM"] + 'px ' +
            styling.fileListPropsLabel["RC.LEFT"] + 'px;}' : '';

        let cssClasslineOne = styling.fileListProfiles !== undefined ? 
            '.lineOne {' +
            'font-size:' + styling.fileListProfiles.uPOINTSIZE + 'pt;' +
            'font-family:' + styling.fileListProfiles.szFACENAME + ';' +
            'font-weight:' + styling.fileListProfiles.uWEIGHT + ';' +
            'font-style:' + (styling.fileListProfiles.bITALIC !== "0" ? "italic" : "normal") + ';' +
            'text-decoration:' + (styling.fileListProfiles.bUNDERLINE !== "0" ? "underline" : "none") + ';' +
            'color:' + styling.fileListProfiles.crTEXT + ';}' : '';

        let topPadding = styling.fileListProfiles !== undefined ? 
            '.topPadding {' +
            'padding-top:' + styling.fileListProfiles['RC.TOP'] + 'px }' : '';

        var mergedCss = cssClasslineOne + chkOutLabel + chkOutName + chkInLink + commLine + commPadding + propLineLabel + propLineValue /*+ topPadding*/ + propLinePadding + propLineTop + chkOutPadding + propLinePadding;
        var css = document.createElement("style");
        css.type = "text/css";
        css.innerHTML = mergedCss;
        document.body.appendChild(css);
    };


    $scope.processCssStylingResponse = function (x) {
        let styling = {};

        x.forEach(function (styleItem) {
            switch (styleItem.szLABEL) {
                case 'File List Bottom Line':
                    styling.fileListBottomLine = styleItem;
                    break;
                case 'File List Comments':
                    styling.fileListComments = styleItem;
                    break;
                case 'File List WorkFlow Value':
                    styling.fileListWorkflowValue = styleItem;
                    break;
                case 'File List WorkFlow Label':
                    styling.fileListWorkflowLabel = styleItem;
                    break;
                case 'File List TextHits Value':
                    styling.fileListTextHitsValue = styleItem;
                    break;
                case 'File List TextHits Label':
                    styling.fileListTextHitsLabel = styleItem;
                    break;
                case 'File List Checkout Value':
                    styling.fileListCheckoutValue = styleItem;
                    break;
                case 'File List Checkout Label':
                    styling.fileListCheckoutLabel = styleItem;
                    break;
                case 'File List Props Value':
                    styling.fileListPropsValue = styleItem;
                    break;
                case 'File List Props Label':
                    styling.fileListPropsLabel = styleItem;
                    break;
                case 'File List Profiles':
                    styling.fileListProfiles = styleItem;
                    break;
            }
        });
        return styling;
    };

    $scope.gridShading = true;
    $scope.wdGridLoader = {
        shading: "gridShading",
        shadingColor: "rgba(256,256,256,1.0)",
        position: { of: "#gridContainer .dx-datagrid-rowsview " },
        bindingOptions: {
            visible: "tableLoader",
            message: "loaderTxt"
        },
        elementAttr: {
            class: "gridLoader"
        }
    }
    $scope.items = {};
    $rootScope.temp_description = 'Description';
    $rootScope.temp_docid = 'Doc ID';
    $rootScope.temp_version = 'Ver#';
    $rootScope.temp_modified = 'Modified';
    $rootScope.temp_comment = 'Comments';
    $rootScope.temp_descrcomment = '';
    $rootScope.temp_created = 'Created';
    $rootScope.temp_accessed = 'Accessed';
    $rootScope.temp_size = 'Size';
    $rootScope.temp_cabinet = 'Cabinet';
    $rootScope.temp_location = 'Location';
    $rootScope.temp_categories = 'Categories';
    $rootScope.temp_checkoutLabel = 0;
    $rootScope.temp_checkoutValue = 0;
    $rootScope.temp_name = 'Name';
    $rootScope.temp_status = 0;
    $rootScope.lastVersionFile = 0;
    $rootScope.versionlist = false;

    var orders = new DevExpress.data.CustomStore({
        key: ["DocId", "Version"],
        load: function (loadOptions) {
            if (!paginate) {
                switch ($scope.sortFlag) {
                    case false:
                        if (!getQuery.typeid) {
                            urlParam = '+html=/api/filelist/fileList.json+wd_FIND_QUERY=' + searchQuery;
                            verb = "FINDFILES";
                            $rootScope.versionlist = false;
                        } else if (getQuery.typeid == "template") {
                            $scope.queryTitle = 'Template: ' + getQuery.temp;
                            urlParam = '+html=/api/filelist/fileList.json+wd_File_Xname_Filter=' + getQuery.xName + '+wd_File_Filename_Filter=' + getQuery.fName + '+wd_File_AccessDate_Filter=' + getQuery.access + '+wd_File_Created_Filter=' + getQuery.create + '+wd_File_Updated_Filter=' + getQuery.modified + '+wd_File_Text_Filter=' + getQuery.text + '+wd_File_ProfileGroup_Filter=' + getQuery.cabinet + '+wd_File_Field1_Filter=' + getQuery.field1 + '+wd_File_Field2_Filter=' + getQuery.field2 + '+wd_File_Field3_Filter=' + getQuery.field3 + '+wd_File_Field4_Filter=' + getQuery.field4 + '+wd_File_Field5_Filter=' + getQuery.field5 + '+wd_File_Field6_Filter=' + getQuery.field6 + '+wd_File_Field7_Filter=' + getQuery.field7;
                            verb = "FINDFILES";
                            $rootScope.versionlist = false;
                        } else if (getQuery.typeid == "version") {
                            urlParam = '+html=/api/filelist/fileList.json+wd_List_ID=' + getQuery.verid + '+Wd_List_RecNum=' + getQuery.verRec + '+Wd_File_Sort_Key1=' + $localStorage.columnId.version;
                            verb = "VERLIST";
                            $rootScope.versionlist = true;
                        } else if (getQuery.typeid == 'filter'){
                            urlParam = '+html=/api/filelist/rereadRecord.json+wd_List_ID=' + getQuery.listid + '+wd_List_Filter=' + getQuery.query;
                            verb = "SERVE";
                            $rootScope.versionlist = false;
                        } 
                        else {
                            urlParam = '+html=/api/filelist/fileList.json+wd_List_RecNum=' + getQuery.recId + '+wd_List_ID=' + getQuery.listId + '+wd_List_Flags=' + getQuery.flagId + '+typeid=' + getQuery.typeid;
                            verb = "TREEOPEN";
                            $rootScope.versionlist = false;
                        }
                        break;
                    default:
                        verb = "SORTFILES";
                        urlParam = "+html=/api/filelist/fileList.json+wd_List_ID=" + $localStorage.wdListID;
                }

                parameters.take = loadOptions.take || 51;
            }
            else {
                var wdSearchfilter = "",
                verb = "SERVE";

                $rootScope.versionlist = false;
                if ($scope.filterFlag) {
                    wdSearchfilter = '+wd_List_Filter=' + $scope.filterValue;     
                }
                urlParam = '+html=/api/filelist/filterList.json+wd_List_ID=' + $localStorage.wdListID + wdSearchfilter;
            }

            if (loadOptions.skip) {
                parameters.skip = parseInt(loadOptions.skip) + 1 || 0;
            } else {
                parameters.skip = 0;
            }

            if (loadOptions.sort) {
                parameters.orderby = loadOptions.sort[0].selector;
                if (loadOptions.sort[0].desc)
                    parameters.orderby += " desc";
            }

            config = {
                params: parameters
            };

            var config = {
                "Content-Type": "application/x-www-form-urlencoded"
            }

            $scope.wdListTake = parameters.take;
            var columnStr = JSON.stringify(fileListUI.getColumns());

            var req = {
                method: 'POST',
                url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?' + verb + '+wd_SID=' + $localStorage.userData.session + urlParam + '+skip=' + parameters.skip + '+take=' + parameters.take + '+Wd_File_Sort_Key1=' + $scope.columnID + '+wd_File_Sort_Dir1=' + $scope.sortType + wdListId + '+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now(),
                headers: {'Content-Type': 'application/x-www-form-urlencoded' },
                transformRequest: function(obj) {
                    var str = [];
                    for(var p in obj)
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    return str.join("&");
                },
                timeout: TIMEOUT.FINDFILES
                // data: {szJSON: encodeURIComponent(columnStr + ',')}
            }
            return $http(req)
            // return $http.post($localStorage.host + 'cgi-bin/wdwebcgi.exe?' + verb + '+wd_SID=' + $localStorage.userData.session + urlParam + '+skip=' + parameters.skip + '+take=' + parameters.take + '+Wd_File_Sort_Key1=' + $scope.columnID + '+wd_File_Sort_Dir1=' + $scope.sortType + wdListId + '+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now(), {data: {test: 'test'}}, {headers:{'Content-Type': 'application/x-www-form-urlencoded'}})
                .then(function (response) {
                    var wdFilterValue = $("#wdFilterBox").dxTextBox("instance").option("value");
                    $scope.wdTotalList = response.data.root.items.length;
                    $rootScope.title = response.data.root.Header.wd_Desc_Loc; 

                    if (wdFilterValue == "") {
                        $scope.listCount = response.data.root.Header.List_Count;
                    } else {
                        $scope.listCount = $scope.wdTotalList;
                    }


                    if (userAgent.indexOf('Frowser') != -1) {
                        $rootScope.pageTitle = response.data.root.Header.wd_Tab;
                    } else {
                        $rootScope.pageTitle = response.data.root.Header.wd_Tab.split(':')[1];
                    }

                    if (response.data.root.Header.ErrorCount !== "") {
                        var data = { fileAction: false };
                        $rootScope.$broadcast("errorAction", { visible: true, rctx: response.data.root.Header.wd_Error_RCTX, data: data });
                        return { data: [], totalCount: 0 };
                    }

                    else if (response.data.root.Header.ErrorCount != "" && response.data.root.Header.List_Count == "0") {
                        $scope.listFailed = true;
                        $scope.gridMessage = "No data found!";
                        return { data: [], totalCount: 0 };
                    }

                    else {

                        if (response.data.root.items == "") {
                            $scope.gridMessage = "No data found!";
                            return { data: [], totalCount: response.data.root.Header.List_Count };

                        } else {

                            var chkGrouping = response.data.root.Header.wd_Groupings;
                            $localStorage.wdListID = response.data.root.Header.List_ID;


                            if ($scope.callFlag) {
                                switch (chkGrouping) {
                                    case "1":
                                        var pushData = { dataField: "GT" };
                                        var grid = $("#gridContainer").dxDataGrid("instance");
                                        var columns = grid.option("columns");
                                        columns.push(pushData);
                                        grid.option("columns", columns);
                                        grid.columnOption("GT", "groupIndex", 0);
                                        break;
                                    case "0":
                                        break;

                                }
                                $scope.callFlag = false;
                            }
                            var items = response.data.root.items.map(function (item) {
                                return item
                            })
                            $scope.testcanvas = angular.element('#myCanvas');
                            $scope.testctx = $scope.testcanvas[0].getContext("2d");
                            $scope.testctx.font = "11pt Calibri";
                            for (var i = 0; i < items.length; i++) {
                                if ($rootScope.lastVersionFile < items[i].Version) {
                                    $rootScope.lastVersionFile = items[i].Version;
                                }
                                if (items[i].AccessedDate == "") {
                                    items[i].Accessed = "";
                                } else {
                                    var d = new Date(parseInt(items[i].AccessedDate * 1000));
                                    items[i].Accessed = (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear();
                                }
                                if (items[i].DateCreated == "") {
                                    items[i].Created = "";
                                } else {
                                    var d = new Date(parseInt(items[i].DateCreated * 1000));
                                    items[i].Created = (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear();
                                }
                                if ($scope.testctx.measureText($rootScope.temp_description).width < $scope.testctx.measureText(items[i].Description).width) {
                                    $rootScope.temp_description = String(items[i].Description);
                                }
                                if ($rootScope.temp_docid.length < String(items[i].DocId).length) {
                                    $rootScope.temp_docid = String(items[i].DocId);
                                }
                                if (items[i].Version) {
                                    if ($rootScope.temp_version.length < String(items[i].Version).length) {
                                        $rootScope.temp_version = String(items[i].Version);
                                    }
                                }
                                if (items[i].Comments) {
                                    var str_comment_line = [];
                                    str_comment_line = items[i].Comments.split("\r\n");
                                    for (var t = 0; t < str_comment_line.length; t++) {
                                        if ($rootScope.temp_descrcomment.length < String(str_comment_line[t]).length) {
                                            $rootScope.temp_descrcomment = str_comment_line[t];
                                        }
                                    }
                                    items[i].firstLineComments = str_comment_line[0];
                                    if ($rootScope.temp_comment.length < str_comment_line[0].length) {
                                        $rootScope.temp_comment = String(str_comment_line[0]);
                                    }
                                }

                                if ($rootScope.temp_size.length < String(items[i].Size).length) {
                                    $rootScope.temp_size = String(items[i].Size);
                                }
                                if ($rootScope.temp_cabinet.length < String(items[i].Cabinet).length) {
                                    $rootScope.temp_cabinet = String(items[i].Cabinet);
                                }
                                if ($rootScope.temp_location.length < String(items[i].Location).length) {
                                    $rootScope.temp_location = String(items[i].Location);
                                }
                                if ($rootScope.temp_name.length < String(items[i].Name).length) {
                                    $rootScope.temp_name = String(items[i].Name);
                                }
                                if (items[i].CAT_ID) {
                                    var str_num = '';
                                    for (var k = 0; k < items[i].CAT_ID.length; k++) {
                                        str_num += ', ' + String(items[i].CAT_ID[k].CD);
                                    }
                                    if ($rootScope.temp_categories.length < str_num.length) {
                                        $rootScope.temp_categories = str_num;
                                    }
                                }
                                if (items[i].CHKOUT_TO_LINE!="") {
                                    $scope.canvas_checkoutLabel = angular.element('#myCanvas_checkoutLabel');
                                    $scope.ctx_checkoutLabel = $scope.canvas_checkoutLabel[0].getContext("2d");
                                    if ($scope.fontStyle[7] === undefined) {
                                        $scope.ctx_checkoutLabel.font = "9pt Calibri";
                                    } else {
                                        $scope.ctx_checkoutLabel.font = $scope.fontStyle[7]['uPOINTSIZE'] + "pt " + $scope.fontStyle[7]['szFACENAME'];
                                    }
                                    var label_str = String(items[i].CHKOUT_TO_PREF) + String(items[i].CHKOUT_ON_PREF);
                                    if (items[i].CHKOUT_TO_LINE!="") {
                                        label_str += 'Check-In    ';
                                    }
                                    var width_label = $scope.ctx_checkoutLabel.measureText(label_str).width;
                                    if (width_label > $rootScope.temp_checkoutLabel) {
                                        $rootScope.temp_checkoutLabel = width_label;
                                    }

                                    $scope.canvas_checkoutValue = angular.element('#myCanvas_checkotuValue');
                                    $scope.ctx_checkoutValue = $scope.canvas_checkoutValue[0].getContext("2d");
                                    if ($scope.fontStyle[6] === undefined) {
                                        $scope.ctx_checkoutValue.font = "10pt Calibri";
                                    } else {
                                        $scope.ctx_checkoutValue.font = $scope.fontStyle[6]['uPOINTSIZE'] + "pt " + $scope.fontStyle[6]['szFACENAME'];
                                    }
                                    var value_str = String(items[i].CHKOUT_TO_NAME) + String(items[i].CHKOUT_ON_DATE);
                                    var width_value = $scope.ctx_checkoutValue.measureText(value_str).width;
                                    if (width_value > $rootScope.temp_checkoutValue) {
                                        $rootScope.temp_checkoutValue = width_value;
                                    }
                                }
                                if (items[i].I != 49 && items[i].I != 48 && items[i].I != 0 && items[i].I != 'undefined') {
                                    $rootScope.temp_status = 1;
                                }
                            }
                            $scope.items = items;

                            // var wdFilterValue = $("#wdFilterBox").dxTextBox("instance").option("value");
                            
                            // if (wdFilterValue == '' && $scope.filterValue == '') {
                            //     $scope.selectedFile = $scope.items[0].LN;
                            // } else {
                            //     $scope.selectedFile = 1;
                            // }

                            // $scope.selectedText = "File: " + $scope.selectedFile + "/" + $scope.listCount;
                            
                            if (userAgent.indexOf('Frowser') == -1) {
                                if (typeof $localStorage.currentFile != 'undefined') {
                                    $localStorage.currentFile.LID = response.data.root.Header.List_ID
                                    $scope.loadPreviewWhenStartup(items)
                                }
                            }
                            return { data: items, totalCount: response.data.root.Header.List_Count };
                        }
                    }


                }, function (err) {
                    // var data = { fileAction: false };
                    // $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
                    return { data: [], totalCount: 0 };
                });
        },
        update: function (loadOptions) {
            paginate = true;
            gridData.refresh();
            gridData.getScrollable().scrollTo(0);
                   
        }
    });

    $scope.hidePrevOnclick = function() {
        if ($scope.before == 1) {
            return true;
        }
        else {
            return false;
        }
    }

    $scope.loadPagination = function(x, y) {
        $scope.before = x;
        orders.update();
        // parameters.skip = y.skip;
        // parameters.take = y.take;
    }

    $scope.rowSetCate = '';
    $scope.contextualMenu = function (e) {
        $scope.rowSetCate = e;
        $scope.cat = {
            publicCat: [],
            personalCat: [],
            folderCat: []
        };
        var wdFilterValue = $("#wdFilterBox").dxTextBox("instance").option("value");

        if (wdFilterValue == '' && $scope.filterValue == '') {
            $scope.selectedFile = e.row.data.LN;
        } else {
            $scope.selectedFile = e.row.rowIndex + 1;
        }

        $scope.selectedText = "File: " + $scope.selectedFile + "/" + $scope.listCount;

        if (e.target !== "headerPanel" && e.row.rowType === 'data' && e.column.caption !== "Categories") {
            
            e.element = "<h1>" + e.row.data.Description + "</h1>";
            e.items = fileListUI.getContextMenu(e);

        } else if (e.target !== "headerPanel" && e.row.rowType === 'data' && e.column.caption == "Categories") {

            e.component.selectRows(e.row.key, false);
            $scope.noDub = [];
            $scope.catResponse = "";
            $scope.shareMenu = [
                {
                    text: 'Add Category',
                    icon: 'ms-Icon ms-Icon--Add',
                    items: $scope.subAddCategory,
                    onItemClick: function (vm) {
                        console.log(vm.component)
                    }
                },
                {
                    text: 'Create/Edit Categories',
                    icon: 'ms-Icon ms-Icon--SaveAs',
                    onItemClick: function (vm) {
                        $rootScope.$broadcast('categoryList', { cats: $scope.catResponse, file: e.row.data, type: "dataGrid" });
                        $scope.$parent.openCats = true;
                    }
                }
            ];

            $scope.categoryMenu = $scope.shareMenu;

            fileListUI.getCategoryList(e.row.data.FilePath).then(function (res) {
                $scope.catResponse = res.data.root;
                $scope.showCatType = {};
                var groupItem = [];

                if ($scope.catResponse.Header.Error_Count !== "") {
                    console.log($scope.catResponse.Header.Error_Count);
                    return false;
                }

                angular.forEach($scope.catResponse.Items, function (key, index) {
                    groupItem.push(key.TAB_NAME);
                    switch (key.TAB_NAME) {
                        case 'Public':
                            var updadedCat = {
                                text: key.CD,
                                icon: $rootScope.host + key.CI,
                                onItemClick: function (vm) {
                                    $scope.setCategory(key, e, false);
                                }
                            }
                            $scope.cat.publicCat.push(updadedCat);
                            break;
                        case 'Personal':
                            var updadedCat = {
                                text: key.CD,
                                icon: $rootScope.host + key.CI,
                                onItemClick: function (vm) {
                                    $scope.setCategory(key, e, false);
                                }
                            }
                            $scope.cat.personalCat.push(updadedCat);
                            break;
                        case 'Folder':
                            var updadedCat = {
                                text: key.CD,
                                icon: $rootScope.host + key.CI,
                                onItemClick: function (vm) {
                                    $scope.setCategory(key, e, false);
                                }
                            }
                            $scope.cat.folderCat.push(updadedCat);
                            break;
                    }
                });

                var removeDub = groupItem.filter(function (item, pos) {
                    return groupItem.indexOf(item) == pos;
                });


                angular.forEach(removeDub, function (key, index) {
                    $scope.setSubMenu = []
                    if (key == "Public") {
                        $scope.setSubMenu = $scope.cat.publicCat
                    }
                    else if (key == "Personal") {
                        $scope.setSubMenu = $scope.cat.personalCat
                    }
                    if (key == "Folder") {
                        $scope.setSubMenu = $scope.cat.folderCat
                    }
                    $scope.noDubKey = {};
                    $scope.noDubKey = {
                        text: key,
                        items: $scope.setSubMenu
                    }
                    $scope.noDub.push($scope.noDubKey);
                });

                angular.forEach(e.items, function (key, index) {
                    if (key.text == "Add Category") {
                        $scope.subAddCategory = $scope.noDub;
                    }
                });
            }, function (err) {
            });

            if (e.row.data.CAT_ID == "") {
                $scope.categoryMenu = $scope.shareMenu;
            } else {
                $scope.categorylist = [];
                var list = {};
                angular.forEach(e.row.data.CAT_ID, function (key, index) {
                    list = {
                        text: key.CD,
                        icon: $rootScope.host + key.CI,
                        items: [
                            {
                                text: 'Remove',
                                icon: 'ms-Icon ms-Icon--Remove',
                                onItemClick: function (vm) {
                                    $scope.setCategory(key, e, true);
                                }
                            }
                        ],

                    }
                    $scope.categorylist.push(list);
                });

                $scope.categoryMenu = $scope.categorylist.concat($scope.shareMenu);
            }
            e.items = $scope.categoryMenu;
        }

    }

    $scope.dataGridOptions = {
        //useKeyboard: isIE ? false : true,
        dataSource: {
            store: orders
        },
        bindingOptions: {
            rowAlternationEnabled: true,
            'pager.infoText': 'selectedText',
            'pager.showPageSizeSelector': 'showPageSize',
            'paging.pageSize': 'pageSize',
            'pager.allowedPageSizes': 'pageLimit'
        },
        allowColumnReordering: true,
        columnChooser: {
            // enabled: true,
            // mode: "select"
        },
        scrolling: {
            showScrollbar: 'always',
            useNative: true,
            // rowRenderingMode: 'virtual',
            renderingThreshold: 10000,
        },
        renderAsync: true,
        columnFixing: {
            enabled: true
        },
        // loadPanel: {
        //     enabled: true,
        //     shading: true,
        //     shadingColor: "rgba(256,256,256,1.0)",
        //     showPane: true
        // },
        columnAutoWidth: true,

        selection: {
            mode: "single",
            //allowSelectAll: true,
            selectAllMode: "page"
        },
        remoteOperations: {
            sorting: true,
            paging: true
        },
        pager: {
            allowedPageSizes: [50, 100, 150, 200, 250],
            showInfo: true,
            visible: true,
            showNavigationButtons: false,
        },
        // summary: {
        //     totalItems:[{
        //     displayFormat: "kfasjflkjflk",
        //     showInColumn: "Size",
        //     }]
        // },
        showColumnLines: false,
        showRowLines: true,
        rowAlternationEnabled: false,
        showBorders: true,
        hoverStateEnabled: true,
        tabIndex: -1,
        allowColumnResizing: true,
        onInitialized: function (e) {
            $scope.setFontData();
        },
        _columns: [
            {
                dataField: "",
                cellTemplate: "downLoadFile",
                showInColumnChooser: false,
                width: "22",
                // minWidth:"22",
                // maxWidth: "22",
                allowSorting: false,
                allowSearch: true,
            },
            {
                caption: "",
                dataField: "TypeStatus",
                cellTemplate: "fileSecurityIco",
                showInColumnChooser: false,
                width: "25",
                // minWidth:"25",
                // maxWidth: "50", 
                name: "ico",
                allowSorting: false,
                allowSearch: true
            },
            {
                caption: "Description",
                dataField: "Description",
                cellTemplate: "cellTemplate",
                showInColumnChooser: false,
                calculateCellValue: function (data) {
                    //calc date Modified
                    if (data.DateUpdated != "") {
                        var d = new Date(parseInt(data.DateUpdated * 1000));
                        var hours = d.getHours();
                        var minutes = d.getMinutes();
                        var ampm = hours >= 12 ? 'PM' : 'AM';
                        hours = hours % 12;
                        hours = hours ? hours : 12; // the hour '0' should be '12'
                        minutes = minutes < 10 ? '0' + minutes : minutes;
                        data.Modified = (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear() + "  " + hours + ':' + minutes + ' ' + ampm;
                        // return (d.getMonth()+ 1) + "/" + d.getDate() + "/" + d.getFullYear();
                    }
                    if (data.Description == "") {
                        var empty = "Blank Description";
                        return empty;
                    }
                    else {
                        return data.Description;
                    }
                },
                filterOperations: [],
                selectedFilterOperation: 'contains',
                allowFiltering: true,
                minWidth: "80",
                // width: $scope.widthDes,
                allowSearch: true,
                name: "Description, %:Xname%"
            },
            {
                caption: "Doc ID",
                dataField: "DocId",
                filterOperations: [],
                selectedFilterOperation: 'contains',
                minWidth: "60",
                width: $scope.widthDocID,
                calculateCellValue: function (data) {
                    var docid = data.DocId,
                    chkDocId = data.DocId.indexOf('<undefined>') > -1;
                    if (chkDocId) {
                        return "undefined." + data.GT.toLowerCase();
                    } else {
                        return docid;
                    };
                },
                visible: initialColumnChooser.indexOf('Doc ID') > -1,
                cellTemplate: function (element, info) {
                    // if($scope.fontStyle[10]=== undefined){
                    //     var cssColumn = 'style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size:11pt; font-style:normal; text-decoration:unset; color:rgb(78, 78, 78); padding-left:0px; padding-right:0px; padding-top:5px; padding-bottom:0px; font-family:Calibri; font-weight:400"';
                    // }else{
                    // }
                    var cssColumn = "style='overflow: hidden; white-space: nowrap; text-overflow: ellipsis;'";
                    element.append("<div class='topPadding'><div " + cssColumn + " class='lineOne'>" + info.text + "</div></div>");
                },
                allowSearch: true,
                name: "DocId, %:DOCID%"
            },
            {
                dataField: "Ver#",
                calculateCellValue: function (data) {
                    var ver = data.Version;
                    // if(ver)
                    //     return ver;
                    // else
                    return ver;
                },
                cellTemplate: "versionCell",
                filterOperations: [],
                selectedFilterOperation: 'contains',
                minWidth: "50",
                width: $scope.widthVer,
                visible: initialColumnChooser.indexOf('Ver #') > -1,
                allowSearch: true,
                name: "Version, %:VERSION%"
            },
            //mising API now
            {
                caption: "Modified",
                dataField: "DateUpdated",
                filterOperations: [],
                selectedFilterOperation: 'contains',
                sortOrder: 'desc',
                calculateCellValue: function (data) {
                    if (data.DateUpdated == "" || !data.DateUpdated || data.DateUpdated.indexOf('NaN') > -1) {
                        return null;
                    }
                    else {
                        var d = new Date(parseInt(data.DateUpdated * 1000));
                        var hours = d.getHours();
                        var minutes = d.getMinutes();
                        var ampm = hours >= 12 ? 'PM' : 'AM';
                        hours = hours % 12;
                        hours = hours ? hours : 12; // the hour '0' should be '12'
                        minutes = minutes < 10 ? '0' + minutes : minutes;
                        return (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear() + "  " + hours + ':' + minutes + ' ' + ampm;
                        // return (d.getMonth()+ 1) + "/" + d.getDate() + "/" + d.getFullYear();
                    }
                },
                minWidth: "70",
                width: $scope.widthModified,
                visible: initialColumnChooser.indexOf('Modified') > -1,
                cellTemplate: function (element, info) {
                    // if($scope.fontStyle[10]=== undefined){
                    //     var cssColumn = 'style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size:11pt; font-style:normal; text-decoration:unset; color:rgb(78, 78, 78); padding-left:0px; padding-right:0px; padding-top:5px; padding-bottom:0px; font-family:Calibri; font-weight:400"';
                    // }else{
                    //     var cssColumn = 'style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; '+"font-size:"+$scope.fontStyle[10]['uPOINTSIZE']+"pt; font-style:"+$scope.fontStyle[10]['bITALIC']+"; text-decoration:"+$scope.fontStyle[10]['bUNDERLINE']+"; color:"+$scope.fontStyle[10]['crTEXT']+"; padding-left:"+$scope.fontStyle[10]['RC.LEFT']+"px; padding-right:"+$scope.fontStyle[10]['RC.RIGHT']+"px; padding-top:"+$scope.fontStyle[10]['RC.TOP'] + "px; padding-bottom:"+$scope.fontStyle[10]['RC.BOTTOM']+"px; font-family:"+$scope.fontStyle[10]['szFACENAME']+"; font-weight:"+$scope.fontStyle[10]['uWEIGHT']+';"';
                    // }
                    var cssColumn = 'style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis;"';
                    element.append("<div class='topPadding'><div " + cssColumn + " class='lineOne'>" + info.text + "</div></div>");
                },
                allowSearch: true,
                name: "%:wUPDATED%"
            },
            {
                caption: "Comments",
                dataField: "comment",
                calculateCellValue: function (data) {
                    var cmt = data.firstLineComments;
                    if (cmt)
                        return cmt;
                    else
                        return '';
                },
                filterOperations: [],
                selectedFilterOperation: 'contains',
                minWidth: "70",
                width: $scope.widthDocID,
                visible: initialColumnChooser.indexOf('Comments') > -1,
                cellTemplate: function (element, info) {
                    // if($scope.fontStyle[10]=== undefined){
                    //     var cssColumn = 'style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size:11pt; font-style:normal; text-decoration:unset; color:rgb(78, 78, 78); padding-left:0px; padding-right:0px; padding-top:5px; padding-bottom:0px; font-family:Calibri; font-weight:400"';
                    // }else{
                    //     var cssColumn = 'style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; '+"font-size:"+$scope.fontStyle[10]['uPOINTSIZE']+"pt; font-style:"+$scope.fontStyle[10]['bITALIC']+"; text-decoration:"+$scope.fontStyle[10]['bUNDERLINE']+"; color:"+$scope.fontStyle[10]['crTEXT']+"; padding-left:"+$scope.fontStyle[10]['RC.LEFT']+"px; padding-right:"+$scope.fontStyle[10]['RC.RIGHT']+"px; padding-top:"+$scope.fontStyle[10]['RC.TOP'] + "px; padding-bottom:"+$scope.fontStyle[10]['RC.BOTTOM']+"px; font-family:"+$scope.fontStyle[10]['szFACENAME']+"; font-weight:"+$scope.fontStyle[10]['uWEIGHT']+';"';
                    // }
                    var cssColumn = 'style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis;"';
                    element.append("<div class='topPadding'><div " + cssColumn + " class='lineOne'>" + info.text + "</div></div>");
                },
                allowSearch: true
            },
            {
                caption: "Categories",
                dataField: "CD",
                filterOperations: [],
                selectedFilterOperation: 'contains',
                allowFiltering: true,
                minWidth: "75",
                width: $scope.widthCategories,
                visible: initialColumnChooser.indexOf('Categories') > -1,
                allowSearch: true,
                cellTemplate: "wdTags",
                allowSorting: false,
                headerCellTemplate: function (header, info) {
                    ;
                    header.append("<div style='cursor: default'>Categories</div>");
                    // $('div').html(info.column.caption).css('cursor', 'default').appendTo(header);
                }
                // cellTemplate:  function(element, info){
                //     var jsonConv = JSON.parse(info.data.CAT_ID);
                //     if (jsonConv !== "") {
                //         console.log(jsonConv);
                //         element.append("<div id='{{  }}'>test</div>");
                //         return false;
                //     }
                //     element.append("<div>nothing</div>");
                // },
            },
            {
                caption: "Created",
                dataField: "DateCreated",
                filterOperations: [],
                selectedFilterOperation: 'contains',
                calculateCellValue: function (data) {
                    if (data.DateCreated == "" || !data.DateCreated || data.DateCreated.indexOf('NaN') > -1) {
                        return null;
                    }
                    else {
                        var d = new Date(parseInt(data.DateCreated * 1000));
                        return (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear();
                    }
                },
                visible: initialColumnChooser.indexOf('Created') > -1,
                minWidth: "70",
                width: $scope.widthCreated,
                cellTemplate: function (element, info) {
                    // if($scope.fontStyle[10]=== undefined){
                    //     var cssColumn = 'style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size:11pt; font-style:normal; text-decoration:unset; color:rgb(78, 78, 78); padding-left:0px; padding-right:0px; padding-top:5px; padding-bottom:0px; font-family:Calibri; font-weight:400"';
                    // }else{
                    //     var cssColumn = 'style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; '+"font-size:"+$scope.fontStyle[10]['uPOINTSIZE']+"pt; font-style:"+$scope.fontStyle[10]['bITALIC']+"; text-decoration:"+$scope.fontStyle[10]['bUNDERLINE']+"; color:"+$scope.fontStyle[10]['crTEXT']+"; padding-left:"+$scope.fontStyle[10]['RC.LEFT']+"px; padding-right:"+$scope.fontStyle[10]['RC.RIGHT']+"px; padding-top:"+$scope.fontStyle[10]['RC.TOP'] + "px; padding-bottom:"+$scope.fontStyle[10]['RC.BOTTOM']+"px; font-family:"+$scope.fontStyle[10]['szFACENAME']+"; font-weight:"+$scope.fontStyle[10]['uWEIGHT']+';"';
                    // }
                    var cssColumn = 'style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis"';
                    element.append("<div class='topPadding'><div" + cssColumn + " class='lineOne'>" + info.text + "</div></div>");
                },
                allowSearch: true
            },
            {
                caption: "Accessed",
                dataField: "AccessedDate",
                filterOperations: [],
                selectedFilterOperation: 'contains',
                calculateCellValue: function (data) {
                    if (data.AccessedDate == "" || !data.AccessedDate || data.AccessedDate.indexOf('NaN') > -1) {
                        return null;
                    }
                    else {
                        var d = new Date(parseInt(data.AccessedDate * 1000));
                        return (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear();
                    }
                },
                visible: initialColumnChooser.indexOf('Accessed') > -1,
                minWidth: "70",
                width: $scope.widthAccessed,
                cellTemplate: function (element, info) {
                    // if($scope.fontStyle[10]=== undefined){
                    //     var cssColumn = 'style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size:11pt; font-style:normal; text-decoration:unset; color:rgb(78, 78, 78); padding-left:0px; padding-right:0px; padding-top:5px; padding-bottom:0px; font-family:Calibri; font-weight:400"';
                    // }else{
                    //     var cssColumn = 'style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; '+"font-size:"+$scope.fontStyle[10]['uPOINTSIZE']+"pt; font-style:"+$scope.fontStyle[10]['bITALIC']+"; text-decoration:"+$scope.fontStyle[10]['bUNDERLINE']+"; color:"+$scope.fontStyle[10]['crTEXT']+"; padding-left:"+$scope.fontStyle[10]['RC.LEFT']+"px; padding-right:"+$scope.fontStyle[10]['RC.RIGHT']+"px; padding-top:"+$scope.fontStyle[10]['RC.TOP'] + "px; padding-bottom:"+$scope.fontStyle[10]['RC.BOTTOM']+"px; font-family:"+$scope.fontStyle[10]['szFACENAME']+"; font-weight:"+$scope.fontStyle[10]['uWEIGHT']+';"';
                    // }
                    var cssColumn = 'style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis"';
                    element.append("<div class='topPadding'><div" + cssColumn + " class='lineOne'>" + info.text + "</div></div>");
                },
                allowSearch: true
            },
            {
                dataField: "Size",
                filterOperations: [],
                selectedFilterOperation: 'contains',
                minWidth: "50",
                calculateCellValue: function (data) {
                    var size = data.Size;
                    return size;
                },
                width: $scope.widthSize,
                visible: initialColumnChooser.indexOf('Size') > -1,
                cellTemplate: function (element, info) {
                    // if($scope.fontStyle[10]=== undefined){
                    //     var cssColumn = 'style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size:11pt; font-style:normal; text-decoration:unset; color:rgb(78, 78, 78); padding-left:0px; padding-right:0px; padding-top:5px; padding-bottom:0px; font-family:Calibri; font-weight:400"';
                    // }else{
                    //     var cssColumn = 'style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; '+"font-size:"+$scope.fontStyle[10]['uPOINTSIZE']+"pt; font-style:"+$scope.fontStyle[10]['bITALIC']+"; text-decoration:"+$scope.fontStyle[10]['bUNDERLINE']+"; color:"+$scope.fontStyle[10]['crTEXT']+"; padding-left:"+$scope.fontStyle[10]['RC.LEFT']+"px; padding-right:"+$scope.fontStyle[10]['RC.RIGHT']+"px; padding-top:"+$scope.fontStyle[10]['RC.TOP'] + "px; padding-bottom:"+$scope.fontStyle[10]['RC.BOTTOM']+"px; font-family:"+$scope.fontStyle[10]['szFACENAME']+"; font-weight:"+$scope.fontStyle[10]['uWEIGHT']+';"';
                    // }
                    var cssColumn = 'style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis"';
                    element.append("<div class='topPadding'><div" + cssColumn + " class='lineOne'>" + info.text + "</div></div>");
                },
                allowSearch: true
            },
            {
                filterOperations: [],
                selectedFilterOperation: 'contains',
                dataField: "Cabinet",
                calculateCellValue: function (data) {
                    var cabinet = data.Cabinet;
                    return cabinet;
                },
                visible: initialColumnChooser.indexOf('Cabinet') > -1,
                minWidth: "60",
                width: $scope.widthCabinet,
                cellTemplate: function (element, info) {
                    // if($scope.fontStyle[10]=== undefined){
                    //     var cssColumn = 'style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size:11pt; font-style:normal; text-decoration:unset; color:rgb(78, 78, 78); padding-left:0px; padding-right:0px; padding-top:5px; padding-bottom:0px; font-family:Calibri; font-weight:400"';
                    // }else{
                    //     var cssColumn = 'style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; '+"font-size:"+$scope.fontStyle[10]['uPOINTSIZE']+"pt; font-style:"+$scope.fontStyle[10]['bITALIC']+"; text-decoration:"+$scope.fontStyle[10]['bUNDERLINE']+"; color:"+$scope.fontStyle[10]['crTEXT']+"; padding-left:"+$scope.fontStyle[10]['RC.LEFT']+"px; padding-right:"+$scope.fontStyle[10]['RC.RIGHT']+"px; padding-top:"+$scope.fontStyle[10]['RC.TOP'] + "px; padding-bottom:"+$scope.fontStyle[10]['RC.BOTTOM']+"px; font-family:"+$scope.fontStyle[10]['szFACENAME']+"; font-weight:"+$scope.fontStyle[10]['uWEIGHT']+';"';
                    // }
                    var cssColumn = 'style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis"';
                    element.append("<div class='topPadding'><div" + cssColumn + " class='lineOne'>" + info.text + "</div></div>");
                },
                allowSearch: true
            },
            {
                filterOperations: [],
                selectedFilterOperation: 'contains',
                dataField: "Location",
                calculateCellValue: function (data) {
                    var location = data.Location;
                    return location;
                },
                visible: initialColumnChooser.indexOf('Location') > -1,
                minWidth: "60",
                width: $scope.widthLocation,
                cellTemplate: function (element, info) {
                    // if($scope.fontStyle[10] === undefined){
                    //     var cssColumn = 'style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size:11pt; font-style:normal; text-decoration:unset; color:rgb(78, 78, 78); padding-left:0px; padding-right:0px; padding-top:5px; padding-bottom:0px; font-family:Calibri; font-weight:400"';
                    // }else{
                    //     var cssColumn = 'style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; '+"font-size:"+$scope.fontStyle[10]['uPOINTSIZE']+"pt; font-style:"+$scope.fontStyle[10]['bITALIC']+"; text-decoration:"+$scope.fontStyle[10]['bUNDERLINE']+"; color:"+$scope.fontStyle[10]['crTEXT']+"; padding-left:"+$scope.fontStyle[10]['RC.LEFT']+"px; padding-right:"+$scope.fontStyle[10]['RC.RIGHT']+"px; padding-top:"+$scope.fontStyle[10]['RC.TOP'] + "px; padding-bottom:"+$scope.fontStyle[10]['RC.BOTTOM']+"px; font-family:"+$scope.fontStyle[10]['szFACENAME']+"; font-weight:"+$scope.fontStyle[10]['uWEIGHT']+';"';
                    // }
                    var cssColumn = 'style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis"';
                    element.append("<div class='topPadding'><div" + cssColumn + " class='lineOne'>" + info.text + "</div></div>");
                },
                allowSearch: true
            },
            {
                caption: "Field 1 Desc",
                dataField: "Field1Desc",
                filterOperations: [],
                selectedFilterOperation: 'contains',
                //width: "150",
                minWidth: "100",
                visible: initialColumnChooser.indexOf('Field 1 Desc') > -1,
                headerCellTemplate: "Field1 Desc Template",
                cellTemplate: function (element, info) {
                    // if($scope.fontStyle[10] === undefined){
                    //     var cssColumn = 'style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size:11pt; font-style:normal; text-decoration:unset; color:rgb(78, 78, 78); padding-left:0px; padding-right:0px; padding-top:5px; padding-bottom:0px; font-family:Calibri; font-weight:400"';
                    // }else{
                    //     var cssColumn = 'style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; '+"font-size:"+$scope.fontStyle[10]['uPOINTSIZE']+"pt; font-style:"+$scope.fontStyle[10]['bITALIC']+"; text-decoration:"+$scope.fontStyle[10]['bUNDERLINE']+"; color:"+$scope.fontStyle[10]['crTEXT']+"; padding-left:"+$scope.fontStyle[10]['RC.LEFT']+"px; padding-right:"+$scope.fontStyle[10]['RC.RIGHT']+"px; padding-top:"+$scope.fontStyle[10]['RC.TOP'] + "px; padding-bottom:"+$scope.fontStyle[10]['RC.BOTTOM']+"px; font-family:"+$scope.fontStyle[10]['szFACENAME']+"; font-weight:"+$scope.fontStyle[10]['uWEIGHT']+';"';
                    // }
                    var cssColumn = 'style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis"';
                    element.append("<div class='topPadding'><div" + cssColumn + " class='lineOne'>" + info.text + "</div></div>");
                },
                allowSearch: true
            },
            {
                caption: "Field 1 Code",
                dataField: "Field1",
                filterOperations: [],
                selectedFilterOperation: 'contains',
                //width: "150",
                minWidth: "100",
                visible: initialColumnChooser.indexOf('Field 1 Code') > -1,
                headerCellTemplate: "Field1 Code Template",
                cellTemplate: function (element, info) {
                    // if($scope.fontStyle[10] === undefined){
                    //     var cssColumn = 'style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size:11pt; font-style:normal; text-decoration:unset; color:rgb(78, 78, 78); padding-left:0px; padding-right:0px; padding-top:5px; padding-bottom:0px; font-family:Calibri; font-weight:400"';
                    // }else{
                    //     var cssColumn = 'style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis; '+"font-size:"+$scope.fontStyle[10]['uPOINTSIZE']+"pt; font-style:"+$scope.fontStyle[10]['bITALIC']+"; text-decoration:"+$scope.fontStyle[10]['bUNDERLINE']+"; color:"+$scope.fontStyle[10]['crTEXT']+"; padding-left:"+$scope.fontStyle[10]['RC.LEFT']+"px; padding-right:"+$scope.fontStyle[10]['RC.RIGHT']+"px; padding-top:"+$scope.fontStyle[10]['RC.TOP'] + "px; padding-bottom:"+$scope.fontStyle[10]['RC.BOTTOM']+"px; font-family:"+$scope.fontStyle[10]['szFACENAME']+"; font-weight:"+$scope.fontStyle[10]['uWEIGHT']+';"';
                    // }
                    var cssColumn = 'style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis"';
                    element.append("<div class='topPadding'><div " + cssColumn + " class='lineOne'>" + info.text + "</div></div>");
                },
                allowSearch: true
            },
            {
                caption: "Field 2 Desc",
                dataField: "Field2Desc",
                filterOperations: [],
                selectedFilterOperation: 'contains',
                //width: "150",
                minWidth: "100",
                visible: initialColumnChooser.indexOf('Field 2 Desc') > -1,
                headerCellTemplate: "Field2 Desc Template",
                cellTemplate: function (element, info) {
                    // if($scope.fontStyle[10] === undefined){
                    //     var cssColumn = 'style="font-size:11pt; font-style:normal; text-decoration:unset; color:rgb(78, 78, 78); padding-left:0px; padding-right:0px; padding-top:5px; padding-bottom:0px; font-family:Calibri; font-weight:400"';
                    // }else{
                    //     var cssColumn = 'style="'+"font-size:"+$scope.fontStyle[10]['uPOINTSIZE']+"pt; font-style:"+$scope.fontStyle[10]['bITALIC']+"; text-decoration:"+$scope.fontStyle[10]['bUNDERLINE']+"; color:"+$scope.fontStyle[10]['crTEXT']+"; padding-left:"+$scope.fontStyle[10]['RC.LEFT']+"px; padding-right:"+$scope.fontStyle[10]['RC.RIGHT']+"px; padding-top:"+$scope.fontStyle[10]['RC.TOP'] + "px; padding-bottom:"+$scope.fontStyle[10]['RC.BOTTOM']+"px; font-family:"+$scope.fontStyle[10]['szFACENAME']+"; font-weight:"+$scope.fontStyle[10]['uWEIGHT']+';"';
                    // }
                    var cssColumn = 'style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis"';
                    element.append("<div class='topPadding'><div " + cssColumn + " class='lineOne'>" + info.text + "</div></div>");
                },
                allowSearch: true
            },
            {
                caption: "Field 2 Code",
                dataField: "Field2",
                filterOperations: [],
                selectedFilterOperation: 'contains',
                //width: "150",
                minWidth: "100",
                visible: initialColumnChooser.indexOf('Field 2 Code') > -1,
                headerCellTemplate: "Field2 Code Template",
                cellTemplate: function (element, info) {
                    // if($scope.fontStyle[10] === undefined){
                    //     var cssColumn = 'style="font-size:11pt; font-style:normal; text-decoration:unset; color:rgb(78, 78, 78); padding-left:0px; padding-right:0px; padding-top:5px; padding-bottom:0px; font-family:Calibri; font-weight:400"';
                    // }else{
                    //     var cssColumn = 'style="'+"font-size:"+$scope.fontStyle[10]['uPOINTSIZE']+"pt; font-style:"+$scope.fontStyle[10]['bITALIC']+"; text-decoration:"+$scope.fontStyle[10]['bUNDERLINE']+"; color:"+$scope.fontStyle[10]['crTEXT']+"; padding-left:"+$scope.fontStyle[10]['RC.LEFT']+"px; padding-right:"+$scope.fontStyle[10]['RC.RIGHT']+"px; padding-top:"+$scope.fontStyle[10]['RC.TOP'] + "px; padding-bottom:"+$scope.fontStyle[10]['RC.BOTTOM']+"px; font-family:"+$scope.fontStyle[10]['szFACENAME']+"; font-weight:"+$scope.fontStyle[10]['uWEIGHT']+';"';
                    // }
                    var cssColumn = 'style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis"';
                    element.append("<div class='topPadding'><div " + cssColumn + " class='lineOne'>" + info.text + "</div></div>");
                },
                allowSearch: true
            },
            {
                caption: "Field 3 Desc",
                dataField: "Field3Desc",
                filterOperations: [],
                selectedFilterOperation: 'contains',
                //width: "150",
                minWidth: "100",
                visible: initialColumnChooser.indexOf('Field 3 Desc') > -1,
                headerCellTemplate: "Field3 Desc Template",
                cellTemplate: function (element, info) {
                    // if($scope.fontStyle[10] === undefined){
                    //     var cssColumn = 'style="font-size:11pt; font-style:normal; text-decoration:unset; color:rgb(78, 78, 78); padding-left:0px; padding-right:0px; padding-top:5px; padding-bottom:0px; font-family:Calibri; font-weight:400"';
                    // }else{
                    //     var cssColumn = 'style="'+"font-size:"+$scope.fontStyle[10]['uPOINTSIZE']+"pt; font-style:"+$scope.fontStyle[10]['bITALIC']+"; text-decoration:"+$scope.fontStyle[10]['bUNDERLINE']+"; color:"+$scope.fontStyle[10]['crTEXT']+"; padding-left:"+$scope.fontStyle[10]['RC.LEFT']+"px; padding-right:"+$scope.fontStyle[10]['RC.RIGHT']+"px; padding-top:"+$scope.fontStyle[10]['RC.TOP'] + "px; padding-bottom:"+$scope.fontStyle[10]['RC.BOTTOM']+"px; font-family:"+$scope.fontStyle[10]['szFACENAME']+"; font-weight:"+$scope.fontStyle[10]['uWEIGHT']+';"';
                    // }
                    var cssColumn = 'style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis"';
                    element.append("<div class='topPadding'><div " + cssColumn + " class='lineOne'>" + info.text + "</div></div>");
                },
                allowSearch: true
            },
            {
                caption: "Field 3 Code",
                dataField: "Field3",
                filterOperations: [],
                selectedFilterOperation: 'contains',
                // width: "150",
                minWidth: "100",
                visible: initialColumnChooser.indexOf('Field 3 Code') > -1,
                headerCellTemplate: "Field3 Code Template",
                cellTemplate: function (element, info) {
                    // if($scope.fontStyle[10] === undefined){
                    //     var cssColumn = 'style="font-size:11pt; font-style:normal; text-decoration:unset; color:rgb(78, 78, 78); padding-left:0px; padding-right:0px; padding-top:5px; padding-bottom:0px; font-family:Calibri; font-weight:400"';
                    // }else{
                    //     var cssColumn = 'style="'+"font-size:"+$scope.fontStyle[10]['uPOINTSIZE']+"pt; font-style:"+$scope.fontStyle[10]['bITALIC']+"; text-decoration:"+$scope.fontStyle[10]['bUNDERLINE']+"; color:"+$scope.fontStyle[10]['crTEXT']+"; padding-left:"+$scope.fontStyle[10]['RC.LEFT']+"px; padding-right:"+$scope.fontStyle[10]['RC.RIGHT']+"px; padding-top:"+$scope.fontStyle[10]['RC.TOP'] + "px; padding-bottom:"+$scope.fontStyle[10]['RC.BOTTOM']+"px; font-family:"+$scope.fontStyle[10]['szFACENAME']+"; font-weight:"+$scope.fontStyle[10]['uWEIGHT']+';"';
                    // }
                    var cssColumn = 'style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis"';
                    element.append("<div class='topPadding'><div " + cssColumn + " class='lineOne'>" + info.text + "</div></div>");
                },
                allowSearch: true
            },
            {
                caption: "Field 4 Desc",
                dataField: "Field4Desc",
                filterOperations: [],
                selectedFilterOperation: 'contains',
                // width: "150",
                minWidth: "100",
                visible: initialColumnChooser.indexOf('Field 4 Desc') > -1,
                headerCellTemplate: "Field4 Desc Template",
                cellTemplate: function (element, info) {
                    // if($scope.fontStyle[10] === undefined){
                    //     var cssColumn = 'style="font-size:11pt; font-style:normal; text-decoration:unset; color:rgb(78, 78, 78); padding-left:0px; padding-right:0px; padding-top:5px; padding-bottom:0px; font-family:Calibri; font-weight:400"';
                    // }else{
                    //     var cssColumn = 'style="'+"font-size:"+$scope.fontStyle[10]['uPOINTSIZE']+"pt; font-style:"+$scope.fontStyle[10]['bITALIC']+"; text-decoration:"+$scope.fontStyle[10]['bUNDERLINE']+"; color:"+$scope.fontStyle[10]['crTEXT']+"; padding-left:"+$scope.fontStyle[10]['RC.LEFT']+"px; padding-right:"+$scope.fontStyle[10]['RC.RIGHT']+"px; padding-top:"+$scope.fontStyle[10]['RC.TOP'] + "px; padding-bottom:"+$scope.fontStyle[10]['RC.BOTTOM']+"px; font-family:"+$scope.fontStyle[10]['szFACENAME']+"; font-weight:"+$scope.fontStyle[10]['uWEIGHT']+';"';
                    // }
                    var cssColumn = 'style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis"';
                    element.append("<div class='topPadding'><div " + cssColumn + " class='lineOne'>" + info.text + "</div></div>");
                },
                allowSearch: true
            },
            {
                caption: "Field 4 Code",
                dataField: "Field4",
                filterOperations: [],
                selectedFilterOperation: 'contains',
                // width: "150",
                minWidth: "100",
                visible: initialColumnChooser.indexOf('Field 4 Code') > -1,
                headerCellTemplate: "Field4 CodeT emplate",
                cellTemplate: function (element, info) {
                    // if($scope.fontStyle[10] === undefined){
                    //     var cssColumn = 'style="font-size:11pt; font-style:normal; text-decoration:unset; color:rgb(78, 78, 78); padding-left:0px; padding-right:0px; padding-top:5px; padding-bottom:0px; font-family:Calibri; font-weight:400"';
                    // }else{
                    //     var cssColumn = 'style="'+"font-size:"+$scope.fontStyle[10]['uPOINTSIZE']+"pt; font-style:"+$scope.fontStyle[10]['bITALIC']+"; text-decoration:"+$scope.fontStyle[10]['bUNDERLINE']+"; color:"+$scope.fontStyle[10]['crTEXT']+"; padding-left:"+$scope.fontStyle[10]['RC.LEFT']+"px; padding-right:"+$scope.fontStyle[10]['RC.RIGHT']+"px; padding-top:"+$scope.fontStyle[10]['RC.TOP'] + "px; padding-bottom:"+$scope.fontStyle[10]['RC.BOTTOM']+"px; font-family:"+$scope.fontStyle[10]['szFACENAME']+"; font-weight:"+$scope.fontStyle[10]['uWEIGHT']+';"';
                    // }
                    var cssColumn = 'style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis"';
                    element.append("<div class='topPadding'><div " + cssColumn + " class='lineOne'>" + info.text + "</div></div>");
                },
                allowSearch: true
            },
            {
                caption: "Field 5 Desc",
                dataField: "Field5Desc",
                filterOperations: [],
                selectedFilterOperation: 'contains',
                // width: "150",
                minWidth: "100",
                visible: initialColumnChooser.indexOf('Field 5 Desc') > -1,
                headerCellTemplate: "Field5 Desc Template",
                cellTemplate: function (element, info) {
                    // if($scope.fontStyle[10] === undefined){
                    //     var cssColumn = 'style="font-size:11pt; font-style:normal; text-decoration:unset; color:rgb(78, 78, 78); padding-left:0px; padding-right:0px; padding-top:5px; padding-bottom:0px; font-family:Calibri; font-weight:400"';
                    // }else{
                    //     var cssColumn = 'style="'+"font-size:"+$scope.fontStyle[10]['uPOINTSIZE']+"pt; font-style:"+$scope.fontStyle[10]['bITALIC']+"; text-decoration:"+$scope.fontStyle[10]['bUNDERLINE']+"; color:"+$scope.fontStyle[10]['crTEXT']+"; padding-left:"+$scope.fontStyle[10]['RC.LEFT']+"px; padding-right:"+$scope.fontStyle[10]['RC.RIGHT']+"px; padding-top:"+$scope.fontStyle[10]['RC.TOP'] + "px; padding-bottom:"+$scope.fontStyle[10]['RC.BOTTOM']+"px; font-family:"+$scope.fontStyle[10]['szFACENAME']+"; font-weight:"+$scope.fontStyle[10]['uWEIGHT']+';"';
                    // }
                    var cssColumn = 'style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis"';
                    element.append("<div class='topPadding'><div " + cssColumn + " class='lineOne'>" + info.text + "</div></div>");
                },
                allowSearch: true
            },
            {
                caption: "Field 5 Code",
                dataField: "Field5",
                filterOperations: [],
                selectedFilterOperation: 'contains',
                // width: "150",
                minWidth: "100",
                visible: initialColumnChooser.indexOf('Field 5 Code') > -1,
                headerCellTemplate: "Field5 Code Template",
                cellTemplate: function (element, info) {
                    // if($scope.fontStyle[10] === undefined){
                    //     var cssColumn = 'style="font-size:11pt; font-style:normal; text-decoration:unset; color:rgb(78, 78, 78); padding-left:0px; padding-right:0px; padding-top:5px; padding-bottom:0px; font-family:Calibri; font-weight:400"';
                    // }else{
                    //     var cssColumn = 'style="'+"font-size:"+$scope.fontStyle[10]['uPOINTSIZE']+"pt; font-style:"+$scope.fontStyle[10]['bITALIC']+"; text-decoration:"+$scope.fontStyle[10]['bUNDERLINE']+"; color:"+$scope.fontStyle[10]['crTEXT']+"; padding-left:"+$scope.fontStyle[10]['RC.LEFT']+"px; padding-right:"+$scope.fontStyle[10]['RC.RIGHT']+"px; padding-top:"+$scope.fontStyle[10]['RC.TOP'] + "px; padding-bottom:"+$scope.fontStyle[10]['RC.BOTTOM']+"px; font-family:"+$scope.fontStyle[10]['szFACENAME']+"; font-weight:"+$scope.fontStyle[10]['uWEIGHT']+';"';
                    // }
                    var cssColumn = 'style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis"';
                    element.append("<div class='topPadding'><div " + cssColumn + " class='lineOne'>" + info.text + "</div></div>");
                },
                allowSearch: true
            },
            {
                caption: "Field 6 Desc",
                dataField: "Field6Desc",
                filterOperations: [],
                selectedFilterOperation: 'contains',
                // width: "150",
                minWidth: "100",
                visible: initialColumnChooser.indexOf('Field 6 Desc') > -1,
                headerCellTemplate: "Field6 Desc Template",
                cellTemplate: function (element, info) {
                    // if($scope.fontStyle[10] === undefined){
                    //     var cssColumn = 'style="font-size:11pt; font-style:normal; text-decoration:unset; color:rgb(78, 78, 78); padding-left:0px; padding-right:0px; padding-top:5px; padding-bottom:0px; font-family:Calibri; font-weight:400"';
                    // }else{
                    //     var cssColumn = 'style="'+"font-size:"+$scope.fontStyle[10]['uPOINTSIZE']+"pt; font-style:"+$scope.fontStyle[10]['bITALIC']+"; text-decoration:"+$scope.fontStyle[10]['bUNDERLINE']+"; color:"+$scope.fontStyle[10]['crTEXT']+"; padding-left:"+$scope.fontStyle[10]['RC.LEFT']+"px; padding-right:"+$scope.fontStyle[10]['RC.RIGHT']+"px; padding-top:"+$scope.fontStyle[10]['RC.TOP'] + "px; padding-bottom:"+$scope.fontStyle[10]['RC.BOTTOM']+"px; font-family:"+$scope.fontStyle[10]['szFACENAME']+"; font-weight:"+$scope.fontStyle[10]['uWEIGHT']+';"';
                    // }
                    var cssColumn = 'style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis"';
                    element.append("<div class='topPadding'><div " + cssColumn + " class='lineOne'>" + info.text + "</div></div>");
                },
                allowSearch: true
            },
            {
                caption: "Field 6 Code",
                dataField: "Field6",
                filterOperations: [],
                selectedFilterOperation: 'contains',
                // width: "150",
                minWidth: "100",
                visible: initialColumnChooser.indexOf('Field 6 Code') > -1,
                headerCellTemplate: "Field6 Code Template",
                cellTemplate: function (element, info) {
                    // if($scope.fontStyle[10] === undefined){
                    //     var cssColumn = 'style="font-size:11pt; font-style:normal; text-decoration:unset; color:rgb(78, 78, 78); padding-left:0px; padding-right:0px; padding-top:5px; padding-bottom:0px; font-family:Calibri; font-weight:400"';
                    // }else{
                    //     var cssColumn = 'style="'+"font-size:"+$scope.fontStyle[10]['uPOINTSIZE']+"pt; font-style:"+$scope.fontStyle[10]['bITALIC']+"; text-decoration:"+$scope.fontStyle[10]['bUNDERLINE']+"; color:"+$scope.fontStyle[10]['crTEXT']+"; padding-left:"+$scope.fontStyle[10]['RC.LEFT']+"px; padding-right:"+$scope.fontStyle[10]['RC.RIGHT']+"px; padding-top:"+$scope.fontStyle[10]['RC.TOP'] + "px; padding-bottom:"+$scope.fontStyle[10]['RC.BOTTOM']+"px; font-family:"+$scope.fontStyle[10]['szFACENAME']+"; font-weight:"+$scope.fontStyle[10]['uWEIGHT']+';"';
                    // }
                    var cssColumn = 'style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis"';
                    element.append("<div class='topPadding'><div " + cssColumn + " class='lineOne'>" + info.text + "</div></div>");
                },
                allowSearch: true
            },
            {
                caption: "Field 7 Desc",
                dataField: "Field7Desc",
                filterOperations: [],
                selectedFilterOperation: 'contains',
                // width: "150",
                minWidth: "100",
                visible: initialColumnChooser.indexOf('Field 7 Desc') > -1,
                headerCellTemplate: "Field7 Desc Template",
                cellTemplate: function (element, info) {
                    // if($scope.fontStyle[10] === undefined){
                    //     var cssColumn = 'style="font-size:11pt; font-style:normal; text-decoration:unset; color:rgb(78, 78, 78); padding-left:0px; padding-right:0px; padding-top:5px; padding-bottom:0px; font-family:Calibri; font-weight:400"';
                    // }else{
                    //     var cssColumn = 'style="'+"font-size:"+$scope.fontStyle[10]['uPOINTSIZE']+"pt; font-style:"+$scope.fontStyle[10]['bITALIC']+"; text-decoration:"+$scope.fontStyle[10]['bUNDERLINE']+"; color:"+$scope.fontStyle[10]['crTEXT']+"; padding-left:"+$scope.fontStyle[10]['RC.LEFT']+"px; padding-right:"+$scope.fontStyle[10]['RC.RIGHT']+"px; padding-top:"+$scope.fontStyle[10]['RC.TOP'] + "px; padding-bottom:"+$scope.fontStyle[10]['RC.BOTTOM']+"px; font-family:"+$scope.fontStyle[10]['szFACENAME']+"; font-weight:"+$scope.fontStyle[10]['uWEIGHT']+';"';
                    // }
                    var cssColumn = 'style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis"';
                    element.append("<div class='topPadding'><div " + cssColumn + " class='lineOne'>" + info.text + "</div></div>");
                },
                allowSearch: true
            },
            {
                caption: "Field 7 Code",
                dataField: "Field7", locateInMenu: 'auto',
                filterOperations: [],
                selectedFilterOperation: 'contains',
                // width: "150",
                minWidth: "100",
                visible: initialColumnChooser.indexOf('Field 7 Code') > -1,
                headerCellTemplate: "Field7 Code Template",
                cellTemplate: function (element, info) {
                    // if($scope.fontStyle[10] === undefined){
                    //     var cssColumn = 'style="font-size:11pt; font-style:normal; text-decoration:unset; color:rgb(78, 78, 78); padding-left:0px; padding-right:0px; padding-top:5px; padding-bottom:0px; font-family:Calibri; font-weight:400"';
                    // }else{
                    //     var cssColumn = 'style="'+"font-size:"+$scope.fontStyle[10]['uPOINTSIZE']+"pt; font-style:"+$scope.fontStyle[10]['bITALIC']+"; text-decoration:"+$scope.fontStyle[10]['bUNDERLINE']+"; color:"+$scope.fontStyle[10]['crTEXT']+"; padding-left:"+$scope.fontStyle[10]['RC.LEFT']+"px; padding-right:"+$scope.fontStyle[10]['RC.RIGHT']+"px; padding-top:"+$scope.fontStyle[10]['RC.TOP'] + "px; padding-bottom:"+$scope.fontStyle[10]['RC.BOTTOM']+"px; font-family:"+$scope.fontStyle[10]['szFACENAME']+"; font-weight:"+$scope.fontStyle[10]['uWEIGHT']+';"';
                    // }
                    var cssColumn = 'style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis"';
                    element.append("<div class='topPadding'><div " + cssColumn + " class='lineOne'>" + info.text + "</div></div>");
                },
                allowSearch: true
            }
        ],
        get columns() {
            return this._columns;
        },
        set columns(value) {
            this._columns = value;
        },
        onContentReady: function (e) {
            var setflag = true;
            var wdFilterValue = $("#wdFilterBox").dxTextBox("instance").option("value");
            if (setflag) {
                
                setflag = false;
                $rootScope.setTitleHeaderWidth();
                var columnChooserView = e.component.getView("columnChooserView");
                var element = document.getElementById("overlay");
                gridData = $("#gridContainer").dxDataGrid("instance");
                $(".dx-freespace-row").css("height", 1);

                var dataGridInstance = e.component;
                // var tableData = dataGridInstance.getDataSource().items();
                if (e.component.pageCount() <= 1) {
                    $scope.showPagination = false;
                }


                if (gridData.totalCount() > 0) {
                    $scope.cat = {
                        publicCat: [],
                        personalCat: [],
                        folderCat: []
                    };
                    $scope.noDub = [];
                    $scope.catResponse = "";
                    var rows = gridData.getVisibleRows();
                    if (rows !== undefined && rows.length !== 0) {
                        
                        fileListUI.getCategoryList(rows[0].data.FilePath).then(function (res) {
                            $scope.catResponse = res.data.root;
                            $scope.showCatType = {};
                            var groupItem = [];
                            if ($scope.catResponse.Header.Error_Count !== "") {
                                console.log($scope.catResponse.Header.Error_Msg);
                                return false;
                            }
                            angular.forEach($scope.catResponse.Items, function (key, index) {
                                groupItem.push(key.TAB_NAME);
                                switch (key.TAB_NAME) {
                                    case 'Public':
                                        var updadedCat = {
                                            text: key.CD,
                                            icon: $rootScope.host + key.CI,
                                            onItemClick: function (vm) {
                                                $scope.setCategory(key, rows[0], false);
                                            }
                                        }
                                        var checksubname = 0;
                                        angular.forEach($scope.cat.publicCat, function (item, index2) {
                                            if (item.text == key.CD) {
                                                checksubname = 1;
                                            }
                                        });
                                        if (checksubname == 0) {
                                            $scope.cat.publicCat.push(updadedCat);
                                        }
                                        break;
                                    case 'Personal':
                                        var updadedCat = {
                                            text: key.CD,
                                            icon: $rootScope.host + key.CI,
                                            onItemClick: function (vm) {
                                                $scope.setCategory(key, rows[0], false);
                                            }
                                        }
                                        var checksubname = 0;
                                        angular.forEach($scope.cat.personalCat, function (item, index2) {
                                            if (item.text == key.CD) {
                                                checksubname = 1;
                                            }
                                        });
                                        if (checksubname == 0) {
                                            $scope.cat.personalCat.push(updadedCat);
                                        }
                                        break;
                                    case 'Folder':
                                        var updadedCat = {
                                            text: key.CD,
                                            icon: $rootScope.host + key.CI,
                                            onItemClick: function (vm) {
                                                $scope.setCategory(key, rows[0], false);
                                            }
                                        }
                                        var checksubname = 0;
                                        angular.forEach($scope.cat.folderCat, function (item, index2) {
                                            if (item.text == key.CD) {
                                                checksubname = 1;
                                            }
                                        });
                                        if (checksubname == 0) {
                                            $scope.cat.folderCat.push(updadedCat);
                                        }
                                        break;
                                }
                            });
                            var removeDub = groupItem.filter(function (item, pos) {
                                return groupItem.indexOf(item) == pos;
                            });
                            angular.forEach(removeDub, function (key, index) {
                                $scope.setSubMenu = []
                                if (key == "Public") {
                                    $scope.setSubMenu = $scope.cat.publicCat
                                }
                                else if (key == "Personal") {
                                    $scope.setSubMenu = $scope.cat.personalCat
                                }
                                if (key == "Folder") {
                                    $scope.setSubMenu = $scope.cat.folderCat
                                }
                                $scope.noDubKey = {};
                                $scope.noDubKey = {
                                    text: key,
                                    items: $scope.setSubMenu
                                }
                                var checksubname = 0;
                                angular.forEach($scope.noDub, function (item, index2) {
                                    if (item.text == key) {
                                        checksubname = 1;
                                    }
                                });
                                if (checksubname == 0) {
                                    $scope.noDub.push($scope.noDubKey);
                                }
                            });
                            $scope.subAddCategory = $scope.noDub;
                        }, function (err) {
                            // console.log(err)
                            console.log("Category Error");
                        });
                    }
                }

                $scope.columnarr = [];
                $scope.columnarr_item = [];
                $scope.columnarr_visivle = [];
                $scope.lastcolumn = '';

                for (var i = 0; i < dataGridInstance.columnCount(); i++) {
                    var column = dataGridInstance.columnOption(i);
                    if (column.showInColumnChooser == true) {
                        $scope.columnarr.push([column.caption, column.dataField, column.name]);
                        $scope.columnarr_item.push(column.caption);
                        if (column.visible == true) {
                            $scope.columnarr_visivle.push(column.caption);
                            $scope.lastcolumn = column.caption;
                        }
                    }
                }


                if ($rootScope.temp_status == 1) {
                    dataGridInstance.columnOption("TypeStatus", "width", 50);
                } else {
                    dataGridInstance.columnOption("TypeStatus", "width", 25);
                }

                if (!$localStorage.ColumnsChooser) {
                    $scope.canvas = angular.element('#myCanvas');
                    $scope.ctx = $scope.canvas[0].getContext("2d");
                    if ($scope.fontStyle[10] === undefined) {
                        $scope.ctx.font = "bold 11pt Calibri";
                    } else {
                        $scope.ctx.font = $scope.fontStyle[10]['uWEIGHT']+" "+$scope.fontStyle[10]['uPOINTSIZE'] + "pt " + $scope.fontStyle[10]['szFACENAME'];
                    }
                    $scope.html_temp = $rootScope.temp_description;
                    if($rootScope.temp_description.length > 120){
                        $scope.html_temp = $scope.html_temp.substr(0, 120);
                    }
                    var width_des = 0;
                    if (60 + $rootScope.temp_checkoutValue + $rootScope.temp_checkoutLabel < 25 + $scope.ctx.measureText($scope.html_temp).width) {
                        width_des = 20 + $scope.ctx.measureText($scope.html_temp).width;
                    } else {
                        width_des = 60 + $rootScope.temp_checkoutValue + $rootScope.temp_checkoutLabel;
                    }
                    $scope.canvas_docid = angular.element('#myCanvas_docid');
                    $scope.ctx_docid = $scope.canvas_docid[0].getContext("2d");

                    if ($scope.fontStyle[10] === undefined) {
                        $scope.ctx_docid.font = "bold 11pt Calibri";
                    } else {
                        $scope.ctx_docid.font = $scope.fontStyle[10]['uWEIGHT']+" "+$scope.fontStyle[10]['uPOINTSIZE'] + "pt " + $scope.fontStyle[10]['szFACENAME'];
                    }

                    $scope.html_temp_docid = $rootScope.temp_docid;
                    dataGridInstance.columnOption("Doc ID", "width", 25 + $scope.ctx_docid.measureText($scope.html_temp_docid).width);
                    $scope.widthDocID = 25 + $scope.ctx_docid.measureText($scope.html_temp_docid).width;

                    $scope.canvas_version = angular.element('#myCanvas_version');
                    $scope.ctx_version = $scope.canvas_version[0].getContext("2d");
                    if ($scope.fontStyle[10] === undefined) {
                        $scope.ctx_version.font = "bold 11pt Calibri";
                    } else {
                        $scope.ctx_version.font = $scope.fontStyle[10]['uWEIGHT']+" "+$scope.fontStyle[10]['uPOINTSIZE'] + "pt " + $scope.fontStyle[10]['szFACENAME'];
                    }
                    $scope.html_temp_version = $rootScope.temp_version;
                    dataGridInstance.columnOption("Ver#", "width", 25 + $scope.ctx_version.measureText($scope.html_temp_version).width);
                    $scope.widthVer = 25 + $scope.ctx_version.measureText($scope.html_temp_version).width;

                    $scope.canvas_modified = angular.element('#myCanvas_modified');
                    $scope.ctx_modified = $scope.canvas_modified[0].getContext("2d");
                    if ($scope.fontStyle[10] === undefined) {
                        $scope.ctx_modified.font = "bold 11pt Calibri";
                    } else {
                        $scope.ctx_modified.font = $scope.fontStyle[10]['uWEIGHT']+" "+$scope.fontStyle[10]['uPOINTSIZE'] + "pt " + $scope.fontStyle[10]['szFACENAME'];
                    }
                    $scope.html_temp_modified = angular.element(document).find("#myCanvas_modified")[0].innerHTML;
                    dataGridInstance.columnOption("Modified", "width", 25 + $scope.ctx_modified.measureText($scope.html_temp_modified).width);
                    $scope.widthModified = 25 + $scope.ctx_modified.measureText($scope.html_temp_modified).width;

                    $scope.canvas_categories = angular.element('#myCanvas_categories');
                    $scope.ctx_categories = $scope.canvas_categories[0].getContext("2d");
                    if ($scope.fontStyle[10] === undefined) {
                        $scope.ctx_categories.font = "bold 11pt Calibri";
                    } else {
                        $scope.ctx_categories.font = $scope.fontStyle[10]['uWEIGHT']+" "+$scope.fontStyle[10]['uPOINTSIZE'] + "pt " + $scope.fontStyle[10]['szFACENAME'];
                    }
                    $scope.html_temp_categories = $rootScope.temp_categories;
                    if($scope.maxWidthCategories >= 90 + $scope.ctx_categories.measureText($scope.html_temp_categories).width){
                        dataGridInstance.columnOption("Categories", "width", 90 + $scope.ctx_categories.measureText($scope.html_temp_categories).width);
                    }else{
                        dataGridInstance.columnOption("Categories", "width", $scope.maxWidthCategories);
                    }
                    //dataGridInstance.columnOption("Categories", "width", 90 + $scope.ctx_categories.measureText($scope.html_temp_categories).width);
                    $scope.widthCategories = 90 + $scope.ctx_categories.measureText($scope.html_temp_categories).width;

                    $scope.canvas_size = angular.element('#myCanvas_size');
                    $scope.ctx_size = $scope.canvas_size[0].getContext("2d");
                    if ($scope.fontStyle[10] === undefined) {
                        $scope.ctx_size.font = "bold 11pt Calibri";
                    } else {
                        $scope.ctx_size.font = $scope.fontStyle[10]['uWEIGHT']+" "+$scope.fontStyle[10]['uPOINTSIZE'] + "pt " + $scope.fontStyle[10]['szFACENAME'];
                    }
                    $scope.html_temp_size = $rootScope.temp_size;
                    dataGridInstance.columnOption("Size", "width", 50 + $scope.ctx_size.measureText($scope.html_temp_size).width);
                    $scope.widthSize = 50 + $scope.ctx_size.measureText($scope.html_temp_size).width;

                    $scope.canvas_comment = angular.element('#myCanvas_comment');
                    $scope.ctx_comment = $scope.canvas_comment[0].getContext("2d");
                    if ($scope.fontStyle[10] === undefined) {
                        $scope.ctx_comment.font = "bold 11pt Calibri";
                    } else {
                        $scope.ctx_comment.font = $scope.fontStyle[10]['uWEIGHT']+" "+$scope.fontStyle[10]['uPOINTSIZE'] + "pt " + $scope.fontStyle[10]['szFACENAME'];
                    }
                    $scope.html_temp_comment = $rootScope.temp_comment;
                    dataGridInstance.columnOption("Comments", "width", 25 + $scope.ctx_comment.measureText($scope.html_temp_comment).width);


                    $scope.ctx_descomment = $scope.canvas_comment[0].getContext("2d");
                    if ($scope.fontStyle[1] === undefined) {
                        $scope.ctx_descomment.font = "bold 12pt Calibri";
                    } else {
                        $scope.ctx_descomment.font = $scope.fontStyle[1]['uWEIGHT']+" "+$scope.fontStyle[1]['uPOINTSIZE'] + "pt " + $scope.fontStyle[1]['szFACENAME'];
                    }
                    if (width_des < 50 + $scope.ctx_descomment.measureText($rootScope.temp_descrcomment).width) {
                        //width_des = 50 + $scope.ctx_descomment.measureText($rootScope.temp_descrcomment).width;
                    }

                    $scope.canvas_propLabel = angular.element('#myCanvas_propLabel');
                    $scope.ctx_propLabel = $scope.canvas_propLabel[0].getContext("2d");
                    if ($scope.fontStyle[9] === undefined) {
                        $scope.ctx_propLabel.font = "bold 10pt Calibri";
                    } else {
                        $scope.ctx_propLabel.font = $scope.fontStyle[9]['uWEIGHT']+" "+$scope.fontStyle[9]['uPOINTSIZE'] + "pt " + $scope.fontStyle[9]['szFACENAME'];
                    }

                    $scope.canvas_propValue = angular.element('#myCanvas_propValue');
                    $scope.ctx_propValue = $scope.canvas_propValue[0].getContext("2d");
                    if ($scope.fontStyle[8] === undefined) {
                        $scope.ctx_propValue.font = "bold 10pt Calibri";
                    } else {
                        $scope.ctx_propValue.font = $scope.fontStyle[8]['uWEIGHT']+" "+$scope.fontStyle[8]['uPOINTSIZE'] + "pt " + $scope.fontStyle[8]['szFACENAME'];
                    }

                    var str_propLabel = '';
                    var str_propValue = '';
                    if ($scope.showVersion) {
                        str_propLabel += 'Version #';
                        str_propValue += $rootScope.temp_version;
                    }
                    if ($scope.showDocID) {
                        str_propLabel += 'Doc ID: ';
                        str_propValue += $rootScope.temp_docid;
                    }
                    if ($scope.showModified) {
                        str_propLabel += 'Modified: ';
                        str_propValue += $scope.html_temp_modified;
                    }
                    if ($scope.showSize) {
                        str_propLabel += 'Size: ';
                        str_propValue += $rootScope.temp_size;
                    }
                    if ($scope.showCreated) {
                        str_propLabel += 'Created: ';
                        str_propValue += angular.element(document).find("#myCanvas_created")[0].innerHTML;

                    }
                    if ($scope.showAccessed) {
                        str_propLabel += 'Accessed: ';
                        str_propValue += angular.element(document).find("#myCanvas_created")[0].innerHTML;
                    }

                    if (width_des < 50 + $scope.ctx_propLabel.measureText(str_propLabel).width + $scope.ctx_propValue.measureText(str_propValue).width) {
                        width_des = 50 + $scope.ctx_propLabel.measureText(str_propLabel).width + $scope.ctx_propValue.measureText(str_propValue).width;
                    }
                    dataGridInstance.columnOption("Description", "width", width_des);

                    $scope.canvas_cabinet = angular.element('#myCanvas_cabinet');
                    $scope.ctx_cabinet = $scope.canvas_cabinet[0].getContext("2d");
                    if ($scope.fontStyle[10] === undefined) {
                        $scope.ctx_cabinet.font = "bold 11pt Calibri";
                    } else {
                        $scope.ctx_cabinet.font = $scope.fontStyle[10]['uWEIGHT']+" "+$scope.fontStyle[10]['uPOINTSIZE'] + "pt " + $scope.fontStyle[10]['szFACENAME'];
                    }
                    $scope.html_temp_cabinet = $rootScope.temp_cabinet;
                    dataGridInstance.columnOption("Cabinet", "width", 25 + $scope.ctx_cabinet.measureText($scope.html_temp_cabinet).width);
                    $scope.widthCabinet = 25 + $scope.ctx_cabinet.measureText($scope.html_temp_cabinet).width;

                    $scope.canvas_location = angular.element('#myCanvas_location');
                    $scope.ctx_location = $scope.canvas_comment[0].getContext("2d");
                    if ($scope.fontStyle[10] === undefined) {
                        $scope.ctx_location.font = "bold 11pt Calibri";
                    } else {
                        $scope.ctx_location.font = $scope.fontStyle[10]['uWEIGHT']+" "+$scope.fontStyle[10]['uPOINTSIZE'] + "pt " + $scope.fontStyle[10]['szFACENAME'];
                    }
                    $scope.html_temp_location = $rootScope.temp_location;
                    dataGridInstance.columnOption("Location", "width", 25 + $scope.ctx_location.measureText($scope.html_temp_location).width);
                    $scope.widthLocation = 25 + $scope.ctx_location.measureText($scope.html_temp_location).width;

                    $scope.canvas_created = angular.element('#myCanvas_created');
                    $scope.ctx_created = $scope.canvas_created[0].getContext("2d");
                    if ($scope.fontStyle[10] === undefined) {
                        $scope.ctx_created.font = "bold 11pt Calibri";
                    } else {
                        $scope.ctx_created.font = $scope.fontStyle[10]['uWEIGHT']+" "+$scope.fontStyle[10]['uPOINTSIZE'] + "pt " + $scope.fontStyle[10]['szFACENAME'];
                    }
                    $scope.html_temp_created = angular.element(document).find("#myCanvas_created")[0].innerHTML;
                    dataGridInstance.columnOption("Created", "width", 25 + $scope.ctx_created.measureText($scope.html_temp_created).width);
                    dataGridInstance.columnOption("Accessed", "width", 25 + $scope.ctx_created.measureText($scope.html_temp_created).width);
                    $scope.widthCreated = 25 + $scope.ctx_created.measureText($scope.html_temp_created).width;
                    $scope.widthAccessed = 25 + $scope.ctx_created.measureText($scope.html_temp_created).width;

                    switch ($scope.lastcolumn) {
                        case 'Doc ID':
                            dataGridInstance.columnOption($scope.lastcolumn, "minWidth", 10 + $scope.ctx_docid.measureText($scope.html_temp_docid).width);
                            $scope.widthDocID = "70%";
                            break;
                        case 'Ver#':
                            dataGridInstance.columnOption($scope.lastcolumn, "minWidth", 10 + $scope.ctx_version.measureText($scope.html_temp_version).width);
                            $scope.widthVer = "70%";
                            break;
                        case 'Modified':
                            dataGridInstance.columnOption($scope.lastcolumn, "minWidth", 10 + $scope.ctx_modified.measureText($scope.html_temp_modified).width);
                            $scope.widthModified = "70%";
                            break;
                        case 'Categories':
                            dataGridInstance.columnOption($scope.lastcolumn, "minWidth", 50 + $scope.ctx_categories.measureText($scope.html_temp_categories).width);
                            $scope.widthCategories = "70%";
                            break;
                        case 'Size':
                            dataGridInstance.columnOption($scope.lastcolumn, "minWidth", 10 + $scope.ctx_size.measureText($scope.html_temp_size).width);
                            $scope.widthSize = "70%";
                            break;
                        case 'Comments':
                            dataGridInstance.columnOption($scope.lastcolumn, "minWidth", 10 + $scope.ctx_comment.measureText($scope.html_temp_comment).width);
                            break;
                        case 'Cabinet':
                            dataGridInstance.columnOption($scope.lastcolumn, "minWidth", 10 + $scope.ctx_cabinet.measureText($scope.html_temp_cabinet).width);
                            $scope.widthCabinet = "70%";
                            break;
                        case 'Location':
                            dataGridInstance.columnOption($scope.lastcolumn, "minWidth", 10 + $scope.ctx_location.measureText($scope.html_temp_location).width);
                            $scope.widthLocation = "70%";
                            break;
                        case 'Created':
                            dataGridInstance.columnOption($scope.lastcolumn, "minWidth", 10 + $scope.ctx_created.measureText($scope.html_temp_created).width);
                            $scope.widthCreated = "70%";
                            break;
                        case 'Accessed':
                            dataGridInstance.columnOption($scope.lastcolumn, "minWidth", 10 + $scope.ctx_created.measureText($scope.html_temp_created).width);
                            $scope.widthAccessed = "70%";
                            break;
                    }
                    dataGridInstance.columnOption($scope.lastcolumn, "width", "70%");
                }

                $scope.deleteType = "toggle";
                $scope.scrollBtm = "ScrollBottom";
                $scope.allowEditing = false;
                $scope.selectedItems = $scope.columnarr_visivle;

                $scope.listOptions_clm_cbx = {
                    dataSource: $scope.columnarr_item.sort(),
                    editEnabled: true,
                    height: 187,
                    showSelectionControls: true,
                    selectionMode: "multiple",
                    pageLoadMode: "scrollBtm",
                    bindingOptions: {
                        allowItemDeleting: "allowEditing",
                        itemDeleteMode: "deleteType",
                        selectedItems: "selectedItems"
                    }
                };

                $scope.indicateWidth = e.element.width();
                $scope.indicateHeight = e.element.height();
                $scope.gridData = e;

                if (!$localStorage.isOpeningDocPanel && e.component.totalCount() > 0 && $scope.gridMessage.indexOf("Too many files found (") == -1) {
                    var x = "";
                    var selectedData;
                    e.component.selectRowsByIndexes(0);
                    selectedData = e.component.getSelectedRowsData();
                    $scope.setToolbarStatus(selectedData[0]);
                    $scope.loadHeader(selectedData[0]);
                };

                $(".dx-freespace-row").css("height", 1);
                setTimeout(function () {
                    var leftwidth = $("#leftNav").width();
                    $("#gridContainer").css('max-width', parseInt(parseInt($(window).width()) - parseInt(leftwidth)) + 'px');
                }, -1);

                // if($scope.$parent.wdView) {
                //     loadPreview($scope.gridData.component, $scope.gridData.component.getSelectedRowsData().pop(), $scope.gridData);
                // }

                if ($scope.listCount > $scope.pageSize) {
                    $scope.showPageSize = true;
                }

                // if (userAgent.indexOf('Frowser') <= 0 || gridData.getSelectedRowsData()[0] !== undefined)  {
                //     var dg = gridData.getSelectedRowsData()[0];
                //     $scope.setOpenDwnBtn(dg)
                // }

                $("#gridContainer").mouseover(function (e) {
                    $rootScope.checkOverGrid = true;
                });
                $("#gridContainer").mouseout(function (e) {
                    $rootScope.checkOverGrid = false;
                });
                
                $timeout(function () {
                    element.classList.add("loaded");
                    $scope.removeLoader(false);
                    $scope.tableLoader = false;
                }, -1000);

                $scope.showNextPg = calculateNextPg()
                function calculateNextPg() {
                    if ($scope.wdListTake > $scope.wdTotalList) {
                        return false;
                    } else {
                        return true;
                    }
                }
            }

            if (wdFilterValue == '' && $scope.filterValue == '' && e.component.getDataSource().items()[0] !== undefined) {
                $scope.selectedFile = e.component.getDataSource().items()[0].LN;
            } 
            else if(wdFilterValue == '' && $scope.filterValue == '' &&  e.component.getDataSource().items()[0] == undefined) {
                $scope.selectedFile = "";
            }
            else {
                $scope.selectedFile = 1;
            }

            if ($scope.listCount >= 250 ){
                $scope.pageLimit = [50, 100, 150, 200, 250];   
            } else if( $scope.listCount >= 200 ) {
                $scope.pageLimit = [50, 100, 150, 200];
            }else if( $scope.listCount >= 150 ) {
                $scope.pageLimit = [50, 100, 150];
            }else if( $scope.listCount >= 100 ) {
                $scope.pageLimit = [50, 100];
            } else {
                $scope.pageLimit = [50];
            }

    

            $scope.chkRights();
            $rootScope.getRights = $localStorage.userRight;
            $scope.selectedText = "File: " + $scope.selectedFile + "/" + $scope.listCount;
        },
        onRowPrepared: function (e) {
            if (e.rowType == "data") {
                e.rowElement.attr({ id: "ln" + e.data.LN })
            }
        },
        onToolbarPreparing: function (e) {
            e.toolbarOptions.items.unshift({
                location: "before",
                template: "queryTitle"
            });

            e.toolbarOptions.items.unshift({
                location: 'after',
                template: "wdGridFilter",
                width: $scope.widthFit
            });

            e.toolbarOptions.items.unshift({
                location: 'after',
                widget: 'dxButton',
                // locateInMenu: 'auto',
                options: {
                    icon: "ms-Icon ms-Icon--Settings",
                    text: "",
                    onClick: function (e) {
                        $scope.isPopupVisible = true;
                    },
                    elementAttr: { "id": "btnCustomize", "title": "File list options", "title-direction": "left" },
                }
            });
            if(window != top){
                e.toolbarOptions.items.unshift({
                    location: 'after',
                    widget: 'dxButton',
                    options: {
                        text: "Open with Worldox",
                        onClick: function (e) {
                            var ifrQuery = $location.search();
                            var parFrow = ifrQuery.query;
                            $window.location.href = 'wdox://'+ parFrow;
                        },
                        elementAttr: { "id": "btnOpenWorldox", "title-direction": "left" },
                    }
                })
            }
        },
        onRowClick: function (info) {
            var gridInfo = info.component,
                count = gridInfo.getSelectedRowKeys().length,
                prevClickTime = gridInfo.lastClickTime

            fileID = {
                "LN": info.data.LN,
                "RN": info.data.RN,
                "LID": info.data.LID,
                "Status": info.data.I,
                "DocId": info.data.DocId,
                "tags": info.data.CAT_ID,
                "Description": info.data.Description,
                "profileGroupId": info.data.profileGroupId,
                "Extension": info.data.Extension,
                "FilePath": info.data.FilePath,
                "ver": info.data.version
            };

            gridInfo.lastClickTime = new Date();
            
            if (clickTimer && lastRowCLickedId === info.rowIndex && $localStorage.userRights.Download) {
                wdService.isFileHasChanged().then(function (hasChanged) {
                    var changedData = hasChanged.res;
                    if (changedData.Header.ErrorCount !== "") {
                        var data = { title: $scope.dwnTxt, fileAction: true, action: "DownloadDocument, wdInfo", desc: hasChanged.fileData.Description, doc: hasChanged.fileData.DocId };
                        $rootScope.$broadcast("errorAction", {visible: true, rctx: changedData.Header.wd_Error_RCTX, data: data});
                        return false
                    } 

                    if(hasChanged.confirm){
                        $rootScope.$broadcast('showMessageWhenFileChanged', {title:'Download', desc:hasChanged.items.res[0].Description, docid:hasChanged.items.res[0].DocId});
                        $rootScope.$broadcast('setConfirmHashChanged', {fnc:function(){
                            $('#popupFileChangedOptions').dxPopup().dxPopup("instance").hide();
                            clickTimer = null;
                            lastRowCLickedId = info.rowIndex
                            if (info.data.Version !== undefined && getQuery.verid == undefined) {
                                $scope.$parent.dialogTitle = $scope.dwnTxt;
                                $scope.$parent.userType = "version";
                                $scope.$parent.errorTypeDialog = "user";
                                $scope.$parent.fileError = true;
                                $scope.$parent.wdDocId = info.data.DocId;
                                $scope.$parent.wdDesc = info.data.Description;
                                $scope.$parent.changeDialogOption = true;

                            } else {
                                $scope.download(fileID);
                            }
                            $(this).off();
                        }});
                    }else{
                        clickTimer = null;
                        lastRowCLickedId = info.rowIndex
                        if (info.data.Version !== undefined && getQuery.verid == undefined) {
                            $scope.$parent.dialogTitle = $scope.dwnTxt;
                            $scope.$parent.userType = "version";
                            $scope.$parent.errorTypeDialog = "user";
                            $scope.$parent.fileError = true;
                            $scope.$parent.wdDocId = info.data.DocId;
                            $scope.$parent.wdDesc = info.data.Description;
                            $scope.$parent.changeDialogOption = true;

                        } else {
                            $scope.download(fileID);
                        }
                    }
                    
                })
            } 
            else if (clickTimer && lastRowCLickedId === info.rowIndex && !$localStorage.userRights.Download) {
                var data = {  title: "Download/Open", desc: info.data.Description, doc: info.data.DocId, action: "Download, wdInfo", fileAction: true };
                $rootScope.$broadcast("errorAction", {visible: true, rctx: "DOWNLOAD_RIGHTS", data: data});
            }
            else {
                var wdFilterValue = $("#wdFilterBox").dxTextBox("instance").option("value");
                clickTimer = true;
                setTimeout(function () {
                    clickTimer = false;
                }, 250);
                
                if (wdFilterValue == '' && $scope.filterValue == '') {
                    $scope.selectedFile = info.data.LN;
                } else {
                    $scope.selectedFile = info.rowIndex + 1;
                }

                $scope.selectedText = "File: " + $scope.selectedFile + "/" + $scope.listCount;
                $scope.loadHeader(info.data);
                loadPreview(info.component, info.data, info);
            
            }

            $scope.setToolbarStatus(info.data);
            if (userAgent.indexOf('Frowser') <= 0) {
                // $scope.setOpenDwnBtn(gridInfo.getSelectedRowsData()[0]);
            };
            lastRowCLickedId = info.rowIndex;
        },
        onContextMenuPreparing: $scope.contextualMenu,
        height: function () {
            return $scope.getHeight(true);
        },
        onCellClick: function (e) {
            var count = e.component.getSelectedRowKeys().length;
            $scope.selectedRow = count;
            $scope.selectedFiles = e.component.getSelectedRowsData();

            if (e.rowType === "header" && e.column.dataType !== undefined) {
                var sortType;

                $scope.sortFlag = true;
                switch (e.column.caption) {
                    case 'Description':
                        sortType = undefined;
                        $scope.columnID = $localStorage.columnId.desc;
                        break;

                    case 'Categories':
                        sortType = undefined;
                        $scope.columnID = $localStorage.columnId.category;
                        break;

                    case 'Ver #':
                        sortType = e.cellElement[0].children[1].lastChild.classList[1];
                        $scope.columnID = $localStorage.columnId.version;
                        break;

                    case 'Doc ID':
                        sortType = e.cellElement[0].children[1].lastChild.classList[1];
                        $scope.columnID = $localStorage.columnId.docid;
                        break;

                    case 'Created':
                        sortType = e.cellElement[0].children[1].lastChild.classList[1];
                        $scope.columnID = $localStorage.columnId.create;
                        break;

                    case 'Updated':
                        sortType = e.cellElement[0].children[1].lastChild.classList[1];
                        $scope.columnID = $localStorage.columnId.update;
                        break;

                    case 'Accessed':
                        sortType = e.cellElement[0].children[1].lastChild.classList[1];
                        $scope.columnID = $localStorage.columnId.access;
                        break;

                    case 'Location':
                        sortType = e.cellElement[0].children[1].lastChild.classList[1];
                        $scope.columnID = $localStorage.columnId.location;
                        break;

                    case 'Size':
                        sortType = e.cellElement[0].children[1].lastChild.classList[1];
                        $scope.columnID = $localStorage.columnId.size;
                        break;

                    case 'Cabinet':
                        sortType = e.cellElement[0].children[1].lastChild.classList[1];
                        $scope.columnID = $localStorage.columnId.cabinet;
                        break;

                    case 'Field 1 Code':
                        sortType = e.cellElement[0].children[1].lastChild.classList[1];
                        $scope.columnID = $localStorage.columnId.field1;
                        break;

                    case 'Field 1 Desc':
                        sortType = e.cellElement[0].children[1].lastChild.classList[1];
                        $scope.columnID = $localStorage.columnId.field1Desc;
                        break;

                    case 'Field 2 Code':
                        sortType = e.cellElement[0].children[1].lastChild.classList[1];
                        $scope.columnID = $localStorage.columnId.field2;
                        break;

                    case 'Field 2 Desc':
                        sortType = e.cellElement[0].children[1].lastChild.classList[1];
                        $scope.columnID = $localStorage.columnId.field2Desc;
                        break;

                    case 'Field 3 Code':
                        sortType = e.cellElement[0].children[1].lastChild.classList[1];
                        $scope.columnID = $localStorage.columnId.field3;
                        break;

                    case 'Field 3 Desc':
                        sortType = e.cellElement[0].children[1].lastChild.classList[1];
                        $scope.columnID = $localStorage.columnId.field3Desc;
                        break;

                    case 'Field 4 Code':
                        sortType = e.cellElement[0].children[1].lastChild.classList[1];
                        $scope.columnID = $localStorage.columnId.field4;
                        break;

                    case 'Field 4 Desc':
                        sortType = e.cellElement[0].children[1].lastChild.classList[1];
                        $scope.columnID = $localStorage.columnId.field4Desc;
                        break;

                    case 'Field 5 Code':
                        sortType = e.cellElement[0].children[1].lastChild.classList[1];
                        $scope.columnID = $localStorage.columnId.field4;
                        break;

                    case 'Field 5 Desc':
                        sortType = e.cellElement[0].children[1].lastChild.classList[1];
                        $scope.columnID = $localStorage.columnId.field5Desc;
                        break;

                    case 'Field 6 Code':
                        sortType = e.cellElement[0].children[1].lastChild.classList[1];
                        $scope.columnID = $localStorage.columnId.field6;
                        break;

                    case 'Field 6 Desc':
                        sortType = e.cellElement[0].children[1].lastChild.classList[1];
                        $scope.columnID = $localStorage.columnId.field6Desc;
                        break;

                    case 'Field 7 Code':
                        sortType = e.cellElement[0].children[1].lastChild.classList[1];
                        $scope.columnID = $localStorage.columnId.field7;
                        break;

                    case 'Field 7 Desc':
                        sortType = e.cellElement[0].children[1].lastChild.classList[1];
                        $scope.columnID = $localStorage.columnId.field7Desc;
                        break;

                    case undefined:
                        break;

                    default:
                        console.log('blank');
                }

                switch (sortType) {
                    case 'dx-sort-none':
                    case 'dx-sort-down':
                        $scope.sortType = 0;
                        break;
                    case undefined:
                        if (descFlag) {
                            $scope.sortType = 1;
                        }
                        if (!descFlag) {
                            $scope.sortType = 0;
                        }
                        descFlag = !descFlag;
                        break
                    default:
                        $scope.sortType = 1;
                }

                e.component.refresh();
            }

            if (e.column.dataType === "boolean") {
                var count = e.component.getSelectedRowKeys().length;
                $scope.selectedRow = e.component.getSelectedRowKeys().length;
                loadPreview(e.component, e.component.getSelectedRowsData().pop(), e);
            }
        },
        selectedRowKeys: (typeof $localStorage.currentFile != 'undefined') ? $localStorage.currentFile.DocId : [],
        onKeyDown: function (e) {
            var selKey = e.component.getSelectedRowKeys(),
                DOWN_KEY = 40,
                UP_KEY = 38,
                RIGHT_KEY = 39,
                LEFT_KEY = 37;


            if (selKey.length) {
                var currentKey = selKey[0];
                var index = e.component.getRowIndexByKey(currentKey);
                if (e.event.keyCode === RIGHT_KEY || e.event.keyCode === LEFT_KEY) {
                    e.event.preventDefault();
                }
                if (e.event.keyCode === UP_KEY) {
                    if (e.component.getSelectedRowKeys().length > 1) {
                        e.event.preventDefault();
                    } else {
                        index--;
                        if (index >= 0)
                            e.component.selectRowsByIndexes([index]);
                    }
                }
                else if (e.event.keyCode === DOWN_KEY) {
                    if (e.component.getSelectedRowKeys().length > 1) {
                        e.event.preventDefault();
                    } else {
                        index++;
                        if (e.component.getDataSource().items().length === index) {
                            index = index;
                        } else {
                            e.component.selectRowsByIndexes([index]);
                            e.event.stopPropagation();
                        }
                    }
                }
                if ($scope.$parent.wdView && (e.event.keyCode === UP_KEY || e.event.keyCode === DOWN_KEY)) {
                    // wdService.isFileHasChanged().then(function (hasChanged) {
                    //     if(hasChanged){
                    //         $rootScope.$broadcast('showMessageWhenFileChanged');
                    //     }else{
                            loadPreview(e.component, e.component.getSelectedRowsData().pop(), e);
                    //     }
                    // })
                }
            };

        },
        customizeColumns: function (columns) {
            //$scope.lastcolumn = 'Column';
            var dataGridInstance = $("#gridContainer").dxDataGrid("instance");
            for (var i = 0; i < dataGridInstance.columnCount(); i++) {
                var column = dataGridInstance.columnOption(i);
                if ($localStorage.ColumnsIndex) {
                    columns[i].visibleIndex = $localStorage.ColumnsIndex[i];
                } else {
                    columns[i].visibleIndex = i;
                }

               
            }
         
        },
        // onColumnsChanging: function (e) {
        //     var grid = $("#gridContainer").dxDataGrid("instance");
        //     clientInformation
        //     if ($scope.maxWidthDesc < grid.columnOption('Description', 'width')) {
        //         grid.columnOption('Description', 'width', $scope.maxWidthDesc);
        //         grid.columnOption('Doc ID', 'width', $scope.widthDocID);
        //         grid.columnOption('Ver#', 'width', $scope.widthVer);
        //         grid.columnOption('Modified', 'width', $scope.widthModified);
        //         grid.columnOption('Categories', 'width', $scope.widthCategories);
        //         grid.columnOption('Created', 'width', $scope.widthCreated);
        //         grid.columnOption('Accessed', 'width', $scope.widthAccessed);
        //         grid.columnOption('Size', 'width', $scope.widthSize);
        //         grid.columnOption('Cabinet', 'width', $scope.widthCabinet);
        //         grid.columnOption('Location', 'width', $scope.widthLocation);
        //     } else {
        //         $scope.widthDocID = grid.columnOption('Doc ID', 'width');
        //         $scope.widthVer = grid.columnOption('Ver#', 'width');
        //         $scope.widthModified = grid.columnOption('Modified', 'width');
        //         $scope.widthCategories = grid.columnOption('Categories', 'width');
        //         $scope.widthCreated = grid.columnOption('Created', 'width');
        //         $scope.widthAccessed = grid.columnOption('Accessed', 'width');
        //         $scope.widthSize = grid.columnOption('Size', 'width');
        //         $scope.widthCabinet = grid.columnOption('Cabinet', 'width');
        //         $scope.widthLocation = grid.columnOption('Location', 'width');
        //     }
        //     if ($localStorage.MarkFavView) {
        //         $scope.saveFavView();
        //     }
        // },
        onSelectionChanged: function (e) {
            var selected = e.selectedRowsData[0];
            if (selected !== undefined) {
                if (selected.CHKOUT_TO_NAME !== undefined) {
                    $("#wdEditProfile").dxButton("instance").option("disabled", true);
                    // $("#wdCopyProfile").dxButton("instance").option("disabled", true);
                    return false;
                }
                $("#wdEditProfile").dxButton("instance").option("disabled", false);
                // $("#wdCopyProfile").dxButton("instance").option("disabled", false);
            }
        }
    };

    $scope.displayComments = function () {
        $scope.showComments = !$scope.showComments;
        if ($scope.showComments) {
            $scope.fontSectionLabel = 'Hide Comments';
        } else {
            $scope.fontSectionLabel = 'Display Comments';
        }
    }

    $scope.showColumnChooser = function () {
        // $scope.isPopupVisible = false;
        var poupchooser = $(".popup-columnChooser").dxPopup("instance");
        poupchooser.option('position', {
            my: "right",
            at: "bottom",
            of: $rootScope.parentColumnChoose
        });
        poupchooser.show();
        //$scope.isPopupVisibleColumnChooser  = true;
        var dataGridInstance = $("#gridContainer").dxDataGrid("instance");
        $scope.columnarr = [];
        $scope.columnarr_item = [];
        for (var i = 0; i < dataGridInstance.columnCount(); i++) {
            var column = dataGridInstance.columnOption(i);
            if (column.showInColumnChooser == true) {//&& column.showInColumnChooser == true column.caption
                $scope.columnarr.push([column.caption, column.dataField, column.name]);
                $scope.columnarr_item.push(column.caption);
            }
        }
        setTimeout(function () {
            var button_close = '<div class="dx-item dx-toolbar-item dx-toolbar-button"><div class="dx-item-content dx-toolbar-item-content"><div class="dx-closebutton dx-button dx-button-normal dx-widget dx-button-has-icon" role="button" aria-label="close" tabindex="0"><div class="dx-button-content"><i class="dx-icon dx-icon-close"></i></div></div></div></div>';
            $('.dx-overlay-wrapper.popup.popup-columnChooser').find('.dx-toolbar-after').html(button_close);
            $(document).on('click', '.dx-closebutton', function () {
                poupchooser.hide();
            });
            $('#dxlist-clm_cbx').dxList('instance').reload();
            if ($scope.columnarr_visivle.length > 0) {
                for (var i = 0; i < $scope.columnarr_visivle.length; i++) {
                    $('#dxlist-clm_cbx').dxList('instance').selectItem($scope.columnarr_visivle[i]);
                }
            }
            var dataGridInstance = $("#gridContainer").dxDataGrid("instance");
            $scope.columnarr = [];
            $scope.columnarr_item = [];
            for (var i = 0; i < dataGridInstance.columnCount(); i++) {
                var column = dataGridInstance.columnOption(i);
                if (column.showInColumnChooser == true) {//&& column.showInColumnChooser == true column.caption
                    $scope.columnarr.push([column.caption, column.dataField, column.name]);
                    $scope.columnarr_item.push(column.caption);
                }
            }
            $(document).on('click', '.btn-apply-clm-chooser', function () {
                poupchooser.hide();
                var arr_selected_item = $("#hdd-selecteditem").val().split(", ");
                for (var i = 0; i < $scope.columnarr.length; i++) {
                    var item = $scope.columnarr[i];
                    var check = 0;
                    for (var t = 0; t < 13; t++) {//arr_selected_item.length;
                        if (item[0] == arr_selected_item[t]) {
                            check = 1;
                        }
                    }
                    var grid = $("#gridContainer").dxDataGrid("instance");
                    if (check == 1) {
                        grid.columnOption(item[1], "visible", true);
                    } else {
                        grid.columnOption(item[1], "visible", false);
                    }
                    grid.refresh();
                }

                // if(arr_selected_item.indexOf("Comments") !=-1 ) {
                //     $scope.showComments = false;
                // } else {
                //     $scope.showComments = true;
                // }

                if (arr_selected_item.indexOf("Ver #") != -1) {
                    $scope.showVersion = false;
                } else {
                    if ($scope.markVersion) {
                        $scope.showVersion = true;
                    }
                }

                if (arr_selected_item.indexOf("Modified") != -1) {
                    $scope.showModified = false;
                } else {
                    if ($scope.markModified) {
                        $scope.showModified = true;
                    }
                }

                if (arr_selected_item.indexOf("Size") != -1) {
                    $scope.showSize = false;
                } else {
                    if ($scope.markSize) {
                        $scope.showSize = true;
                    }
                }

                if (arr_selected_item.indexOf("Created") != -1) {
                    $scope.showCreated = false;
                } else {
                    if ($scope.markCreated) {
                        $scope.showCreated = true;
                    }
                }

                if (arr_selected_item.indexOf("Accessed") != -1) {
                    $scope.showAccessed = false;
                } else {
                    if ($scope.markAccessed) {
                        $scope.showAccessed = true;
                    }
                }

                if (arr_selected_item.indexOf("Doc ID") != -1) {
                    $scope.showDocID = false;
                } else {
                    if ($scope.markDocId) {
                        $scope.showDocID = true;
                    }
                }

                if ($localStorage.MarkFavView) {
                    $scope.saveFavView();
                }
            });

            var buttonIndicator;
            $scope.buttonOptionsApplyChooser = {
                text: "Apply",
                height: 30,
                width: 120,
                type: "success",
                template: function (data, container) {
                    $("<div class='button-indicator'></div><span class='dx-button-text'>" + data.text + "</span>").appendTo(container);
                    buttonIndicator = container.find(".button-indicator").dxLoadIndicator({
                        visible: false,
                        width: 16,
                        height: 16
                    }).dxLoadIndicator("instance");
                },
                onClick: function (data) {
                    data.component.option("text", "Applying");
                    buttonIndicator.option("visible", true);
                    setTimeout(function () {
                        $scope.applyColumnChooserPopUp();
                        poupchooser.hide();
                        buttonIndicator.option("visible", false);
                        data.component.option("text", "Apply");
                    }, -1);
                }
            };
        }, 100)
    }

    $scope.$on('eventFired', function (event, data) {
        if (data.type == "download") {
            $scope.download(data.file.data);
            return false
        }
        loadPreview($scope.gridData.component, $scope.gridData.component.getSelectedRowsData().pop(), $scope.gridData);
    });


    if (userAgent.indexOf('Frowser') != -1) {
        if (getQuery.attach) {
            $scope.dwnIco = "ms-Icon ms-Icon--Attach";
            $scope.dwnTxt = "Attach";
        } else {
            $scope.dwnIco = "ms-Icon ms-Icon--OpenFile";
            $scope.dwnTxt = "Open";
        }

    } else {
        $scope.dwnIco = "ms-Icon ms-Icon--Download";
        $scope.dwnTxt = "Download"
    }

    if (getQuery.attach) {
        $scope.attach = true;
    }

    $scope.setAttachPop = function () {
        //event.stopPropagation();
        $scope.$parent.visiblePopup = true;
    }


    $scope.gridHeader = {
        "f1code": "",
        "f1desc": "",
        "f1name": ""
    }

    $scope.callFlag = true;

    angular.element($window).bind('resize', function () {
        var getLeftNavWidth = $("#leftNav").dxResizable("instance").option("width");
        if ($scope.wdView) {
            var leftNavWidth = parseInt($("#leftNav").dxResizable("instance").option("width"));;
            var setleftBody = parseInt(window.innerWidth) - parseInt(leftNavWidth);
            var getWidth = setleftBody - parseInt($("#homeFileMenu").css("width"));
            $("#appBody").css("width", setleftBody).css("maxWidth", setleftBody);
            $("#homedataGrid, #gridContainer").css("width", getWidth).css("maxWidth", getWidth);
        } else {
            $("#appBody, #homedataGrid, #gridContainer").css("width", (window.innerWidth - getLeftNavWidth)).css("max-width", (window.innerWidth - getLeftNavWidth));
        }
        $("#gridContainer").dxDataGrid("instance").option("height", (window.innerHeight - 145));
        $(".dx-freespace-row").css("height", 1);
        $("#scrollWk").dxScrollView("instance").option("height", (window.innerHeight - 150));
        $("#scrollCab, #fmContainer").dxScrollView("instance").option("height", (window.innerHeight - 190));
        $("#dxVerList").dxList("height", (window.innerHeight - 190));
        $("#scrollPreview").dxScrollView("instance").option("height", (window.innerHeight - 165));

        setTimeout(function () {
            $("#listTitle").css({ 'max-width': "0px", "width": "0px" });
            var grid = $("#gridContainer").dxDataGrid("instance");
            grid._windowResizeCallBack();
            // angular.element('#homedataGrid div[dx-toolbar="fileActionToolbar"]').dxToolbar("instance")._windowResizeCallBack();
            $rootScope.setTitleHeaderWidth();
        }, -1);
    });

    $rootScope.$watch('wdStatus', function (newVal, oldVal) {
        if (newVal != oldVal) {
            for (var i = 0; i < $scope.items.length; i++) {
                if ($scope.items[i].RN == $rootScope.rec && $scope.items[i].I == "48") {
                    $scope.items[i].I = "0";
                    if ($rootScope.checkType == "1") {
                        var ver = parseInt($scope.items[i].Version) + 1;
                        $scope.items[i].Version = ver;
                    }
                } else if ($scope.items[i].RN == $rootScope.rec && $scope.items[i].I == "0") {
                    $scope.items[i].I = "48";
                }
            }
        }
    });


    $scope.fileActionToolbar = {
        adaptivityEnabled: true,
        bindingOptions: {
            deep: true,
            dataSource: "toolBarData"
        },
        onContentReady: function (e) {
            setTimeout(function () { e.component._windowResizeCallBack(); }, 4000);
        }
    }

    $scope.chkStatus = function (x) {
        var setChkInmessage;
        if (x.I === "49") {
            setChkInmessage = "File isn't checkout to you";
        } else if (x.I === "52") {
            setChkInmessage = "You do not need to check it in";
        }
        $scope.$parent.fileErrorMessage = [];
        $scope.$parent.fileSuccessMessage = [];
        $scope.$parent.dialogTitle = "Check-In";
        var setErrorData = { title: x.DocId, desc: x.Description, wdMsg: setChkInmessage };
        $scope.$parent.fileErrorMessage.push(setErrorData);
        $scope.$parent.genericError = false;
        $scope.$parent.errorTypeDialog = "action";
        $scope.$parent.fileError = true;
    };

    $scope.toolBarData = [
        {
            location: 'before',
            widget: 'dxButton',
            locateInMenu: 'auto',
            options: {
                bindingOptions: {
                    icon: "dwnIco",
                    text: "dwnTxt",
                },
                elementAttr: { id: "wdOpenFile" },
                onClick: function (e) {
                    var grid = $("#gridContainer").dxDataGrid("instance");
                    var getSelected = grid.getSelectedRowsData();
                    grid.selectRows({ "DocId": getSelected.pop().DocId }, false);
                    $scope.download(grid.getSelectedRowsData()[0]);
                }
            }
        },
        {
            location: 'before',
            widget: 'dxButton',
            options: {
                icon: 'ms-Icon ms-Icon--PageCheckedOut',
                text: 'Check-Out',
                elementAttr: { id: "wdChkOut" },
                onClick: function (e) {
                    checkoutRecords(e);
                }
            }
        },
        // {
        //     location: 'before',
        //     widget: 'dxButton',
        //     locateInMenu: 'auto',
        //     options: {
        //         icon: 'ms-Icon ms-Icon--PageCheckedin',
        //         text: 'Checkin',
        //         onClick: function(e) {
        //             var grid = $("#gridContainer").dxDataGrid("instance");
        //             var getSelected = grid.getSelectedRowsData();

        //             if (getSelected[0].I == "49" || getSelected[0].I == "52") {
        //                 $scope.chkStatus(getSelected[0]);
        //                 return false;
        //             }
        //             checkInRecords(e);
        //         }
        //     }
        // },
        {
            location: 'before',
            widget: 'dxButton',
            locateInMenu: 'auto',
            options: {
                icon: 'ms-Icon ms-Icon--Edit',
                text: 'Edit Profile',
                elementAttr: { id: "wdEditProfile" },
                onClick: function (vm) {
                    var getTableData = $("#gridContainer").dxDataGrid("instance");
                    var gridModel = fileListUI.getDataGridControlerScope(vm);
                    var getTopObj = {
                        "row": {
                            "data": getTableData.getSelectedRowsData().pop()
                        }
                    }

                    homeService.setSelected(getTableData.getSelectedRowsData());
                    fileListUI.openPanel(getTopObj, vm, 0, 'Profile', 'toolbar');;
                    vm.model.$parent.$parent.checked = true;
                    $rootScope.$broadcast('editIcon', { "flag": "Edit" });
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
                elementAttr: { id: "wdCopyProfile" },
                onClick: function (vm) {
                    var getTableData = $("#gridContainer").dxDataGrid("instance");
                    var gridModel = fileListUI.getDataGridControlerScope(vm);

                    var getTopObj = {
                        "row": {
                            "data": getTableData.getSelectedRowsData().pop()
                        }
                    }

                    homeService.setSelected(getTableData.getSelectedRowsData());

                    fileListUI.openPanel(getTopObj, vm, 0, 'Profile', 'toolbar');
                    vm.model.$parent.$parent.checked = true;
                    $rootScope.$broadcast('editIcon', { "flag": "Copy" });
                }
            }
        },
        {
            location: 'before',
            widget: 'dxButton',
            locateInMenu: 'auto',
            options: {
                icon: 'ms-Icon ms-Icon--Mail',
                text: 'Email',
                elementAttr: { id: "wdEmail" },
                onClick: function (vm) {
                    var getTableData = $("#gridContainer").dxDataGrid("instance");
                    var gridModel = fileListUI.getDataGridControlerScope(vm);
                    var getTopObj = {
                        "row": {
                            data: getTableData.getSelectedRowsData()[0]
                        }
                    }
                    homeService.setSelected(getTableData.getSelectedRowsData());
                    fileListUI.openPanel(getTopObj, vm, 1, 'Email', 'toolbar');
                    // gridModel.selectedTab = 'Email';
                    $scope.$parent.dialogTitle = "Email";
                    vm.model.$parent.$parent.checked = true;

                    if (getTableData.getSelectedRowsData()[0].I == '54') {
                        $("#tabPanelItems").dxTabPanel("instance").option("dataSource")[0].disabled = true;
                    } else {
                        $("#tabPanelItems").dxTabPanel("instance").option("dataSource")[0].disabled = false;
                    }
                }
            }
        },
        {
            location: 'before',
            widget: 'dxButton',
            locateInMenu: 'auto',
            options: {
                icon: 'ms-Icon ms-Icon--EntryView',
                text: 'View',
                elementAttr: { id: "wdViewFile" },
                onClick: function (e) {
                    var grid = $("#gridContainer").dxDataGrid("instance");
                    var getSelected = grid.getSelectedRowsData();
                    var getTopObj = {
                        "row": {
                            "data": getSelected.pop()
                        }
                    }
                    var gridModel = fileListUI.getDataGridControlerScope(e);
                    e.model.$parent.$parent.wdView = true;
                    fileListUI.openPanel(getTopObj, e, 0, 'Preview', 'toolbar');
                    loadPreview($scope.gridData.component, $scope.gridData.component.getSelectedRowsData().pop(), $scope.gridData);
                    setTimeout(function () {
                        $("#listTitle").css({ 'max-width': "0px", "width": "0px" });
                        grid._windowResizeCallBack();
                        $rootScope.setTitleHeaderWidth();
                    }, -1)
                    //checkoutRecords(e);
                }
            }
        },
        {
            location: 'before',
            widget: 'dxButton',
            options: {
                icon: 'ms-Icon ms-Icon--Refresh',
                text: 'Refresh',
                onClick: function (e) {
                    var getTableData = $("#gridContainer").dxDataGrid("instance");
                    getTableData.refresh();
                }
            }
        }
    ];

    $scope.fieldContainer = {
        "Field1": false,
        "Field2": false,
        "Field3": false,
        "Field4": false,
        "Field5": false,
        "Field6": false,
        "Field7": false
    };

    $scope.emailData = {};

   
    $scope.setVersion = function(x) {
        var line = parseInt(x.LN - 1);
        var selectRow = $("#gridContainer").dxDataGrid("instance");
        selectRow.selectRowsByIndexes(line);
        wdService.isFileHasChanged().then(function (hasChanged) {
            var changedData = hasChanged.res;
            if (changedData.Header.ErrorCount !== "") {
                var data = { title: "Versions", fileAction: true, action: "DownloadDocument, wdInfo", desc: hasChanged.fileData.Description, doc: hasChanged.fileData.DocId };
                $rootScope.$broadcast("errorAction", {visible: true, rctx: changedData.Header.wd_Error_RCTX, data: data});
                return false
            } 
            
            if(hasChanged.confirm){
                $rootScope.$broadcast('showMessageWhenFileChanged', {title:'New Version', desc:hasChanged.res.items[0].Description, docid:hasChanged.res.items[0].DocId});
                $rootScope.$broadcast('setConfirmHashChanged', {fnc:function(){
                    $('#popupFileChangedOptions').dxPopup().dxPopup("instance").hide();
                    var para = "";
                    if (getQuery.attach && getQuery.noEdit) {
                        para = "&attach=1&noEdit=1";
                    }
                    if(window != top){
                        $('#popupVersionIframe').dxPopup().dxPopup("instance").show();
                        $rootScope.$broadcast("setTitleVersionPopup",{id:hasChanged.res.items[0].DocId, desc:hasChanged.res.items[0].Description})
                        setTimeout(function(){
                            $("#wdVersionIframeNewTab").dxButton('instance').option('onClick',function(){
                                $window.open('./home?verid=' + x.LID + "&verRec=" + x.RN + "&typeid=version" + para, '_blank');
                                $('#popupVersionIframe').dxPopup().dxPopup("instance").hide();
                            })
                            $("#wdVersionIframeEither").dxButton('instance').option('onClick',function(){
                                $location.path('/home').search({verid: x.LID, verRec:x.RN, typeid:'version'+ para});
                                $route.reload();
                            })
                        }, -1)
                    }else{
                        $window.open('./home?verid=' + x.LID + "&verRec=" + x.RN + "&typeid=version" + para, '_blank');
                    }
                    $(this).off();
                }});
            }else{
                var para = "";
                if (getQuery.attach && getQuery.noEdit) {
                    para = "&attach=1&noEdit=1";
                }
                if(window != top){
                    $rootScope.$broadcast("setTitleVersionPopup",{id:hasChanged.fileData.DocId , desc:hasChanged.fileData.Description})
                    $('#popupVersionIframe').dxPopup().dxPopup("instance").show();
                    setTimeout(function(){
                        $("#wdVersionIframeNewTab").dxButton('instance').option('onClick',function(){
                            $window.open('./home?verid=' + x.LID + "&verRec=" + x.RN + "&typeid=version" + para, '_blank');
                            $('#popupVersionIframe').dxPopup().dxPopup("instance").hide();
                        })
                        $("#wdVersionIframeEither").dxButton('instance').option('onClick',function(){
                            $location.path('/home').search({verid: x.LID, verRec:x.RN, typeid:'version'+ para});
                            $route.reload();
                        })
                    }, -1)
                }else{
                    $window.open('./home?verid=' + x.LID + "&verRec=" + x.RN + "&typeid=version" + para, '_blank');
                }
            }
        })
    }
    $rootScope.$on("setTitleVersionPopup", function(event, data) {
        $scope.docIdVersionIframe = data.id;
        $scope.descriptionVersionIframe = data.desc;
    })
    $scope.popupVersionIframe = {
        width: 'auto',
        height: 'auto',
        maxWidth: '90vw',
        contentTemplate: "popupVersionIframe",
        showTitle: true,
        dragEnabled: true,
        closeOnOutsideClick: false,
        title: "Version",
    };
    $scope.wdVersionIframeNewTab = {
        text: "Open New Tab",
        onClick: function(e) {
            //alert('Open new tab')
        },
        type: "success"
    }
    $scope.wdVersionIframeEither = {
        text: "Replace the existing file list",
        onClick: function(e) {
            //alert('Open on this page')
        },
        type: "success"
    }
    $scope.setCategory = function (x, y, z) {
        if ($scope.rowSetCate != '') {
            y = $scope.rowSetCate;
        }
        wdService.addRemoveCat(x, y.row.data, z).then(function (res) {
            var categoryResp = res.data.category;
            if (categoryResp.errorStatus.ErrorCount !== "") {
                console.log(categoryResp.errorStatus.wd_Error_MSG);
                return false
            }
            y.component.refresh();

        }, function (error) {
            y.component.refresh();
        });
    }


    $scope.getHeight = function (x) {
        if (x) {
            return window.innerHeight - 145;
        } else {
            $timeout(function () {
                $('#gridContainer').height(window.innerHeight - 145);
            }, 0);
        }
    }

    $scope.getWidth = function () {
        setTimeout(function () {
            return window.innerWidth - $('#leftNav').width();
        }, -1);
    }

    $scope.setFavorite = function (x, y, z, n) {
        wdService.setFields(x, y, z, n).then(function (res) {
            var setFav = res.data;
            if (setFav.setField.errorStatus.ErrorCount != "") {
                var data = { fileAction: false };
                $rootScope.$broadcast("errorAction", {visible: true, rctx: setFav.setField.errorStatus.wd_Error_RCTX, data: data});
                return false
            }
            
            switch(n.FF) {
                case undefined :
                    n.FF = "BB_HEART";
                    break;
                case "BB_HEART" : 
                case "IDM_SAVE" : 
                case "IDM_OPEN" : 
                case "IDM_WORKFLOW" : 
                case "IDM_MOVE" :
                case "IDM_COPY" :
                    n.FF = undefined
                    break;
            }

        }, function (error) {
            var data = { fileAction: false };
            $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
        });
    }

    $scope.checkin = {
        uploadUrl: $localStorage.host + $localStorage.uploadLocation,
        bindingOptions: {
            multiple: "multiple",
            accept: "accept",
            value: "value",
            uploadMode: "uploadMode"
        },
        visible: false,
        onUploadError: function (x) {
            var data = { fileAction: false },
            selected = $("#gridContainer").dxDataGrid("instance"),
            rowData = selected.getSelectedRowsData(),
            listNumb = rowData[0].LN,
            loader = $("#wdDesc" + listNumb).dxLoadIndicator("instance");
            loader.option("visible", false);
            $rootScope.$broadcast("errorAction", {visible: true, rctx: "FILE_UPLOAD", data: data});
        },
        onUploaded: function (x) {
            if ($rootScope.checkinType == 'N') {
                $scope.uploadToWldox('1', x.file.name);
                return false;
            }
            $scope.uploadToWldox('', x.file.name);
        },
        onUploadStarted: function (x) {
            var selected = $("#gridContainer").dxDataGrid("instance");
            var rowData = selected.getSelectedRowsData();
            var listNumb = rowData[0].LN;
            var loader = $("#wdDesc" + listNumb).dxLoadIndicator("instance");
            loader.option("visible", true);
        }
    }

    $scope.setDescLoaderId = function (x) {
        return "wdDesc" + x.LN;
    }

    $scope.descLoader = {
        height: 16,
        width: 16,
        visible: false
    }

    $scope.uploadToWldox = function (x, y) {
        var getSelectedData = gridData.getSelectedRowsData();
        var data = { "RN": getSelectedData[0].RN, "LID": getSelectedData[0].LID, "LN": getSelectedData[0].LN };
        wdService.uploadToWorldox(x, data, y).then(function (res) {
            var uploadData = res.data.uploadVerb;
            if (uploadData.errorStatus.ErrorCount != "") {
                var wdData = { fileAction: false };
                $rootScope.$broadcast("errorAction", {visible: true, rctx: uploadData.errorStatus.wd_Error_RCTX, data: wdData});
                return false
            }
            $scope.checkToWdx(data, y, x);
        }, function (err) {
            var data = { fileAction: false };
            $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
        });
    };

    $scope.checkToWdx = function (x, y, z) {
        var getSelectedData = gridData.getSelectedRowsData();
        var getTableData = $("#gridContainer").dxDataGrid("instance");
        wdService.chkToWorldox(x, y).then(function (res) {
            $scope.$parent.fileSuccessMessage = [];
            $scope.$parent.fileErrorMessage = [];
            var chkinData = res.data.fileStatus;
            if (chkinData.errorStatus.ErrorCount != "") {
                var setErrorData = { title: getSelectedData[0].DocId, desc: getSelectedData[0].Description, wdMsg: "File checked-in successfully" }
                $scope.$parent.fileErrorMessage.push(setErrorData);
                $scope.$parent.errorTypeDialog = "action";
                $scope.$parent.fileError = true;
                getTableData.refresh();
                return false
            }

            $rootScope.rec = x.RN;
            $rootScope.wdStatus = Math.round(new Date() / 1000);
            $rootScope.checkType = z;
            wdService.isFileHasChanged().then(function (hasChanged) {
                var source = wdGrid.option('dataSource');
                source.store.update(hasChanged.res.items[0].DocId, hasChanged.res.items[0])
            });
            // var setErrorData = { title: getSelectedData[0].DocId, desc: getSelectedData[0].Description, wdMsg: "File checked-in successfully" }
            // $scope.$parent.fileSuccessMessage.push(setErrorData);
            // $scope.$parent.errorTypeDialog = "action";
            // $scope.$parent.fileError = true;
            getTableData.refresh();
        }, function (error) {
            var data = { fileAction: false };
            $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
        });
    }

    $scope.getTypeLogo = function (type) {
        switch (type) {
            case 'DOCX':
            case 'DOC':
            case 'DOTX':
            case 'ODT':
                return "<div class='ms-BrandIcon--icon16 ms-BrandIcon--word'></div>";
                break;
            case 'CSV':
            case 'ODS':
            case 'XLS':
            case 'XLSX':
            case 'XLTX':
                return "<div class='ms-BrandIcon--icon16 ms-BrandIcon--excel'></div>";
                break;
            case 'MSG':
                return "<div class='ms-BrandIcon--icon16 ms-BrandIcon--outlook'></div>";
                break;
            case 'ODP':
            case 'POTX':
            case 'PPSX':
            case 'PPTX':
            case 'ODP':
            case 'POT':
            case 'PPS':
            case 'PPT':
                return "<div class='ms-BrandIcon--icon16 ms-BrandIcon--powerpoint'></div>";
                break;
            case 'PDF':
                return "<div class='ms-BrandIcon--icon16 ms-BrandIcon--pdf'></div>";
                break;
            case 'JPG':
            case 'PNG':
            case 'GIF':
            case 'JPEG':
            case 'TIFF':
                return "<div class='ms-BrandIcon--icon16 ms-BrandIcon--image'></div>";
                break;
            default:
                return "<div class='ms-BrandIcon--icon16 ms-BrandIcon--filler'></div>";
        }
    }

    $scope.getIconTitle = function (status) {
        switch (status.I) {
            case '0', '48', '49':
                return "";
                break;
            case '51':
                return "Hidden by you"
                break;
            case '52':
                return "File Secured by:" + status.OW
                break;
            case '53':
                return ""
                break;
            case '54':
                return "Read only access"
                break;
            case '55':
                return ""
                break;
            case '56':
                return "Your a Manager with access"
                break;
        }
    }

    $scope.getStatusIcon = function (status) {
        switch (status) {
            case '0', '48', '49':
                return "dx-icon ms-Icon ms-Icon--nothing";
                break;
            case '51':
                return "dx-icon ms-Icon ms-Icon--UnlockSolid statusGreen"
                break;
            case '52':
                return "dx-icon ms-Icon ms-Icon--LockSolid statusGreen"
                break;
            case '53':
                return "dx-icon ms-Icon ms-Icon--LockSolid statusYellow"
                break;
            case '54':
                return "dx-icon ms-Icon ms-Icon--LockSolid statusYellow"
                break;
            case '55':
                return "dx-icon ms-Icon ms-Icon--LockSolid statusRed"
                break;
            case '56':
                return "dx-icon ms-Icon ms-Icon--LockSolid statusRed"
                break;
        }
    }

    $scope.getTilt = function (x) {
        var dec = decodeURI(x);
        return dec;
    }

    $scope.editFields = {
        "field1": "",
        "field2": "",
        "field3": "",
        "field4": "",
        "field5": "",
        "field6": "",
        "field7": "",
        "placeholder1": "",
        "placeholder2": "",
        "placeholder3": "",
        "placeholder4": "",
        "placeholder5": "",
        "placeholder6": "",
        "placeholder7": "",
        "description": "",
        "comment": "",
        "placeholderCo": "Comments",
        "placeholderDesc": "Description"
    }

    $scope.setCatToolTip = function (x) {
        var result = {
            target: '#toolTip' + x,
            showEvent: "dxhoverstart",
            hideEvent: "dxhoverend"
        }
        return result;
    }

    $scope.setTipID = function (x, y) {
        var tipId = ""
        if (y) {
            tipId = "toolTip" + x;
        } else {
            tipId = "tipId" + x;
        }
        return tipId;
    }


    /**
     * Loads dataGrid's row content.
     * @param component, customs component.
     * @param infoData, record data.
     */
    function loadPreview(component, infoData, e) {

        fileID = {
            "LN": infoData.LN,
            "RN": infoData.RN,
            "LID": infoData.LID,
            "Status": infoData.I,
            "DocId": infoData.DocId,
            "tags": infoData.CAT_ID,
            "Description": infoData.Description
        };

        if (e.rowType !== "group" && $scope.$parent.wdView) {
            switch (infoData.GT) {
                case "WDL":
                var decodeWdl = decodeURIComponent(infoData.FilePath + '\\' + infoData.DocId);
                var encodeWdl = encodeURIComponent(decodeWdl);
                $window.open('./home?query=Project: ' + encodeURIComponent(encodeWdl), '_blank');
                    break;
                default:
                    $scope.$parent.dialogTitle = "Preview";
                    $scope.$parent.listOptions = [infoData];
                    $scope.filePage(fileID);
            }

        }

    }

    $scope.getContextual = function (container) {
        $('.hoverMore').on('dxclick', function (event) {
            var newEvent = $.extend({}, event, { type: 'dxcontextmenu' });
            $(this).trigger(newEvent);
        });
    }

    $scope.loadOpen = {
        shadingColor: "rgba(256,256,256,0.2)",
        position: { of: window },
        bindingOptions: {
            visible: "loadingVisible"
        }
    }

    $scope.download = function (x, y) { 

        $scope.dwnSpinner = false;
        $scope.loadingVisible = true;
        $scope.$parent.fileSuccessMessage = [];
        $scope.$parent.fileErrorMessage = [];
        $scope.$parent.dialogTitle = "Download";

        wdService.download(x).then(function (res) {
            var dwnData = res.data.download;
            if (dwnData.errorStatus.ErrorCount != "") {

                $scope.$parent.errorDailog = true;
                $scope.$parent.wdErrorRctx = dwnData.errorStatus.wd_Error_RCTX;
                $scope.$parent.wdFileData = {
                    title: "Download",
                    desc: x.Description,
                    doc: x.DocId,
                    action: "DownloadDocument, wdInfo",
                    fileAction: true
                }

            } else if (dwnData.message) {

                var setErrorData = { title: x.DocId, desc: x.Description, wdMsg: dwnData.message }
                $scope.$parent.fileErrorMessage.push(setErrorData);
                $scope.$parent.errorTypeDialog = "action";
                $scope.$parent.fileError = true;

            } else {

                if (userAgent.indexOf('Frowser') != -1) {
                    $scope.$parent.dialogTitle = $scope.dwnTxt;
                    if (x.Extension === "WDL") {
                        $scope.dwnSpinner = true;
                        $scope.loadingVisible = false;
                        var decodeWdl = decodeURIComponent(x.FilePath + '\\' + x.DocId);
                        var encodeWdl = encodeURIComponent(decodeWdl);
                        $location.path('/home').search({ query: 'Project: ' + encodeWdl });
                    } else {
                        wdService.getFolderLevel().then(function (response) {

                            for (var i = 0; i < response.data.root.Cabinets.length; i++) {
                                var folderList = response.data.root.Cabinets[i].pgFields.split('|');
                                if (response.data.root.Cabinets[i].pgID == x.profileGroupId && x.I !== "54") {
                                   
                                    $scope.checkAttachment(x, res.data, folderList);
                                    return false;
    
                                } else if (response.data.root.Cabinets[i].pgID == x.profileGroupId && x.I == "54") {
                                    
                                    $scope.saveReadOnlyData = {
                                        fileData: res.data,
                                        resData: x,
                                        folderData: folderList
                                    }
                                    $scope.getResponse($scope.saveReadOnlyData.fileData, $scope.saveReadOnlyData.resData, $scope.saveReadOnlyData.folderData);
                                }
                            }
                        }, function (error) {
                            var data = { fileAction: false };
                            $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
                        });
                    }
                    
                } else {

                    if (x.Extension === "PDF") {
                        $scope.dwnSpinner = true;
                        $scope.loadingVisible = false;
                        $window.open($localStorage.host + res.data.download.fileLoc, '_blank');
                        return false;
                    }

                    else if (x.Extension === "WDL") {
                        $scope.dwnSpinner = true;
                        $scope.loadingVisible = false;
                        var decodeWdl = decodeURIComponent(x.FilePath + '\\' + x.DocId);
                        // var decodeWdl = decodeURIComponent(x.FilePath + '\\' + x.DocId);
                        var encodeWdl = encodeURIComponent(decodeWdl);
                        $window.open('./home?query=Project: ' + encodeURIComponent(encodeWdl), '_blank');
                        return false;
                    }


                    // $scope.$parent.errorDailog = true;
                    // $scope.$parent.wdErrorRctx = "*DOWNLOAD_SUCCESS";
                    // $scope.$parent.wdFileData = {
                    //     title: "Download",
                    //     desc: x.Description,
                    //     doc: x.DocId,
                    //     action: "DownloadDocument, wdInfo",
                    //     fileAction: true
                    // }
                    $window.location.href = ($localStorage.host + res.data.download.fileLoc);
                }
            }
            $scope.dwnSpinner = true;
            $scope.loadingVisible = false;
        }, function (error) {
            $scope.dwnSpinner = true;
            $scope.loadingVisible = false;
            var data = { fileAction: false };
            $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
        });
    }

    $scope.checkAttachment = function (x, y, z) {
        if (getQuery.noEdit) {
            $scope.saveReadOnlyData = {
                fileData: y,
                resData: x,
                folderData: z
            }
            $scope.getResponse($scope.saveReadOnlyData.fileData, $scope.saveReadOnlyData.resData, $scope.saveReadOnlyData.folderData);
            return false;
        }
        $scope.checkedOut(x, y, z);
    }

    $scope.getCatList = function (x) {
        var ul = document.createElement("ul");
        ul.classList.add('tipList');
        for (var i = 0; i < x.CAT_ID.length; i++) {
            // if (i <= 4) {
            var li = document.createElement("li");
            //li.innerHTML = "<span class='ms-Icon ms-Icon--Tag'></span>&nbsp;&nbsp;" + x.CAT_ID[i].CD;
            li.innerHTML = "<img src='" + $rootScope.host + x.CAT_ID[i].CI + "' width='8' height='8' /> " + x.CAT_ID[i].CD;
            ul.appendChild(li);
            // }
        }
        return ul.outerHTML;
    }

    $scope.checkedOut = function (x, y, z) {
        if (x.Extension === "WDL") {
            $scope.dwnSpinner = true;
            $scope.loadingVisible = false;
            $scope.dwnloadSpinner = true;
            var decodeWdl = decodeURIComponent(x.FilePath + '\\' + x.DocId);
            var encodeWdl = encodeURIComponent(decodeWdl);
            $window.open('./home?query=Project: ' + encodeURIComponent(encodeWdl), '_blank');
            return false;
        } 
        else if (x.Extension === "MSG") {
            $scope.getResponse(y, x, z)
        }
        else {
            wdService.checkout(x).then(function (res) {
                var wdError = res.data.fileStatus.errorStatus;
                $scope.typeFlg = "";
                if (wdError.wd_Error_RCTX == "WDRC_CHECKOUT_ALREADY_TO_USER" || wdError.wd_Error_RCTX == "WDRC_FILE_ACCESS_DENIED" || wdError.wd_Error_RCTX == "WDRC_CHECKOUT_ALREADY_TO_ME" || wdError.ErrorCount == "") {
                    $scope.typeFlg = wdError.wd_Error_RCTX;
                    $scope.getResponse(y, x, z)
                    return false;
                }
            }, function (error) {
                var data = { fileAction: false };
                $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
            });
        }
    }

    $scope.getResponse = function (x, y, z) {
        var readOnlyFlag = 0,
            zms = x.download.FileZMS.replace(/\\/g, "\\\\"),
            grid = $('#gridContainer').dxDataGrid('instance'),
            gridData = grid.getSelectedRowsData()[0];

        z.shift();
        for (var i = 0; i < z.length; i++) {
            if (z[i] !== "") {
                z[i] = gridData["Field" + (i + 1)];
            } else {
                z[i] = "";
            }
        }

        $scope.$parent.fileError = false;
        if (gridData.I == "54" || $scope.typeFlg == "WDRC_CHECKOUT_ALREADY_TO_USER" || $scope.typeFlg == "WDRC_FILE_ACCESS_DENIED" || $scope.typeFlg == "WDRC_CHECKOUT_ALREADY_TO_ME" || gridData.GT == "MSG") {
            readOnlyFlag = 1;
            var data = { title: "Read-Only", fileAction: true, action: "RedEye, wdInfo", desc: gridData.Description, doc: gridData.DocId };
            $rootScope.$broadcast("errorAction", {visible: true, rctx: "READ_ONLY", data: data});
        
            $scope.readOnlyUrl = $localStorage.host + '/cgi-bin/wdwebcgi.exe?SERVE+wd_SID=' + $localStorage.userData.session + '+html=/api/apiList.json+dwLoc=' + x.download.fileLoc + '+name=' + x.download.FileNme + '+domain=' + $localStorage.host + '+cabinet=' + y.profileGroupId + '+f1=' + z[0] + '+f2=' + z[1] + '+f3=' + z[2] + '+f4=' + z[3] + '+f5=' + z[4] + '+f6=' + z[5] + '+f7=' + z[6] + '+popFlag=' + $scope.softpopFlag + '+zms=' + zms + '+readOnly=' + readOnlyFlag;
            $scope.dwnloadSpinner = true;
            return false
        }
        else if(getQuery.noEdit) {
            readOnlyFlag = 1
            var data = { title: "Attach", fileAction: true, action: "OpenFile, wdInfo", desc: gridData.Description, doc: gridData.DocId };
            $rootScope.readOnlyUrl = $localStorage.host + '/cgi-bin/wdwebcgi.exe?SERVE+wd_SID=' + $localStorage.userData.session + '+html=/api/apiList.json+dwLoc=' + x.download.fileLoc + '+name=' + x.download.FileNme + '+domain=' + $localStorage.host + '+cabinet=' + y.profileGroupId + '+f1=' + z[0] + '+f2=' + z[1] + '+f3=' + z[2] + '+f4=' + z[3] + '+f5=' + z[4] + '+f6=' + z[5] + '+f7=' + z[6] + '+popFlag=' + $scope.softpopFlag + '+zms=' + zms + '+readOnly=' + readOnlyFlag;
            $rootScope.$broadcast("errorAction", {visible: true, rctx: "ATTACH_TYPE", data: data});
            return false
        } else if ( gridData.I == "0") {
            $scope.updateList(gridData);
        }

        $timeout(function () {
            $window.location = $localStorage.host + '/cgi-bin/wdwebcgi.exe?SERVE+wd_SID=' + $localStorage.userData.session + '+html=/api/apiList.json+dwLoc=' + x.download.fileLoc + '+name=' + x.download.FileNme + '+domain=' + $localStorage.host + '+cabinet=' + y.profileGroupId + '+f1=' + z[0] + '+f2=' + z[1] + '+f3=' + z[2] + '+f4=' + z[3] + '+f5=' + z[4] + '+f6=' + z[5] + '+f7=' + z[6] + '+popFlag=' + $scope.softpopFlag + '+zms=' + zms + '+readOnly=' + readOnlyFlag;
            $scope.dwnloadSpinner = true;
        }, -1000);

    }

    $scope.updateList = function (x) {
        wdService.isFileHasChanged().then(function (hasChanged) {
            var grid = $('#gridContainer').dxDataGrid('instance');
            var source = grid.option('dataSource');
            source.store.update(hasChanged.res.items[0].DocId, hasChanged.res.items[0])
            // grid.refresh();
            // x.I = "48";
            // x.CHKOUT_TO_PREF = res.data.file.CTOP;
            // x.CHKOUT_TO_NAME = res.data.file.CTON;
            // x.CHKOUT_ON_PREF = res.data.file.CONP;
            // x.CHKOUT_ON_DATE = res.data.file.COND;
        }, function (error) {
            console.log(error);
        });
    };

    $scope.loadHeader = function (x) {
        $scope.gridHeader = {
            "f1code": x !== undefined ? x.Field1 : "",
            "f1desc": x !== undefined ? x.Field1Desc : "",
            "f1name": x !== undefined ? x.Field1Name : "",
            "f2code": x !== undefined ? x.Field2 : "",
            "f2desc": x !== undefined ? x.Field2Desc : "",
            "f2name": x !== undefined ? x.Field2Name : "",
            "f3code": x !== undefined ? x.Field3 : "",
            "f3desc": x !== undefined ? x.Field3Desc : "",
            "f3name": x !== undefined ? x.Field3Name : "",
            "f4code": x !== undefined ? x.Field4 : "",
            "f4desc": x !== undefined ? x.Field4Desc : "",
            "f4name": x !== undefined ? x.Field4Name : "",
            "f5code": x !== undefined ? x.Field5 : "",
            "f5desc": x !== undefined ? x.Field5Desc : "",
            "f5name": x !== undefined ? x.Field5Name : "",
            "f6code": x !== undefined ? x.Field6 : "",
            "f6desc": x !== undefined ? x.Field6Desc : "",
            "f6name": x !== undefined ? x.Field6Name : "",
            "f7code": x !== undefined ? x.Field7 : "",
            "f7desc": x !== undefined ? x.Field7Desc : "",
            "f7name": x !== undefined ? x.Field7Name : ""
        }
    }

    $scope.checkInId = function (e) {
        return "checkInLink" + e.LN;
    }
    
    $scope.chkRights = function(){
        var dwnBtn = $('#wdOpenFile').dxButton('instance'),
        chkOutBtn = $('#wdChkOut').dxButton('instance'),
        metaBtn = $('#wdEditProfile').dxButton('instance'),
        copyBtn = $('#wdCopyProfile').dxButton('instance'),
        viewBtn = $('#wdViewFile').dxButton('instance'),
        getWdMenu = $('#wdMenuOptions').dxMenu('instance'),
        getWdItems = getWdMenu.option("items");
        dwnBtn.option("visible", $localStorage.userRights.Download);
        chkOutBtn.option("visible", $localStorage.userRights['Check-Out']);
        metaBtn.option("visible", $localStorage.userRights['Edit Metadata']);
        copyBtn.option("visible", $localStorage.userRights['Copy']);
        viewBtn.option("visible", $localStorage.userRights['View']);
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

    $scope.checkInSelectType = [
       
        {
            text: "Overwrite",
            value: "o",
            onClick: function (e) {
                var fileUploader = $('#checkin').dxFileUploader('instance');
                fileUploader._isCustomClickEvent = true;
                fileUploader._$fileInput.click();
                $rootScope.checkinType = "R";
            }
        },
        {
            text: "New version",
            value: "v",
            onClick: function (e) {
                var fileUploader = $('#checkin').dxFileUploader('instance');
                fileUploader._isCustomClickEvent = true;
                fileUploader._$fileInput.click();
                $rootScope.checkinType = "N";
            }
        },
        {
            text: "Discard",
            value: "r",
            onClick: function (e) {
                var getRow = $("#gridContainer").dxDataGrid("instance"),
                    setIndex = parseInt($scope.wdSelecteFile.LN) - 1;
                getRow.selectRowsByIndexes(setIndex);
                checkInRecords($scope.wdSelecteFile);
            }
        }
    ];

    $scope.contextMenuTemplate = function (e) {
        var result = {
            target: '#checkInLink' + e.LN,
            dataSource: $scope.checkInSelectType,
            elementAttr: {
                id: "checkInMenu" + e.LN
            }
        }
        return result;
    }

    $scope.checkInFrom = function (x) {
        $("#checkInMenu" + x.LN).dxContextMenu("toggle", true);
        $scope.wdSelecteFile = x;
        // var getRow = $("#gridContainer").dxDataGrid("instance"),
        // setIndex = parseInt(x.LN) -  1;
        // getRow.selectRowsByIndexes(setIndex);
        // checkInRecords(x);
    };

    $scope.setToolbarStatus = function (x) {
        var bool
        var ele
        if (x === undefined) {
            ele = "#wdOpenFile, #wdChkOut, #wdEditProfile, #wdCopyProfile, #wdEmail, #wdViewFile";
            bool = false;
        } else {
            switch (x.I) {
                case "54":
                    ele = "#wdChkOut, #wdEditProfile";
                    bool = true;
                    break;
                case "55":
                    ele = "#wdOpenFile, #wdChkOut, #wdEditProfile, #wdCopyProfile, #wdEmail, #wdViewFile";
                    bool = true;
                    break;
                default:
                    ele = "#wdOpenFile, #wdChkOut, #wdEditProfile, #wdCopyProfile, #wdEmail, #wdViewFile";
                    bool = false;
            }
           
            
        }

        // if (x.I == '54') {}else if (x.I == '55') {}else {}

        $(ele).each(function () {
            $(this).dxButton("instance").option("disabled", bool);
        });

        if (x !== undefined && x.CHKOUT_TO_NAME !== undefined) {
            $("#wdEditProfile").dxButton("instance").option("disabled", true);
            // $("#wdCopyProfile").dxButton("instance").option("disabled", true);
        }

    }

    function checkInRecords(vm) {
        var getselectedFiles = $("#gridContainer").dxDataGrid("instance").getSelectedRowsData();
        $scope.$parent.fileErrorMessage = [];
        $scope.$parent.fileSuccessMessage = [];
        $scope.$parent.dialogTitle = "Check-In";
        $scope.checkInput(vm);
        // for (var i = 0; i < getselectedFiles.length; i++) {
        //      var getloopData = $scope.checkInput(getselectedFiles[i]);
        // }
    }

    /**
     * Makes sequentially several requests to checkout records, using promises.
     * @param vm, current element in datagrid.
     */
    function checkoutRecords(vm) {
        var getselectedFiles = $("#gridContainer").dxDataGrid("instance").getSelectedRowsData();

        for (var i = 0; i < getselectedFiles.length; i++) {
            $scope.checkOutput(getselectedFiles[i]);
        }
    }


    $scope.checkOutput = function (item) {
        var xn = true;
        wdService.checkout(item).then(function (res) {
            var fileResource = res.data.fileStatus;
            if (fileResource.errorStatus.ErrorCount != "") {
                $scope.$parent.errorDailog = true;
                $scope.$parent.wdErrorRctx = fileResource.errorStatus.wd_Error_RCTX;
                $scope.$parent.wdFileData = {
                    title: "Check-Out",
                    desc: item.Description,
                    doc: item.DocId,
                    action: "PageCheckedOut, wdInfo",
                    fileAction: true
                }
                return false;
            }
            $rootScope.wdStatus = Math.round(new Date() / 1000);
            $scope.$parent.errorDailog = true;
            $scope.$parent.wdErrorRctx = "*CHKOUT_SUCCESS";
            $scope.$parent.wdFileData = { title: "Check-Out", desc: item.Description, doc: item.DocId, action: "PageCheckedOut, wdInfo", fileAction: true }
            $scope.dwnload(item, true);
        });
        return xn;
    }

    $scope.errorType = function (fileResource, xn, item) {
        var setErrorData;
        if (fileResource.errorStatus.wd_Error_DOCID !== "") {
            setErrorData = { title: item.DocId, desc: item.Description, wdMsg: fileResource.errorStatus.wd_Error_MSG };
            $scope.$parent.fileErrorMessage.push(setErrorData);
            $scope.$parent.genericError = false;
            $scope.$parent.errorTypeDialog = "action";
            $scope.$parent.fileError = true;
            xn = false;
            return false;
        }

        setErrorData = { wdMsg: fileResource.errorStatus.wd_Error_MSG };
        $scope.$parent.fileErrorMessage.push(setErrorData);
        $scope.$parent.genericError = true;
        $scope.$parent.errorTypeDialog = "action";
        $scope.$parent.fileError = true;

    };

    $scope.checkInput = function (item) {
        var xn = true;
        wdService.checkIn(item).then(function (res) {
            var fileResource = res.data.fileStatus;
            if (fileResource.errorStatus.ErrorCount != "") {
                $scope.errorType(fileResource, xn, item);
                return false;
            }

            wdService.isFileHasChanged().then(function (hasChanged) {
                var wdChKGrid = $("#gridContainer").dxDataGrid("instance"),
                src = wdChKGrid.option('dataSource');
                src.store.update(hasChanged.res.items[0].DocId, hasChanged.res.items[0]).done(function(values) {
                    console.log(values)
                })
                .fail(function(error) {
                    console.log(error)
                });
            });
            // var setSuccessData = { title: item.DocId, desc: item.Description, wdMsg: "File Checked in Succesfully" }
            // $scope.$parent.fileSuccessMessage.push(setSuccessData);
            // item.CHKOUT_TO_LINE = '';
            // delete item['CHKOUT_ON_DATE'];
            // delete item['CHKOUT_ON_PREF'];
            // delete item['CHKOUT_TO_NAME'];
            // delete item['CHKOUT_TO_PREF'];
            // $scope.$parent.errorTypeDialog = "action";
            // $scope.$parent.fileError = true;
        });
        return xn;
    }

    // $scope.gridToast = {
    //     message: "No File(s) found!",
    //     type: "error",
    //     bindingOptions: {
    //         visible: 'dataToastVisible'
    //     }
    // }

    //Delete file Popup option
    $scope.currentDeleteFiles = {};
    $scope.visibleDeletePopup = false;

    //Make responsive for popup Delete
    $scope.width_popupDel = 550;
    if ($(window).width() < 768) {
        $scope.width_popupDel = '80%';
    }
    $scope.popupOptions = {
        width: $scope.width_popupDel,
        height: 'auto', //400
        contentTemplate: "delete",
        showTitle: true,
        title: "Delete",
        dragEnabled: false,
        closeOnBackButton: false,
        closeOnOutsideClick: false,
        showCloseButton: false,
        bindingOptions: {
            visible: "visibleDeletePopup",
        }
    };

    $scope.showDeletePopup = function (e) {
        $scope.currentDeleteFiles = e;
        $scope.visibleDeletePopup = true;
    };

    $rootScope.$on("openDeletePopup", function (e, data) {
        $scope.currentDeleteFiles = data;
        $scope.visibleDeletePopup = true;
    });

    $scope.validateGroup = {
        validationRules: [{
            type: "required",
            message: "Please select a Delete method"
        }]
    }


    $scope.applyDeleteButtonOptions = {
        text: "Ok",
        type: "success",
        width: 90,
        useSubmitBehavior: true
    };

    $scope.deleteData = function () {
        $scope.visibleDeletePopup = false;
        angular.forEach($scope.currentDeleteFiles, function (key, index) {
            var xn = true;
            wdService.deleteFile(key, $scope.deleteValue).then(function (res) {
                var setDeleteReturn = res.data;
                $scope.$parent.fileErrorMessage = [];
                $scope.$parent.fileSuccessMessage = [];
                if (setDeleteReturn.fileStatus.errorStatus.ErrorCount !== "") {
                    $scope.$parent.dialogTitle = "Delete";
                    $scope.errorType(setDeleteReturn.fileStatus, xn, key);
                    return false;
                }
                var getTableData = $("#gridContainer").dxDataGrid("instance");
                getTableData.refresh();
            });
        });
    }

    $scope.cancelDeleteButtonOptions = {
        text: "Cancel",
        type: "danger",
        width: 90,
        onClick: function (e) {
            $scope.visibleDeletePopup = false;
        }
    };

    $scope.dwnload = function (element, xn) {
        $scope.dwnloadSpinner = false;
        var x = {
            "RN": element.RN,
            "LID": element.LID,
            "LN": element.LN,
            "PGID": element.profileGroupId,
            "Field1": element.Field1,
            "Field2": element.Field2,
            "Field3": element.Field3,
            "Field4": element.Field4,
            "Field5": element.Field5,
            "Field6": element.Field6,
            "Field7": element.Field7
        }

        wdService.download(x).then(function (res) {

            $scope.$parent.fileErrorMessage = [];
            var dwnData = res.data.download;
            if (dwnData.errorStatus.ErrorCount !== "") {
                var setErrorData = { title: x.DocId, desc: x.Description, wdMsg: dwnData.errorStatus.wd_Error_MSG }
                $scope.dwnloadSpinner = true;
                $scope.$parent.fileErrorMessage.push(setErrorData);
                $scope.$parent.errorTypeDialog = "action";
                $scope.$parent.fileError = true;

            } else if (dwnData.message) {
                var setErrorData = { title: x.DocId, desc: x.Description, wdMsg: dwnData.errorStatus.wd_Error_MSG }
                $scope.dwnloadSpinner = true;
                $scope.$parent.fileErrorMessage.push(setErrorData);
                $scope.$parent.errorTypeDialog = "action";
                $scope.$parent.fileError = true;

            } else {

                if (userAgent.indexOf('Frowser') != -1) {

                    wdService.getFolderLevel().then(function (response) {
                        for (var i = 0; i < response.data.root.Cabinets.length; i++) {
                            if (response.data.root.Cabinets[i].pgID == x.PGID) {
                                var folderList = response.data.root.Cabinets[i].pgFields.split('|');
                                $scope.checkedOut(x, res.data, folderList);
                                return false;
                            }
                        }
                    }, function (error) {
                        $scope.dwnloadSpinner = true;
                        $log.error(error);
                        var data = { fileAction: false };
                        $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
                    });

                } else {

                    $scope.dwnloadSpinner = true;
                    if (xn != true) {
                        $scope.$parent.fileSuccessMessage = [];
                        var setSuccessData = { title: x.DocId, desc: x.Description, wdMsg: "File downloaded Succesfully" }
                        $scope.$parent.fileSuccessMessage.push(setSuccessData);
                        $scope.$parent.errorTypeDialog = "action";
                        $scope.$parent.fileError = true;
                    }

                    $scope.dwnloadSpinner = true;
                    $window.location.href = ($localStorage.host + res.data.download.fileLoc);
                    $scope.updateList(element);

                }

                var getTableData = $("#gridContainer").dxDataGrid("instance");
                getTableData.refresh();
            }
        }, function (error) {
            $log.error(error);
        });
    }

    function mouseLeftBoth(x) {
        if (mouseLeftD1 && mouseLeftD2) {
            $("#tipId" + x).dxTooltip("instance").hide();
        }
    };

    $scope.isPopupVisible = false;

    $scope.setDescNme = function(x) {
        if (x.szRC) {
            return x.szRC
        } else {
            return x.Description
        }
    }

    $scope.setDescColor = function(x) {
        if (x) {
            return "#e24e80"
        } else {
            return ""
        }
    }

    $scope.popupCustomizeOptions = {
        width: 210,
        height: 120,
        contentTemplate: "info",
        showTitle: false,
        dragEnabled: false,
        closeOnOutsideClick: function () {
            $scope.isPopupVisible = !$scope.isPopupVisible
        },
        // closeOnBackButton: false,
        // showCloseButton: false,
        position: {
            my: "left",
            at: "bottom",
            of: "#btnCustomize"
        },
        bindingOptions: {
            visible: "isPopupVisible",
        }

    };
    $scope.cancelCustomizeListView = function () {
        $scope.isPopupVisible = false;
    }
    $scope.applyCustomerListView = function () {
        $scope.isPopupVisible = false;
        $localStorage.showComments =  $scope.showComments;
        $scope.saveFavView();
    }
    $scope.isPopupVisibleColumnChooser = false;
    $scope.popupColumnChooserOptions = {
        width: 250,
        height: 320,
        contentTemplate: "info",
        title: "Column Chooser",
        dragEnabled: true,
        closeOnOutsideClick: false,
        closeOnBackButton: false,
        showCloseButton: true,
        position: {
            my: "left",
            at: "bottom",
            of: $rootScope.parentColumnChoose
        },
        bindingOptions: {
            visible: "isPopupVisibleColumnChooser",
        }
    };

    $scope.removeLoader = function(x) {
        var totalRf
        if (x) {
            totalRf = gridRfId + 1
            // console.log(totalRf);
            return false
        }
        totalRf = gridRfId - 1
        if (totalRf == 0) {
            // console.log(totalRf);
        }
    }


    $scope.setComments = function (x) {
        var commentData = "<i class='ms-Icon ms-Icon--Comment listComments' aria-hidden='true'></i><span pg-clamp='2' class='commentTxt'>" + x + "</span>";
        return commentData;
    }

    $scope.deleteList = [
        { "text": "Move to Salvage Bin", "value": parseInt(16384) + parseInt(72) },
        { "text": "Delete", "value": 16384 },
        { "text": "Shred (unrecoverable)", "value": parseInt(16384) + parseInt(65536) }
    ];

    $scope.delGroup = {
        items: $scope.deleteList,
        // value: priorities[2],
        itemTemplate: function (itemData, _, itemElement) {
            itemElement.parent().text(itemData.text);
        },
        onValueChanged: function (e) {
            $scope.deleteValue = e.value.value;
        }
    }

    $scope.applyColumnChooserPopUp = function () {
        $scope.isPopupVisibleColumnChooser = false;
        $scope.isPopupVisible = false;
        var arr_selected_item = $("#hdd-selecteditem").val().split(", ");
        var grid = $("#gridContainer").dxDataGrid("instance");
        // grid.beginUpdate();
        for (var i = 0; i < $scope.columnarr.length; i++) {
            var item = $scope.columnarr[i];
            var check = 0;
            
            for (var t = 0; t < arr_selected_item.length; t++) {
                if (item[0] == arr_selected_item[t]) {
                    check = 1;
                }
            }
            if (check == 1) {
                grid.columnOption(item[1], "visible", true);
            } else {
                grid.columnOption(item[1], "visible", false);
            }
        }
        //grid.refresh();
        // grid.endUpdate();
        if (arr_selected_item.indexOf("Ver #") != -1) {
            $scope.showVersion = false;
        } else {
            if ($scope.markVersion) {
                $scope.showVersion = true;
            }
        }

        if (arr_selected_item.indexOf("Modified") != -1) {
            $scope.showModified = false;
        } else {
            if ($scope.markModified) {
                $scope.showModified = true;
            }
        }

        if (arr_selected_item.indexOf("Size") != -1) {
            $scope.showSize = false;
        } else {
            if ($scope.markSize) {
                $scope.showSize = true;
            }
        }

        if (arr_selected_item.indexOf("Created") != -1) {
            $scope.showCreated = false;
        } else {
            if ($scope.markCreated) {
                $scope.showCreated = true;
            }
        }

        if (arr_selected_item.indexOf("Accessed") != -1) {
            $scope.showAccessed = false;
        } else {
            if ($scope.markAccessed) {
                $scope.showAccessed = true;
            }
        }

        if (arr_selected_item.indexOf("Doc ID") != -1) {
            $scope.showDocID = false;
        } else {
            if ($scope.markDocId) {
                $scope.showDocID = true;
            }
        }
        if ($localStorage.MarkFavView) {
            $scope.saveFavView();
        }
    }

    $scope.saveFavView = function () {
        //setTimeout(function(){
        var grid = $("#gridContainer").dxDataGrid("instance");
        var columns = grid.getVisibleColumns().filter(function (item) {
            return item.showInColumnChooser
        }).map(function (item) {
            return item.caption
        })
        var widthColumns = grid.getVisibleColumns().filter(function (item) {
            return item.showInColumnChooser
        }).map(function (item) {
            return grid.columnOption(item.caption, 'width')
        })
        var arr_indexcolumn = [];
        var dataGridInstance = $("#gridContainer").dxDataGrid("instance");
        for (var i = 0; i < dataGridInstance.columnCount(); i++) {
            var column = dataGridInstance.columnOption(i);
            arr_indexcolumn.push(column.visibleIndex);
        }
        $localStorage.ColumnsIndex = arr_indexcolumn;
        $localStorage.MarkFavView = true;
        $localStorage.ColumnsChooser = columns;
        $localStorage.DescriptionWidth = grid.columnOption('Description', 'width');
        $localStorage.ColumnsWidths = widthColumns;
        localStorage.setItem('ngStorage-ColumnsWidths', JSON.stringify(widthColumns));
        //}, 100)
        // if (columns.indexOf("Comments") != -1) {
        //     $scope.showComments = false;
        // } else {
        //     $scope.showComments = true;
        // }

        if (columns.indexOf("Ver #") != -1) {
            $scope.showVersion = false;
        } else {
            if ($scope.markVersion) {
                $scope.showVersion = true;
            }
        }

        if (columns.indexOf("Modified") != -1) {
            $scope.showModified = false;
        } else {
            if ($scope.markModified) {
                $scope.showModified = true;
            }
        }

        if (columns.indexOf("Size") != -1) {
            $scope.showSize = false;
        } else {
            if ($scope.markSize) {
                $scope.showSize = true;
            }
        }

        if (columns.indexOf("Created") != -1) {
            $scope.showCreated = false;
        } else {
            if ($scope.markCreated) {
                $scope.showCreated = true;
            }
        }

        if (columns.indexOf("Accessed") != -1) {
            $scope.showAccessed = false;
        } else {
            if ($scope.markAccessed) {
                $scope.showAccessed = true;
            }
        }

        if (columns.indexOf("Doc ID") != -1) {
            $scope.showDocID = false;
        } else {
            if ($scope.markDocId) {
                $scope.showDocID = true;
            }
        }
    }
    $scope.hoverDescription = function (e) {
        var ptnt = e.currentTarget.parentElement;
        if (ptnt.scrollWidth > ptnt.clientWidth) {
            var str = e.currentTarget.innerHTML;
            $scope.ttl_dsc = str;
        } else {
            $scope.ttl_dsc = ' ';
        }
    }
    $rootScope.setTitleHeaderWidth = function () {
        $("#listTitle").css({ 'max-width': "0px", "width": "0px" });
        var width_header = $("#gridContainer .dx-datagrid-header-panel").width();
        var width_after = $("#gridContainer .dx-datagrid-header-panel .dx-toolbar-after").width();
        var width_before = parseInt(width_header) - parseInt(width_after) - 50;
        setTimeout(function () {
            $("#listTitle").css({ 'max-width': width_before + "px", "width": width_before + "0px" });
        }, 100);
    }
};
