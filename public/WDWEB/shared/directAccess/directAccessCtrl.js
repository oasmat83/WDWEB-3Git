angular.module('WDWeb').controller("directAccessCtrl", ['$scope', '$rootScope', '$route', '$routeParams', '$timeout', '$log', '$window', '$localStorage', '$location', 'directAccess', 'wdService', 'homeService', 'leftNavService', '$q', function($scope, $rootScope, $route, $routeParams, $timeout, $log, $window, $localStorage, $location, directAccess, wdService, homeService, leftNavService, $q){
    var vm = this;
    vm.showUploadLoader = true;
    $scope.cabinetList = [];
    vm.directUrl = false;
    $scope.textValue = "";
    $scope.directPlaceholder = "";
    vm.noResults = "";

    angular.element($window).bind('resize', function(){
        var chkDirecScroll = $("#leftDirect").dxScrollView("instance");
        if (chkDirecScroll !== undefined) {
            $("#leftDirect").dxScrollView("instance").option("height", (window.innerHeight - 225));
        };
    });

    // $scope.$watch(function(scope) {
    //     return vm.prefillData;
    // }, function handle(newV, oldV) {
    //     if (newV == "ft") {
    //         $scope.directPlaceholder = "Search"
    //         return false;
    //     }
    //     $scope.directPlaceholder = "Filter"
    // });

    $scope.wdFilterBox = {
        // bindingOptions: {
        //     placeholder: "directPlaceholder",
        // },
        placeholder: "Filter",
        elementAttr: {
            id: "wdFilterDirectAccess"
        },
        onEnterKey: function(e) {
            vm.fieldTableSpin = false;
            $scope.textValue = e.event.target.value;
            vm.noResults = "";
            if (vm.prefillData == 'ft') {
                vm.searchFt();
            } else {
                $timeout(function() {
                    vm.fieldTableSpin = true;
                }, 1000);
            }
            
        },
        showClearButton: true
    }

    $scope.wdFilterSideBtn = {
        icon: "ms-Icon ms-Icon--Accept",
        onClick: function(e) {
            vm.fieldTableSpin = false;
            var wdFilter = $("#wdFilterDirectAccess").dxTextBox("instance");
            $scope.textValue = wdFilter.option("value");
            vm.noResults = "";
            if (vm.prefillData == 'ft') {
                vm.searchFt();
            } else {
                $timeout(function() {
                    vm.fieldTableSpin = true;
                }, 1000);
            }
            
        },
        elementAttr: {
            class: "wdFilterSideBtn"
        } 
    }

    $scope.$on('setDirectAccess', function(e) {
        vm.showUploadLoader = true;
        wdService.getFavMatters().then(function(res){
            var favMatter = res.data.root;
            if (favMatter.Header.ErrorCount != "") {
                console.log(favMatter.Header.wd_Error_RCTX);
                return false;
            }
            vm.showUploadLoader = false;
            vm.favMatters = favMatter.FavMatters;
            vm.selected = favMatter.FavMatters[0];
            $scope.setOverDirect();
        }, function(error){
            var data = { fileAction: false };
            $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
        });

        wdService.getDirectCabinet().then(function(res) {
            $scope.cabinetList = [];
            if (res.data.root.Header.ErrorCount != "") {
                console.log(res.data.root.Header.wd_Error_RCTX);
                return false;
            }
            for (i = 0; i < res.data.root.Cabinets.length; i++) {
                $scope.cabinetList.push(res.data.root.Cabinets[i]);
            }
            $scope.setOverDirect();
        }, function(error) {
            var data = { fileAction: false };
            $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
        });

    });

    $scope.setOverDirect = function(){
        setTimeout(function(){
            $("#formDirectAccess").mouseover(function(e){
                $rootScope.checkOverDirAcc = true;
            });
            $("#formDirectAccess").mouseout(function(e){
                $rootScope.checkOverDirAcc = false;
            });
        }, 100);
    }

    vm.init = function() {
        vm.checkFt = false;
        vm.moreTables = false;
        $timeout(function(){
            angular.element(document).ready(function(){
                var SpinnerElements = document.querySelectorAll(".fieldSpinner");
                for (var i = 0; i < SpinnerElements.length; i++) {
                    new fabric['Spinner'](SpinnerElements[i]);
                }
            });
        }, 0);

        vm.fieldTableSpin = true;

        $scope.directData = {
            "Cabinets": ""
        }

        

        $scope.field = {"field1": "", "field2": "", "field3": "", "field4": "", "field5": "", "field6": "", "field7": ""};

        vm.showPgFields = {"field1": "", "field2": "", "field3": "", "field4": "", "field5": "", "field6": "", "field7": ""};
        //$scope.cabinetList = directAccess.getCabinets();
        vm.uploadToolBar = [
            { location: 'before', text: 'Direct Access' }
        ];
        vm.selectedField = 0;
        vm.prefillData = 'fm';
        vm.uploadTitle = "Favorite Matters";
        vm.formTitle = "Select a Cabinet";

        vm.searchFt = function() {
            vm.fieldListData = "";
            vm.fieldTableSpin = false;
            $timeout(function() {
                vm.listTable(false, true);
            }, -1000);
        }

        vm.setFavMatter = function(e) {
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

        vm.setFieldTableOrder = function(e) {
            var setTable = [];
            for(var i = 1;  i <= 7; i++) {
                if (e.hasOwnProperty("f" + i + "n")) {
                    var data = e["f" + i + "n"] + " (" + e["f" + i + "d"] + ")";
                    setTable.push(data);
                }
            }
            return setTable.reverse().join(" - ");
        }


        vm.setTooltip = function(data) {
            return "<div class='custom-item'>" + data.pgName + "</div>";
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

        vm.fieldDesc = {
            "field1": "",
            "field2": "",
            "field3": "",
            "field4": "",
            "field5": "",
            "field6": "",
            "field7": ""
        }


    };

    vm.sendBtn = {
        text: "Go",
        type: "success",
        useSubmitBehavior: true,
        validationGroup: "directSearch"
    }

    $scope.sendTo = function() {
        vm.directUrl = true;
        wdService.checkAccessProfile($scope.directData, $scope.field).then(function(res) {
            var getData = res.data;
            if (getData.Header.ErrorCount != "") {
                vm.newFileErr(getData);
                //vm.showDetails(getData);
                vm.directUrl = false;
                return false;
            }

            for(var xn = 1; xn <= 7; xn++) {
                vm["wdFieldColor" + xn] = "#107c10";
            }

            for (var i = 0; i < $scope.cabinetList.length; i++){
                if ($scope.directData.Cabinets.split('|')[0] == $scope.cabinetList[i].pgID) {
                    vm.calculateData($scope.cabinetList[i], getData);
                    return false;
                }
            }

        }, function(error) {
            var data = { fileAction: false };
            $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
        });
    }

    vm.newFileErr = function(err) {
        switch (err.Header.wd_Error_RCTX) {
            case "WDRC_TESTPROFILE_FIELD_INVALID":
            for(var i = 1; i <= 7; i++) {
                if (err.Header.wd_Error_VAR == "wd_FILE_FIELD" + i + "_VALUE") {
                    vm.fieldDesc["field" + i] = "Invalid field code";
                    vm["wdFieldColor" + i] = "#a80000";
                }
            }
            break
            default:
            var data = { fileAction: false };
            $rootScope.$broadcast("errorAction", {visible: true, rctx: err.Header.wd_Error_RCTX, data: data});
        }
    }

    vm.showDetails = function(x) {
        var testedProfile = x.Profile.Fields;
        vm.fieldDesc = {
            field1: testedProfile.Field1.wd_File_Field_Value,
            field2: testedProfile.Field2.wd_File_Field_Value,
            field3: testedProfile.Field3.wd_File_Field_Value,
            field4: testedProfile.Field4.wd_File_Field_Value,
            field5: testedProfile.Field5.wd_File_Field_Value,
            field6: testedProfile.Field6.wd_File_Field_Value,
            field7: testedProfile.Field7.wd_File_Field_Value
        }

        for(var xn = 1; xn <= 7; xn++) {
            if ( testedProfile["Field" + xn].wd_File_Field_Error !== "" ) {
                vm["wdFieldColor" + xn] = "#a80000";
            } else {
                vm["wdFieldColor" + xn] = "#107c10";
            }
            //vm.fieldDesc["field" + xn] = testedProfile["Field" + xn].wd_File_Field_Desc;
        }
    }

    vm.calculateData = function(x, y) {
        var subField = x.pgFields.split("|");
        var subData = [];
        for (var i = 1; i < subField.length; i++) {
            if (subField[i] != "") {
                subData.push($scope.field["field" + i] + " (" + vm.fieldDesc['field'+ i] + ")");

            }
        }
        // homeService.setTitle({"path": subData, "flag": "direct", "name": x.pgName });
        
        $timeout(function() {
            vm.directUrl = false;
            $location.path('/home').search( { query: y.Profile.wdPath, id: Date.now()} );
        }, 500)
    }

    vm.wdButtons = function(x, y){
        var wdFilter = $("#wdFilterDirectAccess").dxTextBox("instance");
        wdFilter.option("value", "");
        if($( window ).width()<=767){
            $("#phxUpload .nav-save").css({'display':'block','width':'100%', 'border-right':'0px'});
            $("#phxUpload .saveForm").css({'display':'none', 'width':'0%'});
        }
        vm.prefillData = x;
        vm.uploadTitle = y;
        vm.selectedField = 0;
        vm.autoFilter = "";
        vm.checkFt = false;
    };
    vm.nextFocus = function(input){
        $("#"+input).dxTextBox("instance").focus();
    }
    vm.getTables = function(x, y) {
        var wdFilter = $("#wdFilterDirectAccess").dxTextBox("instance");
        wdFilter.option("value", "");
        vm.prefillData = '';
        vm.fieldListData = [];
        vm.total = "";
        vm.ftCount = "";
        vm.fieldTableSpin = false;
        vm.maxcount = 500;
        vm.indexFr = 0;
        vm.uploadTitle = y;
        vm.selectedField = x;
        
        vm.fieldPanel = true;
        vm.autoFilter = "";
        
        if ($localStorage.ftListId) {
            vm.closeList();
        } 

        $timeout(function() {
            vm.prefillData = 'ft';
            vm.checkFt = true;
            vm.listTable(false, false);
        }, -1000);
    }

    vm.chkError = function(err) {
        if (err.wd_Error_MSG == "WDRC_ZERO_FIELDS_CLEAN") {
            vm.noResults = "Your filter has no results."
            $timeout(function(){
                vm.fieldTableSpin = true;
            }, 1000);
            return false
        }
        vm.fieldTableSpin = true;
    }

    vm.listTable = function(x, y) {

        wdService.getfieldTables($scope.directData.Cabinets.split("|")[0], $scope.field, vm.selectedField, vm.maxcount, vm.indexFr, y, $scope.textValue).then(function(res){
            vm.total = res.data.root.Header.ListCount;
            vm.listlength = res.data.root.FieldTbl.length;

            if (res.data.root.Header.ErrorCount != "") {
                vm.chkError(res.data.root.Header)
                return false;
            }

            $localStorage.ftListId = res.data.root.Header.List_ID;
            // vm.closeList(res.data.root);

            if (x) {
                var merged = vm.fieldListData.concat(res.data.root.FieldTbl);
                vm.listlength = merged.length;
                vm.fieldListData = merged;
            } else {
                vm.fieldListData = res.data.root.FieldTbl;
            }

            if (vm.total > vm.maxcount) {
                vm.moreTables = true;
                vm.checkFt = true;
                vm.ftCount = " " + vm.listlength + " of " + vm.total;
            } else if (vm.total == "1") {
                vm.ftCount = " 1 of 1";
                vm.checkFt = false;
            } 
            else {
                vm.ftCount = " " + vm.total + " of " + vm.total;
                vm.checkFt = false;
            }

            vm.fieldNum = res.data.root.Header.FieldNum;
            vm.listCount = parseInt(res.data.root.Header.ListCount);
            vm.fieldNumber = vm.selectedField;
            $timeout(function() {
                vm.fieldTableSpin = true;
            }, 1000)

        }, function(err){
            vm.fieldTableSpin = true;
            var data = { fileAction: false };
            $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
        });
    }

    vm.loadMore = {
        text: "Load More",
        type: "success",
        useSubmitBehavior: false,
        onClick: function() {
            vm.indexFr =+ vm.indexFr + (vm.maxcount + 1);
            vm.listTable(true, false);
        }
    }

    vm.closeList = function() {
        // var listId = x.Header.List_ID;
        // if (!$localStorage.ftListId) {
        //     $localStorage.ftListId = listId;
        //     return false;
        // } 
        wdService.clearListfromParm($localStorage.ftListId).then(function(res) {
            //$localStorage.ftListId = listId;
        }, function(error) {
            var data = { fileAction: false };
            $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
        });
    }

    vm.scrollLeftNav = {
        scrollByContent: true,
        scrollByThumb: true, 
        showScrollbar: "always",
        height: function() {
            return window.innerHeight - 225;
        },
        useNative: true    
    }

    vm.setField = function(x) {
        vm.selected = x;
        for (i = 1; i <= 7; i++) {
            if (x["f" + i + "n"]) {
                $scope.field["field" + i] = x["f" + i + "n"];
                vm.fieldDesc["field" + i] = x["f" + i + "d"];
            }
        }
        vm.autoSearch = "";
        vm.autoFilter = "";
    }

    vm.isActive = function(x) {
        return vm.selected === x;
    }

    vm.setSelected = function(x) {
        vm.selected = x; 
    }

    vm.getUploadData = function(x, y) {
        if($( window ).width()<=767) {
            $("#phxUpload .nav-save").css({'display':'none','width': '0%'});
            $("#phxUpload .saveForm").css({'display':'block','width': '100%'});
        }
        vm.selected = x;
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

        for (var i = 1; i <= 7; i++) {
            if (x["f" + i + "c"] == "") {
                x["f" + i + "n"] = "";
                x["f" + i + "c"] = "";
                x["f" + i + "d"] = "";
            }
            vm["wdFieldColor" + i] = "#107c10";
            $scope.field["field" + i] = x["f" + i + "c"];
            vm.fieldDesc["field" + i] = x["f" + i + "d"];
            vm.autoFilter = "";
        }


        $scope.showField = {
            "Cabinets": x.dwPGID + "|" + x.f1c  + "|" + x.f2c + "|" + x.f3c + "|" + x.f4c + "|" + x.f5c + "|" + x.f6c + "|" + x.f7c + "|"
        }

        $scope.directData = {
            "Cabinets": x.dwPGID + "|" + x.f1n  + "|" + x.f2n + "|" + x.f3n + "|" + x.f4n + "|" + x.f5n + "|" + x.f6n + "|" + x.f7n + "|"
        }


    };

    vm.getFieldsDesc = function(x) {
        var getField = x.element[0].id.split('fieldDesc')[1];
        wdService.getFieldDes($scope.directData.Cabinets.split("|")[0], $scope.field, getField).then(function(res) {
            var fieldDescValues = res.data.data.fields;
            vm.fieldDesc = {
                field1: fieldDescValues.field1,
                field2: fieldDescValues.field2,
                field3: fieldDescValues.field3,
                field4: fieldDescValues.field4,
                field5: fieldDescValues.field5,
                field6: fieldDescValues.field6,
                field7: fieldDescValues.field7
            }
            
            for(var i = 1; i <= 7; i++) {
                vm["wdFieldColor" + i] = "#107c10";
            }
        }, function(error) {
            var data = { fileAction: false };
            $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
        });
    }

    $scope.selectedCabinet = function(e) {
        var getFields = e.value.split('|');
        for(var i = 1;  i <= 7; i++) {
            if(getFields[i] != "") {
                vm.showPgFields["field" + i] = getFields[i];
            } else {
                vm.showPgFields["field" + i] = "";
            }
        }

        if (e.event !== undefined) {
            $scope.field = { "field1": "", "field2": "", "field3": "", "field4": "", "field5": "", "field6": "", "field7": "" };
            vm.fieldDesc = { "field1": "", "field2": "", "field3": "", "field4": "", "field5": "", "field6": "", "field7": "" }
        };

        if (vm.prefillData == "ft") {
            var getfirstfield = e.value.split('|');
            for(var i = 1;  i <= 7; i++) {
                if (getfirstfield[i] !== ""){
                    vm.getTables(i, getfirstfield[i]);
                    break;
                }
            };
        };
    }

}]).factory('directAccess', function(wdService) {
    var cabinetList = []
    var accessFields = [
        {
            dataField: "Cabinets",
            editorType: "dxSelectBox",
            editorOptions: {
                dataSource: cabinetList,
                valueExpr: 'pgFields',
                displayExpr: "pgName",
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
            visible: false
        },
        {
            dataField: "Field2",
            template: "Field2",
            label: {
                visible: false
            },
            visible: false
        },
        {
            dataField: "Field3",
            template: "Field3",
            label: {
                visible: false
            },
            visible: false
        },
        {
            dataField: "Field4",
            template: "Field4",
            label: {
                visible: false
            },
            visible: false
        },
        {
            dataField: "Field5",
            template: "Field5",
            label: {
                visible: false
            },
            visible: false
        },
        {
            dataField: "Field6",
            template: "Field6",
            label: {
                visible: false
            },
            visible: false
        },
        {
            dataField: "Field7",
            template: "Field7",
            label: {
                visible: false
            },
            visible: false
        }
    ]

    return {
        directFields: directFields
        //getCabinets: getCabinets
    }

    function directFields() {
        return accessFields;
    }

    // function getCabinets() {
    //     return cabinetList;
    // }
});
