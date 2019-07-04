'use strict'
angular.module('WDWeb').controller("profileCtrl",
['$scope', '$http', '$timeout', '$log', '$route', 'uxService', 'profileService', 'wdService', '$rootScope', 'panelTitleService', 'fileListUI', 'homeService', '$localStorage', '$window', 'leftNavService', '$interval',
function ($scope, $http, $timeout, $log, $route, uxService, profileService, wdService, $rootScope, panelTitleService, fileListUI, homeService, $localStorage, $window, leftNavService, $interval) {
    $scope.showEditForm = true;
    $scope.wdEdit = true;
    $scope.textValue = "";
    $scope.showUploadLoader = false;
    $scope.noResults = "";
    $scope.dataTime = function() {
        if ($rootScope.chkedPanel.panel && $scope.chkPanel()) {
            wdService.lockFile().then(function (lock) {
                console.log("Locked");
            }, function(err){
                console.log("Lock Failed");
            });
        }
    }

    var interval = $interval($scope.dataTime, 30000);
    
    var fields = {
        "field1": {
        "value": ""
        },
        "field2": {
        "value": ""
        },
        "field3": {
        "value": ""
        },
        "field4": {
        "value": ""
        },
        "field5": {
        "value": ""
        },
        "field6": {
        "value": ""
        },
        "field7": {
        "value": ""
        }
    };
    var buttonIndicator;
    $scope.selectedField = 0;
    $scope.showTableLoader = false;
    $scope.fieldListData = [];
    $scope.fieldTableSpin = true;

    $scope.metaTitle = {
        items: [ { 
            location: 'before', 
            template: "title"
        } ],
        elementAttr: {
            class: "metaTitle"
        },
    };

    $scope.prefillData = "fm"

    $scope.wdFilterBox = {
        placeholder: "Filter",
        elementAttr: {
            id: "wdFilterProfile"
        },
        onEnterKey: function(e) {
            $scope.fieldTableSpin = false;
            $scope.showEditForm = false;
            $scope.textValue = e.event.target.value;
            $scope.noResults = "";
            if ($scope.prefillData == 'ft') {
                $scope.searchFt();
            } else {
                $timeout(function() {
                    $scope.fieldTableSpin = true;
                }, 1000);
            }
        },
        showClearButton: true
    }

    $scope.$on("editIcon", function(event, data){
        $scope.showUploadLoader = true;
        wdService.getFavMatters().then(function(res){
            var favMatter = res.data.root;
            if (favMatter.Header.ErrorCount != "") {
                $scope.showUploadLoader = false;
                console.log(favMatter.Header.wd_Error_MSG);
                return false;
            }
            $scope.prefillData = 'fm';
            $scope.uploadTitle = "Favorite Matters";
            $scope.showUploadLoader = false;
            $scope.favMatters = favMatter.FavMatters;
            $scope.selected = favMatter.FavMatters[0];
            $scope.selectedField = 0;
            if ($scope.profileBtn == "Edit") {
                $scope.editTitle = "Edit Metadata";
            } else {
                $scope.editTitle = $scope.profileBtn;
            }
            setTimeout(function(){
                $scope.setDateField();
                $scope.dateValueChanged();
            }, -1)
        }, function(error){
            var data = { fileAction: false };
            $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
        });
    });

    $scope.wdButtons = function(x, y){
        var wdFilter = $("#wdFilterProfile").dxTextBox("instance");
        wdFilter.option("value", "");

        $scope.prefillData = x;
        $scope.uploadTitle = y;
        $scope.selectedField = 0;
        $scope.autoFilter = "";
        $scope.checkFt = false;
    };

    $scope.setSelected = function(x) {
        $scope.selected = x; 
    }

    $scope.setFavMatter = function(e) {
        var setCopy = angular.copy(e);
        var setFavMatter = [];
        for(var i = 1;  i <= 7; i++) {
            if (e.hasOwnProperty("f" + i + "n") && e["f" + i + "d"] !== "") {
                var data = "<span class='favAlign'><b>" + setCopy["f" + i + "n"] + "</b> " + setCopy["f" + i + "c"] + " " + setCopy["f" + i + "d"] + "</span><br/>";
                setFavMatter.push(data);
            }
        }
        setFavMatter.unshift("<h3><b>&nbsp;&nbsp;" + setCopy.szPGID.toUpperCase() + "</b></h3>");
        return setFavMatter.join("&nbsp;&nbsp;");
    }

    $scope.wdFilterSideBtn = {
        icon: "ms-Icon ms-Icon--Accept",
        onClick: function(e) {
            $scope.fieldTableSpin = false;
            $scope.showEditForm = false;
            var wdFilter = $("#wdFilterProfile").dxTextBox("instance");
            $scope.textValue = wdFilter.option("value");
            $scope.noResults = "";
            if ($scope.prefillData == 'ft') {
                $scope.searchFt();
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

    angular.element($window).bind('resize', function(){
        var listArray = ["#editForm", "#scrollTables"];
        angular.forEach(listArray, function(key, index) {
            if ($(key).dxScrollView("instance") !== undefined) {
                $(key).dxScrollView("instance").option("height", (window.innerHeight - 290))
            }
        });
    });

    $scope.$on("clearFieldTable", function() {
        $scope.wdEdit = true;
    });

    $scope.setFlag = true;
    
    $scope.scrollProfile = {
        scrollByContent: true,
        scrollByThumb: true, 
        showScrollbar: "always",
        height: function() {
            return window.innerHeight - 250;
        },
        useNative: true
    }
    $scope.typePgFields = {"field1": 0, "field2": 0, "field3": 0, "field4": 0, "field5": 0, "field6": 0, "field7": 0};

    $scope.$watch(function() {
        return homeService.getSelectedList();
    }, function(newData) {
        console.log(newData);
        $scope.newData = newData[0]
        $scope.showEditForm = true;
        if ($scope.newData !== undefined) {
            $scope.pgCabinetValue = $scope.newData.profileGroupId + "|" + ($scope.newData.Field1Name == undefined ? '' : $scope.newData.Field1Name) + "|" + ($scope.newData.Field2Name == undefined ? '' : $scope.newData.Field2Name) + "|" + ($scope.newData.Field3Name == undefined ? '' : $scope.newData.Field3Name) + "|" + ($scope.newData.Field4Name == undefined ? '' : $scope.newData.Field4Name) + "|" + ($scope.newData.Field5Name == undefined ? '' : $scope.newData.Field5Name) + "|" + ($scope.newData.Field6Name == undefined ? '' : $scope.newData.Field6Name) + "|" + ($scope.newData.Field7Name == undefined ? '' : $scope.newData.Field7Name) + "|";
            for (var i = 1; i <= 7; i++) {
                if ($scope.newData['Field' + i + 'Name'] != undefined) {
                    angular.forEach($scope.cabinetListFull, function(key, index) {
                        if($scope.newData.Cabinet == key.Name){
                            angular.forEach(key.Fields, function(key2, index2) {
                                if('Field #'+i == key2.FIELD){
                                    $scope.typePgFields['field'+i] = key2.MMDDYY;
                                }
                            });
                        }
                    });
                    $scope.fieldContainer['Field' + i] = true;
                    $scope.editFields['placeholder' + i] = $scope.newData['Field' + i + 'Name'];
                    $scope.editFields['field' + i] = $scope.newData['Field' + i];
                } else {
                    $scope.fieldContainer['Field' + i] = false;
                }
            }
            $scope.chkSecurity($scope.newData);
            $scope.setDescComm($scope.newData);

            var selectCabinet = null;
            $scope.setFlag = false;
            $scope.showTagField = true;
            $scope.updateProfileList(false, [$scope.newData]);
            $timeout(function(){
                $scope.showEditForm = false;
            }, 1000);
        }
        // } else if ($scope.newData !== undefined && $scope.newData.CHKOUT_TO_NAME !== undefined) {
        //     var data = { fileAction: false };
        //     $rootScope.$broadcast("errorAction", {visible: true, rctx: "EDIT_PROFILE_STATUS", data: data});
        // }
        
        
    });

    $scope.maxcount = 500;
    $scope.indexFr = 0;
    $scope.pgIdValue = ""
    $scope.checkFt = false;
    $scope.securityValue = "";
    $scope.listOfTags = [];
    $scope.tagValues = [];

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
        width: '300',
        onValueChanged: function(e) {
            console.log(e);
        }
    }
    $scope.dateBoxUl6 = {
        dateFormat: {
            type: 'date'
        },
        width: '300',
        onValueChanged: function(e) {
            console.log(e);
        }
    }
    $scope.dateBoxUl7 = {
        dateFormat: {
            type: 'date'
        },
        width: '300',
        onValueChanged: function(e) {
            console.log(e);
        }
    }
    $scope.convertTime = function(e){
        if(e==null){
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
            if($scope.typePgFields["field"+i] == 1 && $scope.fieldContainer["Field" + i]){
                $("#field"+i).dxDateBox('instance').option('width', 200);
                $("#field"+i).dxDateBox('instance').option('placeholder', "MM/DD/YY");
                switch (i) {
                    case 1:
                        $("#field"+i).dxDateBox('instance').option('onValueChanged', function(e){
                            $scope.editFields.field1 = $scope.convertTime(e.value);
                        });
                        break;
                    case 2:
                        $("#field"+i).dxDateBox('instance').option('onValueChanged', function(e){
                            $scope.editFields.field2 = $scope.convertTime(e.value);
                        });
                        break;
                    case 3:
                        $("#field"+i).dxDateBox('instance').option('onValueChanged', function(e){
                            $scope.editFields.field3 = $scope.convertTime(e.value);
                        });
                        break;
                    case 4:
                        $("#field"+i).dxDateBox('instance').option('onValueChanged', function(e){
                            $scope.editFields.field4 = $scope.convertTime(e.value);
                        });
                        break;
                    case 5:
                        $("#field"+i).dxDateBox('instance').option('onValueChanged', function(e){
                            $scope.editFields.field5 = $scope.convertTime(e.value);
                        });
                        break;
                    case 6:
                        $("#field"+i).dxDateBox('instance').option('onValueChanged', function(e){
                            $scope.editFields.field6 = $scope.convertTime(e.value);
                        });
                        break;
                    case 7:
                        $("#field"+i).dxDateBox('instance').option('onValueChanged', function(e){
                            $scope.editFields.field7 = $scope.convertTime(e.value);
                        });
                        break;
                }
            }
        }
    }
    $scope.setDateField = function(){
        for (var i = 1; i <= 7; i++) {
            if($scope.typePgFields["field"+i] == 1 && $scope.fieldContainer["Field" + i] && i==1){
                $("#field"+i).dxDateBox('instance').option('width', 200);
                $("#field"+i).dxDateBox('instance').option('placeholder', "MM/DD/YY");
                switch (i) {
                    case 1:
                        $scope.editFields.field1 = $scope.convertTime($("#field"+i).dxDateBox('instance').option('value'));
                        break;
                    case 2:
                        $scope.editFields.field2 = $scope.convertTime($("#field"+i).dxDateBox('instance').option('value'));
                        break;
                    case 3:
                        $scope.editFields.field3 = $scope.convertTime($("#field"+i).dxDateBox('instance').option('value'));
                        break;
                    case 4:
                        $scope.editFields.field4 = $scope.convertTime($("#field"+i).dxDateBox('instance').option('value'));
                        break;
                    case 5:
                        $scope.editFields.field5 = $scope.convertTime($("#field"+i).dxDateBox('instance').option('value'));
                        break;
                    case 6:
                        $scope.editFields.field6 = $scope.convertTime($("#field"+i).dxDateBox('instance').option('value'));
                        break;
                    case 7:
                        $scope.editFields.field7 = $scope.convertTime($("#field"+i).dxDateBox('instance').option('value'));
                        break;
                }

            }
        }
    }

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

    $scope.setFieldTableOrder = function(e) {
        var setTable = [];
        for(var i = 1;  i <= 7; i++) {
            if (e.hasOwnProperty("f" + i + "n")) {
                var data = e["f" + i + "n"] + " (" + e["f" + i + "d"] + ")";
                setTable.push(data);
            }
        }
        return setTable.reverse().join(" </br> ");
    };

    $scope.wdSecurity = [
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


    $scope.editProfile =  {
        Cabinets: {
            dataSource: getCabinets(),
            placeholder: "Cabinet",
            valueExpr: 'pgFields',
            displayExpr: "pgName",
            width: "100%",
            bindingOptions: {
                value: "pgCabinetValue"
            },
            onValueChanged: function(e) {
                $scope.pgCabinetValue = e.value;
                var getFields = e.value.split('|');
                if (e.event !== undefined) {
                    for(var i = 1;  i <= 7; i++) {
                        if(getFields[i] !== "") {
                            angular.forEach($scope.cabinetListFull, function(key, index) {
                                if(getFields[0] == key.PGID){
                                    angular.forEach(key.Fields, function(key2, index2) {
                                        if('Field #'+i == key2.FIELD){
                                            $scope.typePgFields['field'+i] = key2.MMDDYY;
                                        }
                                    });
                                }
                            });
                            $scope.fieldContainer["Field" + i] = true;
                            $scope.editFields['placeholder' + i] = getFields[i];
                        } else {
                            $scope.fieldContainer["Field" + i] = false;
                        }
                        $scope.editFields['field' + i] = "";
                    }
                    profileService.setDesc({ "desc1": "", "desc2": "", "desc3": "", "desc4": "", "desc5": "", "desc6": "", "desc7": "" });
                    setTimeout(function(){
                        $scope.dateValueChanged();
                    }, -1)
                }

                $scope.editFields.description = "";
                $scope.editFields.comment = "";
                // if (e.event == undefined) {
                //     $scope.setFields();
                // }

            },
            itemTemplate: function(data) {
                return "<div class='custom-item'>" + data.pgName + "</div>";
            }
        },
        field1: {
            bindingOptions: {
                value: 'editFields.field1',
                placeholder: "editFields.placeholder1"
            },
            width: "100%",
            onFocusOut: function(xp) {
                $scope.focusOutField(xp);
            }, 
            maxLength: '12'
        },
        field2: {
            bindingOptions: {
                value: 'editFields.field2',
                placeholder: "editFields.placeholder2"
            },
            width: "100%",
            onFocusOut: function(xp) {
                $scope.focusOutField(xp);
            }, 
            maxLength: '12'
        },
        field3: {
            bindingOptions: {
                value: 'editFields.field3',
                placeholder: "editFields.placeholder3"
            },
            width: "100%",
            onFocusOut: function(xp) {
                $scope.focusOutField(xp);
            }, 
            maxLength: '12'
        },
        field4: {
            bindingOptions: {
                value: 'editFields.field4',
                placeholder: "editFields.placeholder4"
            },
            width: "100%",
            onFocusOut: function(xp) {
                $scope.focusOutField(xp);
            }, 
            maxLength: '12'
        },
        field5: {
            bindingOptions: {
                value: 'editFields.field5',
                placeholder: "editFields.placeholder5"
            },
            width: "100%",
            onFocusOut: function(xp) {
                $scope.focusOutField(xp);
            }, 
            maxLength: '12'
        },
        field6: {
            bindingOptions: {
                value: 'editFields.field6',
                placeholder: "editFields.placeholder6"
            },
            width: "100%",
            onFocusOut: function(xp) {
                $scope.focusOutField(xp);
            }, 
            maxLength: '12'
        },
        field7: {
            bindingOptions: {
                value: 'editFields.field7',
                placeholder: "editFields.placeholder7"
            },
            width: "100%",
            onFocusOut: function(xp) {
                $scope.focusOutField(xp);
            }, 
            maxLength: '12'
        },
        security: {
            placeholder: "Security",
            dataSource: $scope.wdSecurity,
            valueExpr: 'value',
            displayExpr: "name",
            width: 200,
            bindingOptions: {
                value: "securityValue"
            },
            onValueChanged: function(e) { 
                $scope.securityValue = e.value;
            }
        },
        tags: {
            bindingOptions: {
                dataSource: "listOfTags",
                value: "tagValues"
            },
            displayExpr: "CD",
            // valueExpr: "CD",
            itemTemplate: "customTagItem",
            onValueChanged: function(e) {
                $scope.tagValues = e.value;
            }
        },
        descComm: {
            bindingOptions: {
                value: 'editFields.descComm'
            },
            width: "100%",
            height: "90px"
        },
        description: {
            bindingOptions: {
                value: 'editFields.description'
            },
            width: "100%",
            placeholder: $scope.editFields.placeholderDesc
        },
        comment: {
            bindingOptions: {
                value: 'editFields.comment'
            },
            width: "100%",
            placeholder: $scope.editFields.placeholderCo
        }
    }

    $scope.getUploadData = function(x, y) {
        $scope.pgCabinetValue = x.dwPGID + "|" + x.f1n  + "|" + x.f2n + "|" + x.f3n + "|" + x.f4n + "|" + x.f5n + "|" + x.f6n + "|" + x.f7n + "|"
        var getFields = $scope.pgCabinetValue.split("|");
        if($( window ).width()<=767) {
            $("#phxUpload .nav-save").css({'display':'none','width': '0%'});
            $("#phxUpload .saveForm").css({'display':'block','width': '100%'});
        }
        $scope.selected = x;
        if (y) {
            for(var i = 1;  i <= 7; i++) {
                if(x.hasOwnProperty("f" + [i] + "n") == false){
                    var key = "f" + [i] + "n";
                    var object = {};
                    x[key] = "";
                }
            }

            for(var i = 1;  i <= 7; i++) {
                if(x.hasOwnProperty("f" + [i] + "c") == false){
                    var key = "f" + [i] + "c";
                    var object = {};
                    x[key] = "";
                }
            }

        }

        for(var i = 1;  i <= 7; i++) {
            if(getFields[i] !== "") {
                angular.forEach($scope.cabinetListFull, function(key, index) {
                    if(getFields[0] == key.PGID){
                        angular.forEach(key.Fields, function(key2, index2) {
                            if('Field #'+i == key2.FIELD){
                                $scope.typePgFields['field'+i] = key2.MMDDYY;
                            }
                        });
                    }
                });
                $scope.fieldContainer["Field" + i] = true;
            } else {
                $scope.fieldContainer["Field" + i] = false;
            }
            $scope.editFields["field" + i] = x["f" + i + "c"];
            $scope.editFields["placeholder" + i] = x["f" + i + "n"];
        }



        // $scope.showField = {
        //     "Cabinets": x.dwPGID + "|" + x.f1c  + "|" + x.f2c + "|" + x.f3c + "|" + x.f4c + "|" + x.f5c + "|" + x.f6c + "|" + x.f7c + "|"
        // }

        $scope.descField = {
            "desc1": x.f1d,
            "desc2": x.f2d,
            "desc3": x.f3d,
            "desc4": x.f4d,
            "desc5": x.f5d,
            "desc6": x.f6d,
            "desc7": x.f7d
        }
        setTimeout(function(){
            $scope.setDateField();
            $scope.dateValueChanged();
        }, -1)
    };

    $scope.setFields = function(newData) {
        cabinetList = getCabinets();
        $timeout(function() {
            var desc = {"desc1": "", "desc2": "", "desc3": "", "desc4": "", "desc5": "", "desc6": "", "desc7": ""};
            var getLastArray = $scope.myFileList.slice(-1).pop();
            var matches = [];
            var add;

            for (var j = 0; j < $scope.myFileList.length; j++) {  
                for (var x = 0; x < 7; x++) { 
                add = parseInt(x) + parseInt(1);
                if (matches[x]) {
                        if (matches[x].code !== $scope.myFileList[j]["Field" + add]) {
                            matches[x].code = "*"; 
                            matches[x].count++; 
                        } else {
                            matches[x].code = $scope.myFileList[j]["Field" + add]; 
                        }
                } else { 
                    matches[x] = {};
                    matches[x].code = $scope.myFileList[j]["Field" + add]; 
                    matches[x].count = 1;  
                }
                matches[x].desc =  $scope.myFileList[j]["Field" + add + "Desc"];
                matches[x].name =  $scope.myFileList[j]["Field" + add + "Name"];
                matches[x].field =  "field" + add;
                }
            }

            profileService.setDesc(desc);
            if (getLastArray !== undefined) {

                for(var i = 0; i < cabinetList.length; i++) {
                    if (getLastArray.profileGroupId == cabinetList[i].pgID) {
                        var getFields = $scope.pgCabinetValue.split('|');
                        
                        for(var vc = 1; vc <= 7; vc++) {
                            if(getFields[vc] != "") {
                                angular.forEach($scope.cabinetListFull, function(key, index) {
                                    if(getFields[0] == key.PGID){
                                        angular.forEach(key.Fields, function(key2, index2) {
                                            if('Field #'+i == key2.FIELD){
                                                $scope.typePgFields['field'+i] = key2.MMDDYY;
                                            }
                                        });
                                    }
                                });
                                $scope.fieldContainer["Field" + vc] = true;
                                $scope.editFields['placeholder' + vc] = getFields[vc];
                            } else {
                                $scope.fieldContainer["Field" + vc] = false;
                            }
                        }
    
                        angular.forEach(matches, function(key, index) {
                            var getIndex = parseInt(index) + parseInt(1);
                            if (key.name != "") {
                                $scope.editFields["field" + getIndex] = key.code;
                                desc["desc" + getIndex] = key.desc;
                            } 
                        });
                    }
                }
                if (!$scope.setFlag) { 
                    $scope.updateProfileList(false, newData);
                } 
                $scope.showEditForm = false;
            }
            
        }, 1000);
    }

    $scope.focusOutField = function(x) {
        var fields = {
            "field1": "",
            "field2": "",
            "field3": "",
            "field4": "",
            "field5": "",
            "field6": "",
            "field7": "",
        }
        
        for (var xn = 1; xn < 8; xn++) {
            if($("#field" + xn).dxTextBox("instance") == undefined) {
            fields["field" + xn] = "";
            } else {
            fields["field" + xn] = $("#field" + xn).dxTextBox("instance").option('value');
            }
        }
        
        var getField = x.element[0].id.split('field')[1];
        wdService.getFieldDes($scope.pgCabinetValue.split("|")[0], fields, getField).then(function(res) {
            var fieldDescValues = res.data.data.fields;
            profileService.setDesc({
                desc1: fieldDescValues.field1,
                desc2: fieldDescValues.field2,
                desc3: fieldDescValues.field3,
                desc4: fieldDescValues.field4,
                desc5: fieldDescValues.field5,
                desc6: fieldDescValues.field6,
                desc7: fieldDescValues.field7
            })
        }, function(error) {
            var data = { fileAction: false };
            $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
        });
    }

    $scope.updateProfileList = function(x, y) {
        var handleUpdateProfileList = function () {
            var cabs = { Cabinets: $scope.pgCabinetValue };
            wdService.checkProfile(cabs, $scope.editFields).then(function(res) {
                var getData = res.data;
                if (getData.Header.ErrorCount != "") {
                    $scope.tableErr(getData);
                    //$scope.showDetails(getData);
                    return false;
                }
                if (x) {
                    $scope.profileSuccess();
                    return false;
                }

                if (y !== undefined) {
                    $scope.setCategoryList(getData.Profile.wdPath, y);
                }
                $scope.showDetails(getData);
            }, function(error) {
                var data = { fileAction: false };
                $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
            });
        }

        if(x){
            wdService.isFileHasChanged().then(function (hasChanged) {

                var changedData = hasChanged.res;
                if (changedData.Header.ErrorCount !== "") {
                    var data = { title: $scope.editTitle, fileAction: true, action: "DownloadDocument, wdInfo", desc: hasChanged.fileData.Description, doc: hasChanged.fileData.DocId };
                    $rootScope.$broadcast("errorAction", {visible: true, rctx: changedData.Header.wd_Error_RCTX, data: data});
                    return false
                }

                if(hasChanged.confirm){
                    $rootScope.$broadcast('showMessageWhenFileChanged', {title:'Edit Metadata', desc:hasChanged.res.items[0].Description, docid:hasChanged.res.items[0].DocId});
                    $rootScope.$broadcast('setConfirmHashChanged', {fnc:function(){
                        $('#popupFileChangedOptions').dxPopup().dxPopup("instance").hide();
                        handleUpdateProfileList();
                        $(this).off();
                    }});
                    $rootScope.$broadcast('hideProlieView');
                }else{
                    handleUpdateProfileList();
                    $rootScope.$broadcast('hideProlieView');
                }
                wdService.unLockFile();

            })
        }else{
            handleUpdateProfileList()
        }
    }

    $scope.tableErr = function(err) {
        switch (err.Header.wd_Error_RCTX) {
            case "WDRC_TESTPROFILE_FIELD_INVALID":
            for(var i = 1; i <= 7; i++) {
                if (err.Header.wd_Error_VAR == "wd_FILE_FIELD" + i + "_VALUE") {
                    $scope.descField["desc" + i] = "Invalid field code";
                    $scope["wdFieldColor" + i] = "#a80000";
                }
            }
            break
            default:
            console.log("profileError");
            //var data = { fileAction: false };
            //$rootScope.$broadcast("errorAction", {visible: true, rctx: err.Header.wd_Error_RCTX, data: data});
        }
        // buttonIndicator.option("visible", false);
    }

    $scope.showDetails = function(x) {
        var testedProfile = x.Profile.Fields;
        $scope.descField = {
            desc1: testedProfile.Field1.wd_File_Field_Desc,
            desc2: testedProfile.Field2.wd_File_Field_Desc,
            desc3: testedProfile.Field3.wd_File_Field_Desc,
            desc4: testedProfile.Field4.wd_File_Field_Desc,
            desc5: testedProfile.Field5.wd_File_Field_Desc,
            desc6: testedProfile.Field6.wd_File_Field_Desc,
            desc7: testedProfile.Field7.wd_File_Field_Desc
        }

        for(var xn = 1; xn <= 7; xn++) {
            if ( testedProfile["Field" + xn].wd_File_Field_Error !== "" ) {
                $scope["wdFieldColor" + xn] = "#a80000";
            } else {
                $scope["wdFieldColor" + xn] = "#107c10";
            }
        }
    }

    $scope.setCategoryList = function(x, y) {
        $scope.tagValues = [];
        var decode = decodeURIComponent(x);
        var taglist = [];
        fileListUI.getCategoryList(decode).then(function(res) {
            var catGroup = res.data.root;
            if (catGroup.Header.Error_Count !== "") {
                console.log(catGroup.Header.Error_Msg);
                return false;
            }
            $scope.listOfTags = catGroup.Items;
            var catList = y[0].CAT_ID;
            $scope.catList = y[0];
            if (catList !== ""){
                angular.forEach($scope.listOfTags, function(keyLi, indexli) {
                    angular.forEach(catList, function(key, index) {
                        if (keyLi.CN === key.CN) {
                            taglist.push(keyLi);
                        }
                    });
                });
            }
            $scope.tagValues = taglist;
            $scope.oriTagValue = angular.copy($scope.tagValues);

        }, function(error) {
            var data = { fileAction: false };
            $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
        });
    }

    $scope.setSelectMenu = function(x) {
        $scope.selected = x
    }

    $scope.isActive = function (x) {
        return $scope.selected === x;
    }

    $scope.profileSuccess = function() {

        var getBtnTxt = $("#editProfileBtn").dxButton("instance");
        var getFileList = $("#gridContainer").dxDataGrid("instance");

        var actionId;
        if (getBtnTxt.option().text == "Copy") {
            actionId = 16;
        } else {
            actionId = 8;
        }
        var createPath = parseInt(64) + actionId;
        var fields = { "field1": { 'value': $scope.editFields.field1 ? $scope.editFields.field1 : '' }, "field2": { 'value': $scope.editFields.field2 ? $scope.editFields.field2 : '' }, "field3": { 'value': $scope.editFields.field3 ? $scope.editFields.field3 : '' }, "field4": { 'value': $scope.editFields.field4 ? $scope.editFields.field4 : '' }, "field5": { 'value': $scope.editFields.field5 ? $scope.editFields.field5 : '' }, "field6": { 'value': $scope.editFields.field6 ? $scope.editFields.field6 : '' }, "field7": { 'value': $scope.editFields.field7 ? $scope.editFields.field7 : '' }, "security": $scope.securityValue, "desc": encodeURIComponent($scope.editFields.descComm), "comm": encodeURIComponent($scope.editFields.comment), "wdRename": createPath, "cabinet": $scope.pgCabinetValue.split("|")[0]};
        angular.forEach(homeService.getSelectedList(), function (key, index) {
            index = (index === undefined ? 0 : index);
            wdService.updateProfile(fields, key).then(function(res) {
                var response = res.data.fileStatus;
                if (response.errorStatus.ErrorCount !== "") {
                    var data = {title: $scope.editTitle, desc: homeService.getSelectedList()[0].Description, doc: homeService.getSelectedList()[0].DocId, action: "Edit, wdInfo", fileAction: true}
                    $scope.setPopupDailog(true, response.errorStatus.wd_Error_RCTX, data);
                    //buttonIndicator.option("visible", false);
                    return false;
                }
                
                $scope.delCats();
            }, function(error) {
                var data = { fileAction: false };
                $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
            });
        });
    }

    $scope.delCats = function() {
        var getFileList = $("#gridContainer").dxDataGrid("instance");
        if ($scope.oriTagValue.length !== 0) {
            var setDelete = "+wd_FILE_CAT_DEL_VALUE=*";
            wdService.setCats(setDelete, $scope.catList).then(function(res) {
                if (res.data.category.errorStatus.ErrorCount !== "") {
                    buttonIndicator.option("visible", false);
                    $scope.$parent.$parent.$parent.$parent.checked = false;
                    getFileList.refresh();
                    return false
                } 
                $scope.addCats();
            }, function(error) {
                buttonIndicator.option("visible", false);
                $scope.$parent.$parent.$parent.$parent.checked = false;
                getFileList.refresh();
            });
        } else {
            $scope.addCats();
        }
    }

    $scope.addCats = function() {
        var getFileList = $("#gridContainer").dxDataGrid("instance");
        if ($scope.tagValues.length !== 0) {
            var setAdd = "";
            for (var xn = 0; xn < $scope.tagValues.length; xn++) {
                setAdd = setAdd + "+wd_FILE_CAT_ADD_VALUE[" + xn + "]=" + $scope.tagValues[xn].CN;
            }
            wdService.setCats(setAdd, $scope.catList).then(function(res) {
                buttonIndicator.option("visible", false);
                $scope.$parent.$parent.$parent.checked = false;
                getFileList.refresh();
            }, function(error) {
                buttonIndicator.option("visible", false);
                $scope.$parent.$parent.$parent.checked = false;
                getFileList.refresh();
            });
        } else {
            buttonIndicator.option("visible", false);
            $scope.$parent.$parent.$parent.checked = false;
            getFileList.refresh();
        }
    }

    $scope.errortype = function(fileResource, x) {
        var setErrorData;
        if (fileResource.errorStatus.wd_Error_DOCID !== "") {
            setErrorData = { title: fileResource.errorStatus.wd_Error_DOCID, desc: fileResource.errorStatus.wd_Error_DOCNAME, wdMsg: fileResource.errorStatus.wd_Error_MSG, status: "failed", type: false, action: x };
            $rootScope.$broadcast('setDialogStatus', setErrorData);
            buttonIndicator.option("visible", false);
            return false;
        }
        
        setErrorData = { wdMsg: fileResource.errorStatus.wd_Error_MSG, status: "failed", type: true, action: x };
        $rootScope.$broadcast('setDialogStatus', setErrorData);
        buttonIndicator.option("visible", false);
    }

    $scope.searchFt = function() {
        $scope.fieldListData = "";
        $scope.fieldTableSpin = false;
        $timeout(function() {
            //$scope.getFieldTables($scope.fieldNum, $scope.fieldTableTitle, true);
            $scope.listTable(false, true);
        },1000);
    }

    angular.element($window).bind('resize', function(){
        var chkDirecScroll = $("#leftProfile").dxScrollView("instance");
        if (chkDirecScroll !== undefined) {
            $("#leftProfile").dxScrollView("instance").option("height", (window.innerHeight - 225));
        };
    });

    $scope.scrollLeftNav = {
        scrollByContent: true,
        scrollByThumb: true, 
        showScrollbar: "always",
        height: function() {
            return window.innerHeight - 225;
        },
        useNative: true    
    }

    $scope.filterLabelTable = function(){
        $scope.showTableLoader = false;
        $timeout(function(){
            $scope.showTableLoader = true;
        }, 1000)
    }


    $scope.wdEdit = true;

    $scope.updateProfile = {
        bindingOptions: {
            text: 'profileBtn'
        },
        type: 'success',
        useSubmitBehavior: true,
        template: function(data, container) {
            $("<div class='button-indicator'></div><span class='dx-button-text'>" + data.text + "</span>").appendTo(container);
            buttonIndicator = container.find(".button-indicator").dxLoadIndicator({
                    visible: false,
                    width: 16,
                    height: 16
            }).dxLoadIndicator("instance");
        },
        onClick: function(data) {
            buttonIndicator.option("visible", true);
        }
    }

    $scope.getComment = {
        "Comment": ""
    }

    $scope.scrollTables = {
        scrollByContent: true,
        scrollByThumb: true, 
        showScrollbar: "always",
        height: function() {
            return window.innerHeight - 290;
        },
        useNative: true   
    }

    $scope.getFieldTables = function(x, y, z, n) {
        var wdFilter = $("#wdFilterProfile").dxTextBox("instance");
        wdFilter.option("value", "");
        $scope.prefillData = '';
        $scope.fieldListData = [];
        $scope.total = "";
        $scope.ftCount = "";
        $scope.fieldTableSpin = false;
        $scope.maxcount = 500;
        $scope.indexFr = 0;
        $scope.uploadTitle = y;
        $scope.selectedField = x;
        
        $scope.fieldPanel = true;
        $scope.autoFilter = "";
        
        // if ($localStorage.ftListId) {
        //     $scope.closeList();
        // } 

        $timeout(function() {
            $scope.prefillData = 'ft';
            $scope.checkFt = true;
            $scope.listTable(false, false);
        }, -1000);
    }

    $scope.chkError = function(err) {
        if (err.wd_Error_MSG == "WDRC_ZERO_FIELDS_CLEAN") {
            $scope.noResults = "Your filter has no results."
            $timeout(function(){
                $scope.fieldTableSpin = true;
            }, 1000);
            return false
        }
        $scope.fieldTableSpin = true;
    }
    

    $scope.listTable = function(x, y) {

        wdService.getfieldTables($scope.pgCabinetValue.split("|")[0], $scope.editFields, $scope.selectedField, $scope.maxcount, $scope.indexFr, y, $scope.textValue).then(function(res){
            var wdFilter = $("#wdFilterProfile").dxTextBox("instance"),
            wdFilterValue = wdFilter.option("value");
            $scope.listlength = res.data.root.FieldTbl.length;

            if (wdFilterValue == "") {
                $scope.total = res.data.root.Header.ListCount;
            } else {
                $scope.total = res.data.root.FieldTbl.length
            }

            if (res.data.root.Header.ErrorCount != "") {
                $scope.chkError(res.data.root.Header)
                return false;
            }

            $localStorage.ftListId = res.data.root.Header.List_ID;
            // $scope.closeList(res.data.root);

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
            }, 1000)

        }, function(err){
            $scope.fieldTableSpin = true;
            var data = { fileAction: false };
            $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
        });
    }

    $scope.closeList = function(x) {
        var listId = x.Header.List_ID;
        if (!$localStorage.ftListId) {
            $localStorage.ftListId = listId;
            return false;
        } 
        wdService.clearListfromParm($localStorage.ftListId).then(function(res) {
            $localStorage.ftListId = listId;
        }, function(error) {
            var data = { fileAction: false };
            $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
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

    $scope.setField = function(x) {
        for (var i = 1; i <= 7; i++) {
            if (x["f" + i + "n"]) {
                $("#field" + i).dxTextBox("instance").option('value', x["f" + i + "n"]);
                $scope.descField["desc" + i] = x["f" + i + "d"];
            }
        }
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

    $scope.commentData = {
      bindingOptions: {
        formData: "getComment",
        readOnly: false,
        showColonAfterLabel: true,
        showValidationSummary: false,
        colCount: 1,
        validationGroup: "comment"
      },
      items: [
        {
          itemType: "group",
          items: [{
            colSpan: 1,
            dataField: "Comment",
            editorType: "dxTextArea",
            editorOptions:{
              height: 90
            },
            label: {
              text: "Comment:"
            }
          }]
        }
      ]

    }

    $scope.commentBtn = {
      text: 'Add Comment',
      type: 'success',
      useSubmitBehavior: true,
      validationGroup: "comment"
    }

    $scope.tagList = wdService.getFileData().tags;

    $scope.$watch(function(){
        return wdService.getFileData();
    }, function(newVal) {
      $scope.tagList = newVal.tags;
    });

    $scope.$watch(function(){
        return profileService.getDesc();
    }, function(getNewVal) {
        $scope.descField = getNewVal
    });


    $scope.setDescComm = function(x) {
        if (x.Comments !== undefined && x.Description !== "") {
            $scope.editFields.descComm = x.Description.replace(/<\/?[^>]+(>|$)/g, "") + '\r\n\r\n' + x.Comments;
            return false;
        }
        $scope.editFields.descComm = x.Description.replace(/<\/?[^>]+(>|$)/g, "");
    }

    // $scope.wdTag = {
    //   bindingOptions: {
    //     value: "tagList"
    //   },
    //   valueExpr: 'CD',
    //   displayExpr: 'CD'
    // }

    // $scope.updateComment = function(x){
    //     var string
    //     $scope.spinner = false;
    //     if ($scope.getComment.Comment.indexOf('\\') != -1) {
    //         string = $scope.getComment.Comment.split(String.fromCharCode(92)).join(String.fromCharCode(47));
    //     } else {
    //         string = $scope.getComment.Comment;
    //     }
    //     profileService.submitComment(string, fileID).then(function(res){
    //         $timeout(function(){
    //             uxService.setMessage("Updated the comments for DocID: " + fileID.DocId + " successfully!", "success");
    //             $route.reload();
    //         }, 2000);
    //     }, function(error) {
    //         uxService.setMessage("Failed to updated the comments for DocID: " + fileID.DocId + "!", "error");
    //         $log.log(error);
    //         $route.reload();
    //     });
    // }

    function getCabinets () {
        wdService.getPgCabinets().then(function(res) {
            console.log(res);
            var pgList = res.data.root;
            if (pgList.Header.ErrorCount !== "") {
                console.log(pgList.Header.wd_Error_MSG);
                return false
            }
            $scope.cabinetListFull = pgList.items;
            //console.log($scope.cabinetListFull);
        }, function(err) {
            var data = { fileAction: false };
            $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
        });
        var cabinetList = [];
        panelTitleService.getCabinetList().then(function(res){
          if (res.data.root.Header.ErrorCount !== "") {
              console.log(res.data.root.Header.wd_Error_MSG);
              return false;
          }
          for (var i = 0; i < res.data.root.Cabinets.length; i++) {
              cabinetList.push(res.data.root.Cabinets[i]);
          }
        }, function(error){
          console.log(error);
        });
        return cabinetList;
    }
    $scope.btnCancelProfile = 'Cancel';
    $scope.cancelProfilebtn = {
        bindingOptions: {
            text: "btnCancelProfile"
        },
        type: 'success',
        useSubmitBehavior: true,
        onClick: function(data) {
            $scope.fieldListData.length = 0;
            $scope.wdEdit = true;
        }
    }
}]);
