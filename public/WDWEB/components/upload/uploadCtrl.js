angular.module('WDWeb').controller("uploadCtrl",
['$scope', '$rootScope', '$route', '$routeParams', '$timeout', '$log', '$window', '$localStorage', '$location', 'uploader', 'wdService', 'leftNavService', "fileListUI", "$cookies", "wdxLogoutService",
function($scope, $rootScope, $route, $routeParams, $timeout, $log, $window, $localStorage, $location, uploader, wdService, leftNavService, fileListUI, $cookies, wdxLogoutService){
    var userAgent = $window.navigator.userAgent;
    var searchQuery = $location.search().query;
    var authSession = $cookies.get("wdSession");
    var param = $location.search();
    this.toogle = false;
    this.fieldPanel = false;
    $scope.cabinetList = [];
    $scope.fieldTableSpin = true;
    $scope.softpopFlag = 2;
    this.slider = true;
    $rootScope.leftMenuAction = 3;
    $scope.saveSelected = "0";
    $scope.openCats = false;
    $scope.radioData = [];
    $scope.openCustom = false;
    $scope.showPgFields = {"field1": "", "field2": "", "field3": "", "field4": "", "field5": "", "field6": "", "field7": ""};
    $scope.typePgFields = {"field1": 0, "field2": 0, "field3": 0, "field4": 0, "field5": 0, "field6": 0, "field7": 0};
    $scope.listOfTags = [];
    $scope.tagValues = [];
    $scope.host = $localStorage.host;
    $rootScope.pageTitle = "Save to Worldox";
    $rootScope.host = $localStorage.host;
    $scope.fileError = false;
    $scope.chkVer;
    $scope.textValue = "";
    var addVer = "";
    $scope.verBtnTxt = "";
    $scope.addVer = "Save as Version";
    $scope.saveType = "0";
    $scope.errorDailog = false;
    $scope.wdErrorRctx = "";
    $scope.WDXHOST = $localStorage.host;
    $scope.wdFileData = "";
    $scope.noResults = "";
    $scope.format = "";

    window.onresize = function() {
        $("#leftSaveAs").dxScrollView("instance").option("height", (window.innerHeight - 225));
    }


    $scope.checkDesc = {
        validationRules: [
            { type: "required", "message": "Description is required." }
        ]
    }

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

    $scope.setDescValue = function(e) {
        console.log(e);
    }

    $scope.wdFilterBox = {
        placeholder: "Filter",
        elementAttr: {
            id: "wdFilterSave"
        },
        onEnterKey: function(e) {
            $scope.fieldTableSpin = false;
            $scope.textValue = e.event.target.value;
            $scope.noResults = "";
            if ($scope.prefillData == 'ft') {
                $scope.listTable(false, true);
            } else {
                $timeout(function() {
                    $scope.fieldTableSpin = true;
                }, 1000);
            }
        },
        showClearButton: true
    }

    $scope.wdFilterSideBtn = {
        icon: "ms-Icon ms-Icon--Accept",
        onClick: function(e) {
            $scope.fieldTableSpin = false;
            var wdFilter = $("#wdFilterSave").dxTextBox("instance");
            $scope.textValue = wdFilter.option("value");
            $scope.noResults = "";
            if ($scope.prefillData == 'ft') {
                $scope.listTable(false, true);
            } else {
                $timeout(function() {
                    $scope.fieldTableSpin = true;
                }, 1000);
            }
        },
        elementAttr: {
            class: "wdFilterSideBtn"
        }
    }
    
    $scope.init = function() {
        //Check Phx Session
        wdService.chksession().then(function(res){
            if (res.data.user == '' || !res.data.user){
                $localStorage.$reset();
                $location.path("/login");
                $location.url($location.path());
            }
            $scope.setCategoryList("");
        }, function(error) {
            var data = { fileAction: false };
            $scope.setPopupDailog(true, "FAILED_SERVER", data);
        });

        if (authSession !== undefined) {
            $cookies.remove("wdSession");
        }

        $scope.tabNav = $location.url();

        $scope.uploadData = {
            "Cabinets": "",
            "Description": "",
            "Security": "",
            "Type": "1",
            "SaveAs": "",
            "Comments": ""
        };

        if (param.desc) {
            $scope.uploadData.Description = $location.search().desc.split('.')[0];
        }

        $scope.fileFlag = false;
        $scope.btnTxt = "Save"
        $scope.accept = "*";
        $scope.value = [];
        $scope.uploadMode = "instantly";
        $scope.toggle = false;
        $scope.fieldPanel = false;
        $scope.isLoginValid = true;
        $scope.loginValidationError = {};
        this.fieldListData = [];
        this.selectedTab = "QuickProfiles";
        this.listOptions = [];
        $scope.uploadInc = true;
        $scope.prefillData ='qp';
        $scope.searchMode = "contains";
        $scope.uploadTitle = "QuickProfile";
        $scope.selectedField = 0;

        $scope.setAnchor = function(x) {
            var wdFilter = $("#wdFilterSave").dxTextBox("instance");
            wdFilter.option("value", "");
            $scope.textValue = "";
            if (x == "qp") {
                $scope.selected = $scope.quickProfile[0];
                return false;
            }
            $scope.selected = $scope.favMatters[0];
        }

        $timeout(function(){
            angular.element(document).ready(function(){
                var SpinnerElements = document.querySelectorAll(".fieldSpinner");
                for (var i = 0; i < SpinnerElements.length; i++) {
                    new fabric['Spinner'](SpinnerElements[i]);
                }
            });
        }, 0);

        if (searchQuery != "") {
            wdService.fileList(searchQuery, 1, 100).then(function(res) {
                var data = res.data.root;
                if (data.Header.ErrorCount != "") {
                    $scope.saveType = "2";
                    // $scope.wdSetDefaultCab();
                } else {

                    if (data.items.length == "1") {
                        var version = "";

                        if (data.items[0].Version == undefined) {
                            version = 1;
                        } else {
                            version = parseInt(data.items[0].Version);
                        }

                        if (param.wdVer == "" || param.wdVer == version) {
                            $scope.chkVer = true;
                            $scope.fileMeta = data.items[0];
                        } else {
                            $scope.chkVer = false;
                            $scope.getVersionMeta();
                        }

                        addVer = '#' + (version + 1);
                        $scope.addVer = "Save as Version " + addVer;
                        $scope.saveType = "1";
                        $scope.saveSelected = "2";
                        $scope.radioData = [
                            {
                                "text": "New version " +  addVer,
                                "value": 2113,
                                "visible": $scope.chkVer
                            },
                            { "text": "Replace original", "value": 72 },
                            { "text": "New File", "value": "0" }
                        ]
                        $scope.checkSaveType();
                    } else {
                        $scope.saveType = "2";
                        // $scope.wdSetDefaultCab();
                    }
                }
            }, function(error){
                var data = { fileAction: false };
                $scope.setPopupDailog(true, "FAILED_SERVER", data);
            });
        } else {
            $scope.saveType = "2";
        }

        $scope.checkSaveType = function() {
            if ($location.search().popupType == "4") {
                var zms = "";
                var setDataField = {
					field1: $scope.fileMeta.Field1 !== undefined ? $scope.fileMeta.Field1 :  "",
					field2: $scope.fileMeta.Field2 !== undefined ? $scope.fileMeta.Field2 :  "",
					field3: $scope.fileMeta.Field3 !== undefined ? $scope.fileMeta.Field3 :  "",
					field4: $scope.fileMeta.Field4 !== undefined ? $scope.fileMeta.Field4 :  "",
					field5: $scope.fileMeta.Field5 !== undefined ? $scope.fileMeta.Field5 :  "",
					field6: $scope.fileMeta.Field6 !== undefined ? $scope.fileMeta.Field6 :  "",
					field7: $scope.fileMeta.Field7 !== undefined ? $scope.fileMeta.Field7 :  "",
					desc: $scope.fileMeta.Description !== undefined ? $scope.fileMeta.Description : "",
                    comment: $scope.fileMeta.Comments !== undefined ? $scope.fileMeta.Comments : "",
                    name: $scope.fileMeta.Name !== undefined ? $scope.fileMeta.Name : ""
				}
                var serveURL = $localStorage.host + '/cgi-bin/wdwebcgi.exe?SERVE+wd_SID=' + $localStorage.userData.session + '+html=/api/apiList.json+cabinet=' + $scope.fileMeta.profileGroupId + '+f1=' + setDataField.field1 + '+f2=' + setDataField.field2 + '+f3=' + setDataField.field3 + '+f4=' + setDataField.field4 + '+f5=' + setDataField.field5 + '+f6=' + setDataField.field6 + '+f7=' + setDataField.field7  + '+desc=' + setDataField.desc + '+type=' + $scope.uploadData.Type + '+security=' + $scope.uploadData.Security + '+zms=' + zms + '+loc=' + $localStorage.uploadLocation + '+domain=' + $localStorage.host + '+popFlag=' + $scope.softpopFlag + '+name=' + setDataField.name + '+wd_List_ID=' + $scope.fileMeta.LID + '+wd_List_RecNum=' + $scope.fileMeta.RN;
                $window.location.href = (serveURL);
            }
        }

        wdService.getQuickProfile().then(function(res){
            $scope.quickProfile = res.data.root.QuickProfiles;
            $scope.selected = res.data.root.QuickProfiles[0];
        }, function(error){
            var data = { fileAction: false };
            $scope.setPopupDailog(true, "FAILED_SERVER", data);
        });

        wdService.getFavMatters().then(function(res){
            $scope.favMatters = res.data.root.FavMatters;
        }, function(error){
            var data = { fileAction: false };
            $scope.setPopupDailog(true, "FAILED_SERVER", data);
        });

        leftNavService.iniData($location.search().formats, 2).then(function(response) {
            var getTypeList = response.data.root;
            if (getTypeList.Header.ErrorCount != "") {
                var data = { fileAction: false };
                $scope.setPopupDailog(true, getTypeList.Header.wd_Error_RCTX, data);
                return false
            }

            if (getTypeList.items == "" && !param.ext) {
                fileExt.push(
                    {
                        "D": "",
                        "K": "Default (*.rtf)"
                    }
                );
                $scope.uploadData.SaveAs = "rtf";
            } else if (getTypeList.items == "" && param.ext) {
                $scope.getFileExt();
            } else {

                for (i = 0; i < getTypeList.items.length; i++) {
                    fileExt.push(getTypeList.items[i]);
                };

                leftNavService.iniData($location.search().hook, 2).then(function(res) {
                    var getHookType = res.data.root;
                    var setDefaultHook = false;
                    if (getHookType.Header.ErrorCount != "") {
                        var data = { fileAction: false };
                        $scope.setPopupDailog(true, getHookType.Header.wd_Error_RCTX, data);
                        return false
                    }
                    
                    for (i = 0; i < getHookType.items.length; i++) {
                        if (getHookType.items[i].K == "DefaultExt") {
                            setDefaultHook = true;
                            $scope.uploadData.SaveAs = getHookType.items[i].D;
                            return false;
                        }
                    }

                    if (!setDefaultHook) {
                        var firstExt = fileExt[0].K.split("(*.")[1],
                        reExt = firstExt.split(")")[0];
                        $scope.uploadData.SaveAs = reExt;
                    }

                }, function(error) {
                    var data = { fileAction: false };
                    $scope.setPopupDailog(true, "FAILED_SERVER", data);
                });
            }

        }, function(error) {
            var data = { fileAction: false };
            $scope.setPopupDailog(true, "FAILED_SERVER", data);
        });

        $scope.setFavMatter = function(e, x) {
            var setCopy = angular.copy(e);
            var setFavMatter = [];
            for(var i = 1;  i <= 7; i++) {
                if (x) {
                    if (e.hasOwnProperty("f" + i + "d") && e["f" + i + "d"] !== "") {
                        var data = "<span class='favAlign'><b>" + setCopy["f" + i + "n"] + "</b> " + setCopy["f" + i + "c"] + " " + setCopy["f" + i + "d"] + "</span><br/>";
                        setFavMatter.push(data);
                    }
                } else {
                    if (e.hasOwnProperty("f" + i + "c") && e["f" + i + "c"] !== "") {
                        var data = "<span class='favAlign'><b>" + setCopy["f" + i + "n"] + "</b> " + setCopy["f" + i + "c"] + " " + setCopy["f" + i + "d"] + "</span><br/>";
                        setFavMatter.push(data);
                    }
                }
            }
            setFavMatter.unshift("<h3><b>&nbsp;&nbsp;" + setCopy.szPGID.toUpperCase() + "</b></h3>");
            return setFavMatter.join("&nbsp;&nbsp;");
        }
        $scope.wdCommentDesc = "";

        $scope.editDescComment = {
            height: 90,
            bindingOptions: {
                value: "wdCommentDesc"
            },
            onInitialized: function(e){
                if($scope.fileMeta !== undefined) {
                    if ($scope.fileMeta.Comments) {
                        $scope.wdCommentDesc = $scope.fileMeta.Description + '\r\n\r\n' + $scope.fileMeta.Comments;
                        return false;
                    }
                    $scope.wdCommentDesc = $scope.fileMeta.Description;
                }
            },
            onValueChanged: function(e) {
                $scope.wdCommentDesc = e.value;
            }
        }


        $scope.groupValue = 72;

        $scope.formContainer = {
            scrollByContent: true,
            scrollByThumb: true,
            showScrollbar: "always",
            height: function() {
                return window.innerHeight - 150
            },
            useNative: true 
        }

        $scope.saveContainer = {
            scrollByContent: true,
            scrollByThumb: true,
            showScrollbar: "always",
            useNative: true 
            // height: function(e) {
            //     return $scope.setSaveContainerHeight();
            // }
        }

        $scope.scrollLeftNav = {
            scrollByContent: true,
            scrollByThumb: true,
            showScrollbar: "always",
            height: function() {
                return window.innerHeight - 150;
            },
            useNative: true 
        }

        $scope.setSaveContainerHeight = function() {
            return window.innerHeight - 150;
        }

        window.onresize = function() {
            //$("#saveContainer").dxScrollView("instance").option("height", ($scope.setSaveContainerHeight()));
        }


        $scope.selectSave = {
            bindingOptions: {
                dataSource: "radioData",
                value: 'groupValue'
            },
            valueExpr: 'value',
            layout: "horizontal",
            width: "100%",
            onValueChanged: function(e) {
                $scope.groupValue = e.value;
                $scope.saveSelected = e.value;
                if (e.value == '0') {
                    $scope.btnTxt = "Next";
                } else {
                    $scope.btnTxt = "Save";
                }
            }
        }

        $scope.wdReplace = {
            text: "Replace File",
            elementAttr:{
                id: "wdReplaceBtn"
            },
            onClick: function(e){
                if (param.wdVer) {
                    wdService.fileList(searchQuery, 1, 100).then(function(res) {
                        $scope.versionList = res.data.root.items[0];
                        var getVersion = parseInt($scope.versionList.Version);
                        for(var i = 1; i <= getVersion; i++) {
                            if (i == param.wdVer) {
                                wdService.getVersion($scope.versionList).then(function(response){
                                    var verList = response.data.root.items;
                                    angular.forEach(verList, function(key, idx) {
                                        if (parseInt(key.Version) == i){
                                            $scope.fileMeta = key;
                                            $scope.groupValue = 72;
                                            $scope.saveSelected = 72;
                                            $rootScope.setSaveType = false;
                                            $scope.saveAs();
                                            return false;
                                        }
                                    });
                                });
                                return false;
                            }
                        }
                    });
                } else {
                    $scope.groupValue = 72;
                    $scope.saveSelected = 72;
                    $rootScope.setSaveType = false;
                    $scope.saveAs();
                }

            },
            type: "success",
        }

        $scope.wdVersion = {
            bindingOptions: {
                text: "addVer",
                visible: "chkVer"
            },
            elementAttr:{
                id: "wdVersionBtn"
            },
            onClick: function(e){
                $scope.groupValue = 2113;
                $scope.saveSelected = 2113;
                $rootScope.setSaveType = true;
                $scope.saveAs();
            },
            type: "success"
        }

        $scope.wdNewFile = {
            text: "Save as New File",
            elementAttr:{
                id: "wdNewFileBtn"
            },
            onClick: function(e){
                $scope.groupValue = "0";
                $scope.saveSelected = "0";
                $rootScope.setSaveType = false;
                $scope.btnTxt = "Next";
                $scope.fields.field1.value = $scope.fileMeta.Field1;
                $scope.fields.field2.value = $scope.fileMeta.Field2;
                $scope.fields.field3.value = $scope.fileMeta.Field3;
                $scope.fields.field4.value = $scope.fileMeta.Field4;
                $scope.fields.field5.value = $scope.fileMeta.Field5;
                $scope.fields.field6.value = $scope.fileMeta.Field6;
                $scope.fields.field7.value = $scope.fileMeta.Field7;

                for(var i = 1; i <= 7; i++) {
                    if ($scope.fileMeta["Field" + i + "Name"] == undefined) {
                        $scope.fileMeta["Field" + i + "Name"] = "";
                        $scope.fieldDesc["field" + i] = "";
                    } else {
                        $scope.fieldDesc["field" + i] = $scope.fileMeta["Field" + i + "Desc"];
                        }
                    $scope.showPgFields["field" + i] = $scope.fileMeta["Field" + i + "Name"];
                }

                angular.forEach($scope.cabinetList, function(key, idx) {
                    if (key.PGID == parseInt($scope.fileMeta.profileGroupId)){
                        $scope.uploadData.Cabinets = key;
                        return false;
                    }
                });
                
                $scope.saveAs();
            },
            type: "success"
        }

        $scope.saveAs = function() {
            if ($scope.saveSelected == "0") {
                $scope.uploadData.Type = '0';
                $scope.saveType = "2";
            } else {
                $scope.fields.field1.value = $scope.fileMeta.Field1;
                $scope.fields.field2.value = $scope.fileMeta.Field2;
                $scope.fields.field3.value = $scope.fileMeta.Field3;
                $scope.fields.field4.value = $scope.fileMeta.Field4;
                $scope.fields.field5.value = $scope.fileMeta.Field5;
                $scope.fields.field6.value = $scope.fileMeta.Field6;
                $scope.fields.field7.value = $scope.fileMeta.Field7;
                $scope.uploadData.Cabinets = $scope.fileMeta.profileGroupId + '|';
                $scope.uploadData.Description = $scope.fileMeta.Description;
                $scope.uploadData.Type = $scope.saveSelected;
                $scope.sendTo();
            }
        }

        $scope.securityOpt = {
            bindingOptions: {
                formData: "uploadData",
                readOnly: false,
                showColonAfterLabel: true,
                showValidationSummary: false,
                colCount: 1,
            },
            items: uploader.securitySelect(),
            onContentReady: function(e) {
                if ($scope.fileMeta.I == "52") {
                    $scope.uploadData.Security = 8;
                } 
                else if ($scope.fileMeta.I == "51") {
                    $scope.uploadData.Security = 16;
                } 
                else {
                    $scope.uploadData.Security = "";
                }
            }
        }

        $scope.uploadOption = {
            bindingOptions: {
                formData: "uploadData",
                readOnly: false,
                showColonAfterLabel: false,
                showValidationSummary: false,
                colCount: 1,
            },
            onFieldDataChanged: function(e) {
                if (e.dataField === "Cabinets" && e.value) {


                        var getFields = e.value.split('|');
                        $scope.fieldListData = [];
                        if ($scope.prefillData == "ft") {
                            $scope.prefillData = "qp";
                            $scope.selectedField = "";
                        }

                        for(var i = 1;  i <= 7; i++) {
                            e.component.itemOption("Field" + [i], "visible", true);
                            if(getFields[i] != "") {
                                e.component.itemOption("Field" + [i], "visible", true);
                                $scope.fields["field" + i].placeholder = getFields[i];
                            } else {
                                e.component.itemOption("Field" + [i], "visible", false);
                            }
                        }

                        if (param.ext) {
                           $scope.getFileExt();
                        }

                        $scope.fileFlag = false;

                }
            },
            validationGroup: "uploadFile",
            items: uploader.uploadFields()
        }

        $scope.getFileExt = function() {

            fileExt.push(
                {
                    "D": "",
                    "K": "Default (*" + param.ext + ")"
            });

            $scope.uploadData.SaveAs = param.ext.split(".")[1];
        }

        $scope.sendBtn = {
            text: "Save",
            type: "success",
            useSubmitBehavior: true
            //validationGroup: "uploadFile"
        }

        $scope.sendData = {
            bindingOptions: {
                text: "btnTxt",
            },
            type: "success",
            useSubmitBehavior: true,
            onClick: function(e) {
                if ($scope.btnTxt == "Next") {
                    $scope.fields.field1.value = $scope.fileMeta.Field1;
                    $scope.fields.field2.value = $scope.fileMeta.Field2;
                    $scope.fields.field3.value = $scope.fileMeta.Field3;
                    $scope.fields.field4.value = $scope.fileMeta.Field4;
                    $scope.fields.field5.value = $scope.fileMeta.Field5;
                    $scope.fields.field6.value = $scope.fileMeta.Field6;
                    $scope.fields.field7.value = $scope.fileMeta.Field7;

                    for(var i = 1; i <= 7; i++) {
                        if ($scope.fileMeta["Field" + i + "Name"] == undefined) {
                            $scope.fileMeta["Field" + i + "Name"] = "";
                            $scope.fieldDesc["field" + i] = "";
                        } else {
                            $scope.fieldDesc["field" + i] = $scope.fileMeta["Field" + i + "Desc"];
                         }
                        $scope.showPgFields["field" + i] = $scope.fileMeta["Field" + i + "Name"];
                    }
                    $scope.uploadData.Cabinets = $scope.fileMeta.profileGroupId + "|" + $scope.fileMeta.Field1Name + "|" + $scope.fileMeta.Field2Name + "|" + $scope.fileMeta.Field3Name + "|" + $scope.fileMeta.Field4Name + "|" + $scope.fileMeta.Field5Name + "|" + $scope.fileMeta.Field6Name + "|" + $scope.fileMeta.Field7Name + "|"
                }
            }
        }

        $scope.getVersionMeta = function() {
            wdService.fileList(searchQuery, 1, 100).then(function(res) {
                $scope.versionList = res.data.root.items[0];
                var getVersion = parseInt($scope.versionList.Version);
                for(var i = 1; i <= getVersion; i++) {
                    if (i == param.wdVer) {
                        wdService.getVersion($scope.versionList).then(function(response){
                            var verList = response.data.root.items;
                            angular.forEach(verList, function(key, idx) {
                                if (parseInt(key.Version) == i){
                                    $scope.fileMeta = key;
                                    if ($scope.fileMeta.Comments) {
                                        $scope.wdCommentDesc = $scope.fileMeta.Description + '\r\n\r\n' + $scope.fileMeta.Comments;
                                        return false;
                                    }
                                    $scope.wdCommentDesc = $scope.fileMeta.Description;
                                    return false;
                                }
                            });
                        });
                        return false;
                    }
                }
            });
        }

        $scope.focusOutField = function() {
            wdService.getFieldDesc($scope.uploadData.Cabinets, $scope.fields).then(function(res){
                $scope.fieldDesc = {
                    "field1": res.data.Desc.Field1,
                    "field2": res.data.Desc.Field2,
                    "field3": res.data.Desc.Field3,
                    "field4": res.data.Desc.Field4,
                    "field5": res.data.Desc.Field5,
                    "field6": res.data.Desc.Field6,
                    "field7": res.data.Desc.Field7
                  }
            }, function(error){
                var data = { fileAction: false };
                $scope.setPopupDailog(true, "FAILED_SERVER", data);
            })
        }


        $scope.fields = {
            field1: {
                value: "",
                placeholder: "Field1",
                onValueChanged: function(e){
                    $scope.fields.field1.value = e.value;
                }
            },
            field2: {
                value: "",
                placeholder: "Field2",
                onValueChanged: function(e){
                    $scope.fields.field2.value = e.value;
                }
            },
            field3: {
                value: "",
                placeholder: "Field3",
                onValueChanged: function(e){
                    $scope.fields.field3.value = e.value;
                }
            },
            field4: {
                value: "",
                placeholder: "Field4",
                onValueChanged: function(e){
                    $scope.fields.field4.value = e.value;
                }
            },
            field5: {
                value: "",
                placeholder: "Field5",
                onValueChanged: function(e){
                    $scope.fields.field5.value = e.value;
                }
            },
            field6: {
                value: "",
                placeholder: "Field6",
                onValueChanged: function(e){
                    $scope.fields.field6.value = e.value;
                }
            },
            field7: {
                value: "",
                placeholder: "Field7",
                onValueChanged: function(e){
                    $scope.fields.field7.value = e.value;
                }
            }
        }

        $scope.fieldDesc = {
          "field1": "",
          "field2": "",
          "field3": "",
          "field4": "",
          "field5": "",
          "field6": "",
          "field7": ""
        }


        $scope.openPanel = {
            icon: "toolbox",
            onClick: function(e) {
                $scope.toogle = true;
            }
        }

        setTimeout(function(){
            $scope.addFormUpload = true;
        }, 1000);

    }

    $scope.wdSelectInit = function(e) {
        console.log($scope.saveType);
    }

    $scope.saveOutside = {
        text: "Save outside Worldox",
        elementAttr: {
            class: "outSideBtn"
        },
        onClick: function() {
            var serveURL = $localStorage.host + '/cgi-bin/wdwebcgi.exe?SERVE+wd_SID=' + $localStorage.userData.session + '+html=/api/apiList.json+cancel=1';
            $window.location.href = (serveURL);
        }
    }

    $scope.wdSetDefaultCab = function() {
        leftNavService.iniData("SaveDefaults", 1).then(function(res) {
            var defaultPg = res.data.root;
            if (defaultPg.Header.ErrorCount !== "") {
                return false
            }
            angular.forEach(defaultPg.items, function(key, idx) {
                if (key.K == "DefaultPG") {
                    $scope.defaultPg = key.D;
                    return false;
                }
            });
        }, function(error) {
            var data = { fileAction: false };
            $scope.setPopupDailog(true, "FAILED_SERVER", data);
        });
    }

    $scope.$watch('uploadData.Cabinets', function(newValue, oldValue) {
        if (newValue == oldValue) {
            $scope.fileFlag = true;
            return false;
        }
        $scope.fileFlag = false;
    });


    function navigaRoute(x) {
        $location.path( x );
    }

    $scope.isActive = function(x) {
        return $scope.selected === x;
    }

    $scope.sendTo = function() {
        $scope.uploadInc = false;
        var wdSave = $("#wdSaveAsDialog").dxSelectBox("instance");
        
        if (wdSave !== undefined) {
            var saveOpt = wdSave.option("selectedItem");
            $scope.format = saveOpt.D;
        }
        
        if ($scope.saveSelected == '0') {
            $scope.checkMulti();
        } else {
            if ($scope.groupValue == 2113 || $scope.groupValue == 72) {
                $scope.fileMeta.Description = $scope.wdCommentDesc;
                wdService.deleteFile($scope.fileMeta, $scope.groupValue).then(function(res) {
                    var getTypeData = res.data;
                    if (getTypeData.fileStatus.errorStatus.ErrorCount !== "") {
                        $scope.saveFileErr(getTypeData);
                        return false;
                    }
                    $scope.longName = getTypeData.file.DN;
                    $scope.redirectfRowser();
                }, function(error) {
                    var data = { fileAction: false };
                    $scope.setPopupDailog(true, "FAILED_SERVER", data);
                });
            }
        }
    }
    $scope.dateBoxUl1 = {
        dateFormat: {
            type: 'date'
        },
        width: '300'
    }
    $scope.dateBoxUl2 = {
        dateFormat: {
            type: 'date'
        },
        width: '300'
    }
    $scope.dateBoxUl3 = {
        dateFormat: {
            type: 'date'
        },
        width: '300'
    }
    $scope.dateBoxUl4 = {
        dateFormat: {
            type: 'date'
        },
        width: '300'
    }
    $scope.dateBoxUl5 = {
        dateFormat: {
            type: 'date'
        },
        width: '300'
    }
    $scope.dateBoxUl6 = {
        dateFormat: {
            type: 'date'
        },
        width: '300'
    }
    $scope.dateBoxUl7 = {
        dateFormat: {
            type: 'date'
        },
        width: '300'
    }
    $scope.saveFileErr = function(err) {
        switch (err.fileStatus.errorStatus.wd_Error_RCTX) {
            case "WDRC_TESTPROFILE_FIELD_INVALID":
            for(var i = 1; i <= 7; i++) {
                if (err.fileStatus.errorStatus.wd_Error_VAR == "wd_FILE_FIELD" + i + "_VALUE") {
                    $scope.fileMeta["Field" + i + "Desc"] = "Invalid field code";
                    $scope["wdFieldColor" + i] = "#a80000";
                }
            }
            break
            default:
            var data = { fileAction: false };
            $scope.setPopupDailog(true, err.fileStatus.errorStatus.wd_Error_RCTX, data);
        }
    }

    $scope.redirectfRowser = function() {
        var zms = "";
        var setFieldValue = {
            field1: $scope.fields.field1.value !== undefined ? $scope.fields.field1.value: "",
            field2: $scope.fields.field2.value !== undefined ? $scope.fields.field2.value: "",
            field3: $scope.fields.field3.value !== undefined ? $scope.fields.field3.value: "",
            field4: $scope.fields.field4.value !== undefined ? $scope.fields.field4.value: "",
            field5: $scope.fields.field5.value !== undefined ? $scope.fields.field5.value: "",
            field6: $scope.fields.field6.value !== undefined ? $scope.fields.field6.value: "",
            field7: $scope.fields.field7.value !== undefined ? $scope.fields.field7.value: ""
        }
        var serveURL = $localStorage.host + '/cgi-bin/wdwebcgi.exe?SERVE+wd_SID=' + $localStorage.userData.session + '+html=/api/apiList.json+cabinet=' + $scope.fileMeta.profileGroupId + '+f1=' + setFieldValue.field1 + '+f2=' + setFieldValue.field2 + '+f3=' + setFieldValue.field3 + '+f4=' + setFieldValue.field4 + '+f5=' + setFieldValue.field5 + '+f6=' + setFieldValue.field6 + '+f7=' + setFieldValue.field7  + '+desc=' + encodeURIComponent($scope.wdCommentDesc) + '+type=' + $scope.groupValue + '+security=' + $scope.uploadData.Security + '+zms=' + zms + '+loc=' + $localStorage.uploadLocation + '+domain=' + $localStorage.host + '+popFlag=' + $scope.softpopFlag + '+name=' + encodeURIComponent($scope.longName) + '+wd_List_ID=' + $scope.fileMeta.LID + '+wd_List_RecNum=' + $scope.fileMeta.RN + '+format=' + $scope.format;
        $window.location.href = (serveURL);
    }

    $scope.checkMulti = function() {
        if (!param.multi) {
            wdService.newFile($scope.fields, $scope.uploadData).then(function(response) {
                var data = response.data.download;
                var zms = data.FileZMS.replace(/\\/g, "\\\\");
                if (data.errorStatus.ErrorCount != "") {
                    $scope.newFileErr(data);
                    return false;
                }
                $scope.checkTagCategory(data, zms);
            }, function(error) {
                var data = { fileAction: false };
                $scope.setPopupDailog(true, "FAILED_SERVER", data);
            });
        } else {
            wdService.newTestProfile($scope.uploadData, $scope.fields).then(function(res) {
                var fieldTables = res.data;
                if (fieldTables.Header.ErrorCount != "") {
                    $scope.tableErr(fieldTables);
                    return false;
                }
                $window.location.href = ($localStorage.host + '/cgi-bin/wdwebcgi.exe?SERVE+wd_SID=' + $localStorage.userData.session + '+html=/api/apiList.json+cabinet=' + $scope.uploadData.Cabinets.split('|')[0] + '+f1=' + $scope.fields.field1.value + '+f2=' + $scope.fields.field2.value + '+f3=' + $scope.fields.field3.value + '+f4=' + $scope.fields.field4.value + '+f5=' + $scope.fields.field5.value + '+f6=' + $scope.fields.field6.value + '+f7=' + $scope.fields.field7.value  + '+desc=' + $scope.uploadData.Description + '+type=' + $scope.groupValue + '+security=' + $scope.uploadData.Security + '+loc=' + $localStorage.uploadLocation + '+domain=' + $localStorage.host + '+popFlag=' + $scope.softpopFlag + '+comment=' + $scope.uploadData.Comments);

            }, function(error){
                var data = { fileAction: false };
                $scope.setPopupDailog(true, "FAILED_SERVER", data);
            });
        }
    }

    $scope.checkTagCategory = function(data, zms) {
        var myTagList = $('#wdTagsList').dxTagBox('option', 'value');
        var fileData = { LID: data.FileLID, RN: data.FileRN, LN: 0 };
        if (myTagList.length !== 0) {
            var addCategory = "";

            for (var xn = 0; xn < myTagList.length; xn++) {
                addCategory = addCategory + "+wd_FILE_CAT_ADD_VALUE[" + xn + "]=" + myTagList[xn];
            }

            wdService.setCats(addCategory, fileData).then(function(res) {
                $window.location.href = ($localStorage.host + '/cgi-bin/wdwebcgi.exe?SERVE+wd_SID=' + $localStorage.userData.session + '+html=/api/apiList.json+cabinet=' + data.Cabinet + '+f1=' + data.FileField1 + '+f2=' + data.FileField2 + '+f3=' + data.FileField3 + '+f4=' + data.FileField4 + '+f5=' + data.FileField5 + '+f6=' + data.FileField6 + '+f7=' + data.FileField7  + '+desc=' + $scope.uploadData.Description + '+type=0+security=' + $scope.uploadData.Security + '+zms=' + zms + '+loc=' + data.UploadTo + '+domain=' + $localStorage.host + '+popFlag=' + $scope.softpopFlag + '+name=' + data.Name + '+wd_List_ID=' + data.FileLID + '+wd_List_RecNum=' + data.FileRN + '+comment=' + $scope.uploadData.Comments + '+format=' + $scope.format);
            }, function(err){
                var data = { fileAction: false };
                $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
            });
            return false;
        }
        $window.location.href = ($localStorage.host + '/cgi-bin/wdwebcgi.exe?SERVE+wd_SID=' + $localStorage.userData.session + '+html=/api/apiList.json+cabinet=' + data.Cabinet + '+f1=' + data.FileField1 + '+f2=' + data.FileField2 + '+f3=' + data.FileField3 + '+f4=' + data.FileField4 + '+f5=' + data.FileField5 + '+f6=' + data.FileField6 + '+f7=' + data.FileField7  + '+desc=' + $scope.uploadData.Description + '+type=0+security=' + $scope.uploadData.Security + '+zms=' + zms + '+loc=' + data.UploadTo + '+domain=' + $localStorage.host + '+popFlag=' + $scope.softpopFlag + '+name=' + data.Name + '+wd_List_ID=' + data.FileLID + '+wd_List_RecNum=' + data.FileRN + '+comment=' + $scope.uploadData.Comments + '+format=' + $scope.format);
    }

    $scope.getCategoryList = function(x) {
        var catList = fileListUI.getCategoryList(x);
        var setCategoryArry = [];
        catList.then(function(res) {
            var wdCateResults = res.data;

            if (wdCateResults.root.Header.Error_Count != "") {
                console.log(wdCateResults.Header.wd_Error_MS);
                return false;
            }

            $scope.wholeCatList = wdCateResults.root;
            angular.forEach(wdCateResults.root.Items, function(key, idx) {
                key.text = key.CD;
                key.onClick = function(e) {
                    var getTagValue = $('#wdTagsList').dxTagBox('option', 'value');
                    var pushData = getTagValue.push(key.CN);
                }
            });

            var getPersonal = wdCateResults.root.Items.filter(function(personal) {
                var showPersonal = personal.TAB_NAME == "Personal";
                return showPersonal;
            });

            var getPublic = wdCateResults.root.Items.filter(function(public) {
                return public.TAB_NAME == "Public";
            });

            var getFolder = wdCateResults.root.Items.filter(function(folder) {
                return folder.TAB_NAME == "Folder";
            });

            if (getPersonal.length !== 0) {
                setCategoryArry.push({text: "Personal", items: getPersonal});
            }

            if (getPublic.length !== 0) {
                setCategoryArry.push({text: "Public", items: getPublic});
            }

            if (getFolder.length !== 0) {
                setCategoryArry.push({text: "Folder", items: getFolder});
            }


            $scope.categoryUpload = [
                {
                    text: "Select a Category",
                    value: 0,
                    items: setCategoryArry
                },
                {
                    text: "Add/Edit Tags",
                    value: 1,
                    onClick: function(e) {
                        $scope.openCats = true;
                        $rootScope.$broadcast('categoryList', { cats: $scope.wholeCatList, file: false, type: "saveAs" });
                    }
                }
            ];

            $scope.cancelPanel = function() {
                $scope.openCats = false;
                $scope.$broadcast('closeCats', {panelupdate: false});
            }

            //$scope.wdDropCategory = setCategoryArry;

        }, function(error) {
            var data = { fileAction: false };
            $scope.setPopupDailog(true, "FAILED_SERVER", data);
        });
    }

    $scope.categoryUpload = [];

    $scope.newFileErr = function(err) {
        $scope.uploadInc = true;
        switch (err.errorStatus.wd_Error_RCTX) {
            case "WDRC_TESTPROFILE_FIELD_INVALID":
            for(var i = 1; i <= 7; i++) {
                if (err.errorStatus.wd_Error_VAR == "wd_FILE_FIELD" + i + "_VALUE") {
                    $scope.fieldDesc["field" + i] = "Invalid field code";
                    $scope["wdFieldColor" + i] = "#a80000";
                }
            }
            break
            default:
            var data = { fileAction: false };
            $scope.setPopupDailog(true, err.errorStatus.wd_Error_RCTX, data);
        }
    }

    $scope.tableErr = function(err) {
        $scope.uploadInc = true;
        switch (err.Header.wd_Error_RCTX) {
            case "WDRC_TESTPROFILE_FIELD_INVALID":
            for(var i = 1; i <= 7; i++) {
                if (err.Header.wd_Error_VAR == "wd_FILE_FIELD" + i + "_VALUE") {
                    $scope.fieldDesc["field" + i] = "Invalid field code";
                    $scope["wdFieldColor" + i] = "#a80000";
                }
            }
            break
            default:
            var data = { fileAction: false };
            $scope.setPopupDailog(true, err.Header.wd_Error_RCTX, data);
        }
    }

    $scope.categoryContextualMenu = {
        target: "#categoryMenuBtn",
        bindingOptions: {
            items: "categoryUpload"
        }
    }

    $scope.contexualMenuBtnCat = {
        width: "100px",
        text: "Categories",
        onClick: function() {
            var testProfile = wdService.newTestProfile($scope.uploadData, $scope.fields);
            testProfile.then(function(res) {
                var wdProfileResults = res.data
                if (wdProfileResults.Header.ErrorCount != "") {
                    $scope.tableErr(wdProfileResults);
                    return false;
                }
                $scope.getCategoryList(wdProfileResults.Profile.wdPath);

            }, function(error) {
                var data = { fileAction: false };
                $scope.setPopupDailog(true, "FAILED_SERVER", data);
            });
            $("#wdCatMenu").dxContextMenu("toggle", true);
        }
    };


    $scope.getTestProfile = function() {
        wdService.newTestProfile($scope.uploadData, $scope.fields).then(function(res) {
            var fieldTables = res.data;
            if (fieldTables.Header.ErrorCount != "") {
                $scope.showDetails(fieldTables);
                return false;
            }
            $scope.listOfTags = [];
            $scope.setCategoryList(fieldTables.Profile.wdPath);
            $scope.showDetails(fieldTables);

        }, function(error){
            var data = { fileAction: false };
            $scope.setPopupDailog(true, "FAILED_SERVER", data);
        });
    }

    $scope.showDetails = function(x) {
        var testedProfile = x.Profile.Fields;
        $scope.fieldDesc = {
            field1: testedProfile.Field1.wd_File_Field_Error,
            field2: testedProfile.Field2.wd_File_Field_Error,
            field3: testedProfile.Field3.wd_File_Field_Error,
            field4: testedProfile.Field4.wd_File_Field_Error,
            field5: testedProfile.Field5.wd_File_Field_Error,
            field6: testedProfile.Field6.wd_File_Field_Error,
            field7: testedProfile.Field7.wd_File_Field_Error
        }

        for(var xn = 1; xn <= 7; xn++) {
            if ( testedProfile["Field" + xn].wd_File_Field_Error !== "" ) {
                $scope["wdFieldColor" + xn] = "#a80000";
            } else {
                $scope["wdFieldColor" + xn] = "#107c10";
            }
            $scope.fieldDesc["field" + xn] = testedProfile["Field" + xn].wd_File_Field_Desc;
        }
    }

    $scope.closePanel = function(x) {
        this.toogle = x;
        this.fieldPanel = x;
    }

    $scope.getUploadData = function(x, y) {
        $scope.fileFlag = true;
        $scope.selected = x;

        angular.forEach($scope.cabinetList, function(key, idx) {
            if (key.PGID == parseInt(x.dwPGID)) {
                $scope.uploadData.Cabinets = key;
            }
        })
        // if (y) {
        //     for(var i = 1;  i <= 7; i++) {
        //         if(x.hasOwnProperty("f" + [i] + "n") == false){
        //             var key = "f" + [i] + "n";
        //             var object = {};
        //             x[key] = "";
        //         }
        //     }

        //     for(var i = 1;  i <= 7; i++) {
        //         if(x.hasOwnProperty("f" + [i] + "c") == false){
        //             var key = "f" + [i] + "c";
        //             var object = {};
        //             x[key] = "";
        //         }
        //     }

        // }

        // $scope.uploadData.Cabinets = x.dwPGID + "|" + x.f1n  + "|" + x.f2n + "|" + x.f3n + "|" + x.f4n + "|" + x.f5n + "|" + x.f6n + "|" + x.f7n + "|"

        for (var i = 1; i <= 7; i++) {
            $scope.fields["field" + i].value = x["f" + i + "c"];
            $scope.fieldDesc["field" + i] = x["f" + i + "d"];
            $scope["wdFieldColor" + i] = "#107c10";
        }

        setTimeout(function(){
            $scope.setDateField();
        }, -1)

        $scope.fieldDesc = {
            "field1": x.f1d,
            "field2": x.f2d,
            "field3": x.f3d,
            "field4": x.f4d,
            "field5": x.f5d,
            "field6": x.f6d,
            "field7": x.f7d
        }
    }

    $scope.checkTables = function() {
        var fieldNum = $scope.selectedField;
        $scope.getTables(fieldNum, $scope.fields["field" + fieldNum].placeholder);
    }

    $scope.getTables = function(x, y){
        var wdFilter = $("#wdFilterSave").dxTextBox("instance");
        wdFilter.option("value", "");
        $scope.textValue = "";
        $scope.fieldListData = [];
        $scope.fieldTableSpin = false;
        $scope.selectedField = x;
        $scope.maxcount = 500;
        $scope.indexFr = 0;
        $scope.prefillData = 'ft';
        $scope.uploadTitle = y;
        $scope.fieldPanel = true;
        $scope.listTable(false, true);
    }

    $scope.getFieldsDesc = function(x) {
        var getField = x.element[0].id.split('fieldDesc')[1];
        var fields = {
            "field1": $scope.fields.field1.value,
            "field2": $scope.fields.field2.value,
            "field3": $scope.fields.field3.value,
            "field4": $scope.fields.field4.value,
            "field5": $scope.fields.field5.value,
            "field6": $scope.fields.field6.value,
            "field7": $scope.fields.field7.value,
        }
        wdService.getFieldDes($scope.uploadData.Cabinets.split("|")[0], fields, getField).then(function(res) {
            var fieldDescValues = res.data.data.fields;
            $scope.fieldDesc = {
                field1: fieldDescValues.field1,
                field2: fieldDescValues.field2,
                field3: fieldDescValues.field3,
                field4: fieldDescValues.field4,
                field5: fieldDescValues.field5,
                field6: fieldDescValues.field6,
                field7: fieldDescValues.field7
            }
        }, function(error) {
            var data = { fileAction: false };
            $scope.setPopupDailog(true, "FAILED_SERVER", data);
        });
    }

    $scope.loadMore = {
        text: "Load More",
        type: "success",
        useSubmitBehavior: false,
        onClick: function() {
            $scope.indexFr =+ $scope.indexFr + ($scope.maxcount + 1);
            $scope.listTable(true, false);
        }
    }

    $scope.isArray = function(obj){
        return angular.isArray(obj);
    };

    $scope.chkSecurity = function(x) {
        if (x.I == "52") {
            $scope.securityValue = 8;
        } else if (x.I == "51") {
            $scope.securityValue = 16;
        } 
        else {
            $scope.securityValue = "";
        }
    }


    $scope.setField = function(x) {
        $scope.selected = x;
        for (i = 1; i <= 7; i++) {
            if (x["f" + i + "n"]) {
                $scope.fields["field" + i].value = x["f" + i + "n"];
                $scope.fieldDesc["field" + i] = x["f" + i + "d"];
            }
        }
    }

    $scope.cancelPanel = function() {
        $scope.openCustom = false;
        $scope.uploadData.Security = " ";
    }

    $scope.getToolTip = function(x) {
        var getAllFields = "";
        for (i = 1; i <= 7; i++) {
            if (x["f" + i + "n"]) {
                getAllFields += getAllFields = x["f" + i + "n"] + ' - ' + x["f" + i + "d"] + ' | ';
            }
        }
        return getAllFields.substring(0, getAllFields.length - 2);
    }

    $scope.chkError = function(err) {
        if (err.wd_Error_MSG == "WDRC_ZERO_FIELDS_CLEAN") {
            $scope.noResults = "Your filter has no results."
            $scope.fieldListData = [];
            $scope.listCount = 0;
            $timeout(function(){
                $scope.fieldTableSpin = true;
            }, 1000);
            return false
        }
        $scope.fieldTableSpin = true;
    }

    $scope.listTable = function(x, y) {
        wdService.fieldTables($scope.uploadData.Cabinets.PGID, $scope.fields, $scope.selectedField, $scope.maxcount, $scope.indexFr, y, $scope.textValue).then(function(res){

            $scope.total = res.data.root.Header.ListCount;
            $scope.listlength = res.data.root.FieldTbl.length;

            if (res.data.root.Header.ErrorCount != "") {
                $scope.chkError(res.data.root.Header);
                return false;
            }

            if (x) {
                var merged = $scope.fieldListData.concat(res.data.root.FieldTbl);
                $scope.listlength = merged.length;
                $scope.fieldListData = merged;
            } else {
                $scope.fieldListData = res.data.root.FieldTbl;
            }

            if ($scope.total > $scope.maxcount) {
                $scope.moreTables = true;
                $scope.checkFt = true;
                $scope.ftCount = " " + $scope.listlength + " of " + $scope.total;
            } else if ($scope.total == "1") {
                $scope.ftCount = " 1 of 1";
                $scope.checkFt = false;
            } 
            else {
                $scope.ftCount = " " + $scope.total + " of " + $scope.total;
                $scope.checkFt = false;
            }

            $scope.fieldNum = res.data.root.Header.FieldNum;
            $scope.listCount = parseInt(res.data.root.Header.ListCount);
            $scope.fieldNumber = $scope.selectedField;
            $timeout(function() {
                $scope.fieldTableSpin = true;
            }, 1000);

        }, function(err){
            $scope.fieldTableSpin = true;
            var data = { fileAction: false };
            $scope.setPopupDailog(true, "FAILED_SERVER", data);
        });
    }

    $scope.tags = {
        bindingOptions: {
            dataSource: "listOfTags",
            value: "tagValues"
        },
        displayExpr: "CD",
        valueExpr: "CN",
        itemTemplate: "customTagItem"
    }

    $scope.setCategoryList = function(x) {
        var decode = decodeURIComponent(x);
        var taglist = [];
        fileListUI.getCategoryList(decode).then(function(res) {
            var catGroup = res.data.root;
            if (catGroup.Header.Error_Count !== "") {
                console.log(catGroup.Header.Error_Msg);
                return false;
            }
            $scope.listOfTags = catGroup.Items;
        }, function(error) {
            var data = { fileAction: false };
            $scope.setPopupDailog(true, "FAILED_SERVER", data);
        });
    }

    wdService.getPgCabinets().then(function(res) {
        var pgList = res.data.root;
        if (pgList.Header.ErrorCount !== "") {
            console.log(pgList.Header.wd_Error_MSG);
            return false
        }

        // for(var xn = 1; xn <= 7; xn++) {
        //     vm.showPgFields["field" + xn] = false;
        //     $scope.fields["field" + xn].value = "";
        // }
        console.log(pgList.items)        
        $scope.cabinetList = pgList.items;
    }, function(err) {
        var data = { fileAction: false };
        $scope.setPopupDailog(true, "FAILED_SERVER", data);
    });

    // $scope.cabinetList = uploader.getCabinet();

    $scope.securityList = [ { name: "None", value: "" }, { name: "Hidden", value: "16" }, { name: "Protected", value: "8"} ];
    $scope.saveAsDrop = fileExt;

    $scope.changeSecurity = function(e) {
        if (e.value == "18") {
            $scope.openCustom = true;
        }
    }

    $scope.setSelected = function(x) {
        $scope.selected = x;
    }

    $scope.wdPgInit = function() {
        console.log($scope.defaultPg);
    }

    

    $scope.getSaveValue = function(e)  {

        var firstSplit = e.K.split("(")[1];
        var secondSplit = firstSplit.split(")")[0];
        var finalSplit  = secondSplit.split("*.")[1];
        return finalSplit;
    }

    $scope.convertTime = function(e){
        if(e==null || e==''){
            return '';
        }else{
            var timeValue = e;
            var year = timeValue.getFullYear();
            var month = (1 + timeValue.getMonth()).toString();
            month = month.length > 1 ? month : '0' + month;
            var day = timeValue.getDate().toString();
            day = day.length > 1 ? day : '0' + day;
            return year+month+day;
        }
    }

    $scope.dateValueChanged = function(){
        for (var i = 1; i <= 7; i++) {
            if($scope.typePgFields["field"+i] == 1 && $scope.showPgFields["field" + i]!= ""){
                $("#fieldDesc"+i).dxDateBox('instance').option('width', 200);
                $("#fieldDesc"+i).dxDateBox('instance').option('placeholder', "MM/DD/YY");
                switch (i) {
                    case 1:
                        $("#fieldDesc"+i).dxDateBox('instance').option('onValueChanged', function(e){
                            $scope.fields.field1.value = $scope.convertTime(e.value);
                        });
                        break;
                    case 2:
                        $("#fieldDesc"+i).dxDateBox('instance').option('onValueChanged', function(e){
                            $scope.fields.field2.value = $scope.convertTime(e.value);
                        });
                        break;
                    case 3:
                        $("#fieldDesc"+i).dxDateBox('instance').option('onValueChanged', function(e){
                            $scope.fields.field3.value = $scope.convertTime(e.value);
                        });
                        break;
                    case 4:
                        $("#fieldDesc"+i).dxDateBox('instance').option('onValueChanged', function(e){
                            $scope.fields.field4.value = $scope.convertTime(e.value);
                        });
                        break;
                    case 5:
                        $("#fieldDesc"+i).dxDateBox('instance').option('onValueChanged', function(e){
                            $scope.fields.field5.value = $scope.convertTime(e.value);
                        });
                        break;
                    case 6:
                        $("#fieldDesc"+i).dxDateBox('instance').option('onValueChanged', function(e){
                            $scope.fields.field6.value = $scope.convertTime(e.value);
                        });
                        break;
                    case 7:
                        $("#fieldDesc"+i).dxDateBox('instance').option('onValueChanged', function(e){
                            $scope.fields.field7.value = $scope.convertTime(e.value);
                        });
                        break;
                }
            }
        }
    }

    $scope.setDateField = function(){
        for (var i = 1; i <= 7; i++) {
            if($scope.typePgFields["field"+i] == 1 && $scope.showPgFields["field" + i]!= ""){
                $("#fieldDesc"+i).dxDateBox('instance').option('width', 200);
                $("#fieldDesc"+i).dxDateBox('instance').option('placeholder', "MM/DD/YY");
                switch (i) {
                    case 1:
                        $scope.fields.field1.value = $scope.convertTime($("#fieldDesc"+i).dxDateBox('instance').option('value'));
                        break;
                    case 2:
                        $scope.fields.field2.value = $scope.convertTime($("#fieldDesc"+i).dxDateBox('instance').option('value'));
                        break;
                    case 3:
                        $scope.fields.field3.value = $scope.convertTime($("#fieldDesc"+i).dxDateBox('instance').option('value'));
                        break;
                    case 4:
                        $scope.fields.field4.value = $scope.convertTime($("#fieldDesc"+i).dxDateBox('instance').option('value'));
                        break;
                    case 5:
                        $scope.fields.field5.value = $scope.convertTime($("#fieldDesc"+i).dxDateBox('instance').option('value'));
                        break;
                    case 6:
                        $scope.fields.field6.value = $scope.convertTime($("#fieldDesc"+i).dxDateBox('instance').option('value'));
                        break;
                    case 7:
                        $scope.fields.field7.value = $scope.convertTime($("#fieldDesc"+i).dxDateBox('instance').option('value'));
                        break;
                }

            }
        }
    }

    $scope.selectedCabinet = function(e) {
        //$scope.uploadData.Cabinets = e.PGID;
        angular.forEach(e.value.Fields, function(key, idx) {
            var addIdx = parseInt(1) + idx;
            if(key.ACTIVE == 0) {
                $scope.showPgFields["field" + addIdx] = false;
                $scope.showPgFields["field" + addIdx] = "";
            } else {
                $scope.showPgFields["field" + addIdx] = true;
                $scope.showPgFields["field" + addIdx] = key.NAME;
            }
            $scope.typePgFields["field" + addIdx] = key.MMDDYY;
        });

        if (e.event !== undefined) {
            $scope.fields = { "field1": {"value": ""}, "field2":{"value": ""}, "field3":{"value": ""}, "field4":{"value": ""}, "field5":{"value": ""}, "field6": {"value": ""}, "field7": {"value":""} };
            $scope.fieldDesc = { "field1": "", "field2": "", "field3": "", "field4": "", "field5": "", "field6": "", "field7": "" }
        
        }
        setTimeout(function(){
            $scope.dateValueChanged();
        }, -1)
        // var getFields = e.value.split('|');
        // for(var i = 1;  i <= 7; i++) {
        //     if(getFields[i] != "") {
        //         $scope.showPgFields["field" + i] = getFields[i];
        //     } else {
        //         $scope.showPgFields["field" + i] = "";
        //     }
        // }
        // $scope.field = { "field1": "", "field2": "", "field3": "", "field4": "", "field5": "", "field6": "", "field7": "" };
    }

    $scope.showHideDesc = uploader.getMultData();


}]).factory('uploader', function($localStorage, wdService, homeService, $location, $rootScope){
    homeService.checkLocalStorage();
    wdService.getCabinetList().then(function(res){
        if (res.data.root.Header.ErrorCount != "") {
            console.log(res.data.root.Header.wd_Error_MSG);
            return false;
        }
        for (i = 0; i < res.data.root.Cabinets.length; i++) {
            cabinetList.push(res.data.root.Cabinets[i]);
        }
    }, function(error){
        var data = { fileAction: false };
        $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
    });

    var fieldsSelect = [];
    var showField = getMultData();

    var security = [
        {
            itemType: "group",
            items: [
                {
                    dataField: "Security",
                    editorType: "dxSelectBox",
                    editorOptions: {
                        dataSource: [
                            {
                                name: "None",
                                value: ""
                            },
                            // {
                            //     name: "Checked-out",
                            //     value: "C"
                            // },
                            {
                                name: "Hidden",
                                value: 16
                            },
                            {
                                name: "Protected",
                                value: 8
                            }
                            // {
                            //     name: "Custom",
                            //     value: "C"
                            // }
                        ],
                        valueExpr: 'value',
                        displayExpr: "name",
                        width: 150
                    }
                }
            ]
        }
    ]

    var uploader = [
        {
            itemType: "group",
            items: [
                {
                    dataField: "Description",
                    editorOptions: {
                        placeholder: 'Description',
                        width: '100%',
                        value: getDescData()
                    },
                    validationRules: [{
                        type: "required"
                    }],
                    width: '100%',
                    visible: showField,
                },
                {
                    dataField: "Comments",
                    editorType: "dxTextArea",
                    editorOptions: {
                        placeholder: 'Comments',
                        width: '100%'
                    },
                    validationRules: [{
                        type: "required"
                    }],
                    width: '100%',
                    visible: !showField
                },
                {
                    dataField: "Cabinets",
                    editorType: "dxSelectBox",
                    editorOptions: {
                        dataSource: cabinetList,
                        valueExpr: 'pgFields',
                        displayExpr: "pgName",
                        width: '150px'
                    },
                    validationRules: [{
                        type: "required"
                    }]
                },
                {
                    dataField: "Field1",
                    template: "Field1",
                    label: {
                        visible: false
                    },
                    visible: false,
                    editorOptions: {
                        width: '150px'
                    }
                },
                {
                    dataField: "Field2",
                    template: "Field2",
                    label: {
                        visible: false
                    },
                    visible: false,
                    editorOptions: {
                        width: '150px'
                    }
                },
                {
                    dataField: "Field3",
                    template: "Field3",
                    label: {
                        visible: false
                    },
                    visible: false,
                    editorOptions: {
                        width: '150px'
                    }
                },
                {
                    dataField: "Field4",
                    template: "Field4",
                    label: {
                        visible: false
                    },
                    visible: false,
                    editorOptions: {
                        width: '150px'
                    }
                },
                {
                    dataField: "Field5",
                    template: "Field5",
                    label: {
                        visible: false
                    },
                    visible: false,
                    editorOptions: {
                        width: '150px'
                    }
                },
                {
                    dataField: "Field6",
                    template: "Field6",
                    label: {
                        visible: false
                    },
                    visible: false,
                    editorOptions: {
                        width: '150px'
                    }
                },
                {
                    dataField: "Field7",
                    template: "Field7",
                    label: {
                        visible: false
                    },
                    visible: false,
                    editorOptions: {
                        width: '150px'
                    }
                },
                {
                    dataField: "Security",
                    editorType: "dxSelectBox",
                    editorOptions: {
                        dataSource: [
                            {
                                name: "None",
                                value: ""
                            },
                            {
                                name: "Hidden",
                                value: "8"
                            },
                            {
                                name: "Protected",
                                value: "16"
                            }
                        ],
                        valueExpr: 'value',
                        displayExpr: "name",
                        width: '150px'
                    }
                },
                {
                    dataField: "SaveAs",
                    editorType: "dxSelectBox",
                    editorOptions: {
                        dataSource: fileExt,
                        valueExpr: function(e) {
                            var firstSplit = e.K.split("(")[1];
                            var secondSplit = firstSplit.split(")")[0];
                            var finalSplit = secondSplit.split("*.")[1];
                            return finalSplit;
                        },
                        displayExpr: "K"
                    },
                    validationRules: [{
                        type: "required"
                    }],
                    visible: showField
                },
            ],
        }
    ];

    return {
        uploadFields: uploadFields,
        securitySelect: securitySelect,
        getCabinet: getCabinet,
        getMultData: getMultData

    }

    function uploadFields(){
        return uploader;
    }

    function securitySelect() {
        return security;
    }

    function getMultData() {
       if($location.search().multi) {
           return false;
       } else {
           return true;
       }
    }

    function getDescData() {
        var description = "";
        if($location.search().desc) {
            description = $location.search().desc;
        }
        return description;
    }

    function getCabinet() {
        return cabinetList;
    }




});

var cabinetList = [],
    fileInfo = {
        name: ""
    };

var fileExt = [];

function updateFields(e, x) {
    for(var i = 1;  i <= 7; i++) {
        if(x[i] != ""){
            e.component.itemOption("Field" + [i], "visible", true);
            e.component.itemOption("Field" + [i], "editorOptions", {placeholder: x[i]});
            e.component.itemOption("Field" + [i], "label", {text: x[i]});
        } else {
            e.component.itemOption("Field" + [i], "visible", false);
        }
    }
}
