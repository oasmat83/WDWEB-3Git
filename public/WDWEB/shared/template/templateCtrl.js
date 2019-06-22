angular.module('WDWeb').controller("templateCtrl", ['$scope', '$rootScope', '$route', '$routeParams', '$timeout', '$log', '$window', '$localStorage', '$location', 'template', 'wdService', 'homeService', 'leftNavService', function($scope, $rootScope, $route, $routeParams, $timeout, $log, $window, $localStorage, $location, template, wdService, homeService, leftNavService){
    var vm = this;
    var fieldArray = [];
    var query = $location.search();
    var myCabinetList = [];
    $scope.contextualItems = [{ text: "Set Default",  icon: "ms-Icon ms-Icon--Heart"}];
    vm.templates = [];
    vm.userTemps = [];
    vm.publicTemps = [];
    vm.fieldTableSpin = true;
    vm.getQaCabinets = "";
    vm.pgName = [];
    vm.checkFt = false;
    vm.moreTables = false;
    $scope.gridBoxValue = [];
    vm.publicTempData = {};
    vm.userTempData = {};
    vm.templatesData = {};
    vm.isTemplate = true;
    $scope.selectedpg = [];
    vm.showTempleLoader = true;
    vm.noResults = "";
    $scope.textValue = "";

    $scope.wdFilterBox = {
        placeholder: "Filter",
        elementAttr: {
            id: "wdFilterTemplate"
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
            var wdFilter = $("#wdFilterTemplate").dxTextBox("instance");
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

    vm.tempForm = {
        scrollByContent: true,
        scrollByThumb: true, 
        showScrollbar: "always",
        useNative: true
    }


    vm.tempMenu = {
        scrollByContent: true,
        scrollByThumb: true, 
        showScrollbar: "always",
        useNative: true
    }

    $scope.$on('closespinner', function(e, data) {
        vm.showTempleLoader = true;
        vm.prefillData = "";
        vm.formTitle = "Search...";
    });
    

    $scope.$on('setTemplates', function(e, data) {
        vm.setType = data.type;
        wdService.getCabinetList().then(function (res) {
            $scope.cabinetList = [];
            var getCabinets = res.data.root;
            if (getCabinets.Header.ErrorCount != "") {
                var wddata = { fileAction: false };
                $rootScope.$broadcast("errorAction", {visible: true, rctx: getCabinets.Header.wd_Error_RCTX, data: wddata});
                return false;
            }
            for (i = 0; i < getCabinets.Cabinets.length; i++) {
                $scope.cabinetList.push(getCabinets.Cabinets[i]);
            }
            myCabinetList = $scope.cabinetList;
            vm.defaultList = data;
            vm.getTemplateList(false, data.defaults.DefaultTab, data);
            $scope.setOverAddSear();
        }, function(error){
            var data = { fileAction: false };
            $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
        });
        
    });

    $scope.setOverAddSear = function(){
        setTimeout(function(){
            $("#phxTemplate").mouseover(function(e){
                $rootScope.checkOverAddSear = true;
            });
            $("#phxTemplate").mouseout(function(e){
                $rootScope.checkOverAddSear = false;
            });
        }, 100);
    }

    vm.getDefaultTemplate = function(x) {

        leftNavService.iniData('FindTemplatesList', '1').then(function(response) {

            var defaultTemplate = response.data.root;
            var setObj = {};

            if (defaultTemplate.Header.ErrorCount != "") {
                var wddata = { fileAction: false };
                $rootScope.$broadcast("errorAction", {visible: true, rctx: defaultTemplate.Header.wd_Error_RCTX, data: wddata});
                return false;
            }

            angular.forEach(defaultTemplate.items, function(item, index) {
                if (item.K == "FindTemplatesTreePublic" || item.K == "FindTemplatesTreeOnlyMe" || item.K == "FindTemplatesTree" || item.K == "DefaultTab") {
                    setObj[item.K] = item.D;
                }
            });
            vm.resetTemplate(x, setObj[vm.wdTemplateType])

        }, function(error) {

        });
    }

    vm.getTemplateList = function(x, y, z) {
        
        var xn = "";
        if (vm.setType) {
            if (y == "1") {
                xn = "0"; 
            } else {
                xn = y;
            }
        } else {
            xn = 0;
        }

        wdService.getTemplate(xn).then(function (res) {
            var getTempData = res.data.root;
            if (getTempData.Header.ErrorCount != "") {
                var wddata = { fileAction: false };
                $rootScope.$broadcast("errorAction", {visible: true, rctx: getTempData.Header.wd_Error_RCTX, data: wddata});
                return false
            }
            vm.templates = getTempData.items;
            vm.setDefaultTab(z.defaults);
            vm.showTempleLoader = false;
            $scope.setOverAddSear();
        }, function (error) {
            var data = { fileAction: false };
            $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
        });
    }

    vm.setDefaultTab = function(y) {
        if (vm.setType){
            if (y.DefaultTab == "1" || y.DefaultTab == "" || y.DefaultTab == undefined || y.DefaultTab == "0") {
                vm.prefillData = "all";
                vm.templateType = 'All Templates';
                vm.setDefaultTemplate(y.FindTemplatesTree);
            } else if (y.DefaultTab == "2"){
                vm.prefillData = "ut";
                vm.templateType = "User Templates";
                vm.setDefaultTemplate(y.FindTemplatesTreeOnlyMe);
            } else {
                vm.prefillData = "st";
                vm.templateType = 'Global Templates';
                vm.setDefaultTemplate(y.FindTemplatesTreePublic);
            }
        } else {
            vm.setTemplate(y);
        }
        
    };

    vm.setTemplate = function(y) {
        vm.prefillData = "all";
        vm.templateType = 'All Templates';
        var setSelectedTemplate = "";
        var setFieldValue = true;

        if (!$rootScope.searchTemplateType) {
            setSelectedTemplate = "Quick Access";
        } else {
            setFieldValue = false;
            setSelectedTemplate = $localStorage.templateName;
        }

        angular.forEach(vm.templates, function(key, index) {
            if (key.name == setSelectedTemplate) {
                vm.getTemplateData(key, true, true);
                return false;
            }
        });
        vm.setDefaultTemplate(y.FindTemplatesTree);
        vm.setFieldWith();
        if (!setFieldValue) {
            vm.setFieldValue();
        }
    }

    vm.setFieldValue = function(){
        var arr = ["xName", "fName", "access", "create", "modified", "text", "field1", "field2", "field3", "field4", "field5", "field6", "field7", "cabinet"];
        angular.forEach(arr, function(key, idx) {
            if (query[key] !== "" && ( key == "access" || key =="create" || key == "modified")){
                var dateValue = query[key].split(".");
                var flag = "";
                switch (key) {
                    case "access":
                        flag = 23;
                        break;
                    case "create":
                        flag = 9;
                        break;
                    case "modified":
                        flag = 4
                        break;
                    default:
                        flag = 41;
                }
                $scope.field["field" + flag].start = dateValue[0] + '.' + dateValue[1];
                $scope.field["field" + flag].end = '.' + dateValue[2] + '.' + dateValue[3];
            } else if (query[key] !== "" && ( key == "xName" || key =="fName" || key == "text" || key == "field1" || key =="field2" || key == "field3" || key == "field4" || key == "field5" || key =="field6" || key == "field7")) {
                var flag = "";
                switch (key) {
                    case "xName":
                        flag = 1;
                        break;
                    case "fName":
                        flag = 2;
                        break;
                    case "text":
                        flag = 17
                        break;
                    case "field1":
                        flag = 10
                        break;
                    case "field2":
                        flag = 11
                        break;
                    case "field3":
                        flag = 12
                        break;
                    case "field4":
                        flag = 13
                        break;
                    case "field5":
                        flag = 14
                        break;
                    case "field6":
                        flag = 15
                        break;
                    case "field7":
                        flag = 16
                        break;
                    default:
                }
                $scope.field["field" + flag] = query[key];
            }
        });
    }

    vm.getListFromWdBtn = function(x, y, z, n) {
        wdService.getTemplate(y).then(function (res) {
            var getTempData = res.data.root;
            if (getTempData.Header.ErrorCount != "") {
                var wddata = { fileAction: false };
                $rootScope.$broadcast("errorAction", {visible: true, rctx: getTempData.Header.wd_Error_RCTX, data: wddata});
                return false
            }
            vm.templates = getTempData.items;
            vm.setDefaultTemplate(vm.defaultList.defaults[n]);
            vm.showTempleLoader = false;
            $scope.setOverAddSear();
        }, function (error) {
            var data = { fileAction: false };
            $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
        });
    }

    vm.setFieldWith = function() {
        if (query.query) {
            if (query.query.indexOf("?t") !== -1){
                var data = query.query.split("?t ")[1];
                $scope.field.field17 = decodeURIComponent(data);
            }
    
            if (query.query.indexOf("?t") == -1) {
                $scope.field.field1 = decodeURIComponent(query.query);
            }
        }
    }

    vm.setDefaultTemplate = function(x) {
        angular.forEach(vm.templates, function(key, index){
            vm.setdefault(key, x);
        });
    }

    vm.setdefault = function(x, y) {
        if(x.name == y) {
            x.default = true;
            
            if(vm.setType){
                vm.getTemplateData(x, true, true);
            }
        }
    }

    function checkDateField() {
        /*
         * validate date from and to Date
         * ex:
         * if Modified (from) field selected => validate required Modified(to)
         * if Modified (to) field selected => validate required Modified(from)
         * */

        var arrFieldId = [4, 9, 23, 41]
        var emptyValues = ['.0.0', '0.0']
        var types = ['end', 'start']
        var Labels = [
            {
                id: 4,
                name: 'Modified'
            },
            {
                id: 9,
                name: 'Created'
            },
            {
                id: 23,
                name: 'Accessed'
            },
            {
                id: 41,
                name: 'Email'
            }
        ]

        arrFieldId.forEach(function (id) {
            $("#" + id + "-start,#" + id + "-end").dxValidator({
                validationRules: []
            });
            var tmp = ''
            types.forEach(function (type) {
                var oppositeType = (type == 'start') ? 'end' : 'start'
                var oppositeTypeNameField = (oppositeType == 'start') ? 'From' : 'To'
                try {
                    tmp = $("#" + id + "-" + type).dxSelectBox("instance").option('value')
                    tmp = ((emptyValues.indexOf(tmp) > -1 ) ? false : tmp)
                    if (tmp) {

                        var fieldName = Labels.find(function (item) {
                            return item.id == id
                        }).name

                        $("#" + id + "-" + oppositeType).dxValidator({
                            validationRules: [{
                                type: 'required',
                                message: fieldName + " (" + oppositeTypeNameField + ') is required'
                            }]
                        });
                    } else {
                        $("#" + id + "-" + type).dxSelectBox('instance').option('value', '');
                    }
                } catch (err) {

                }
            })
        })

    }

    $scope.onFormSubmit = function (event) {
        checkDateField()
        var result = event.validationGroup.validate();

        if (!result.isValid) {
            // var firstErrorField = result.brokenRules[0]
            return;
        }

        vm.sendTo()
    };

    $scope.submitButtonOptions = {
        text: 'Search',
        type: 'success',
        onClick: $scope.onFormSubmit
    };

    vm.closeList = function() {
        // var listId = x.Header.List_ID;
        // if (!$localStorage.ftListId) {
        //     $localStorage.ftListId = listId;
        //     return false;
        // } 
        wdService.clearListfromParm($localStorage.ftListId).then(function(res) {
            // $localStorage.ftListId = listId;
        }, function(error) {
            var data = { fileAction: false };
            $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
        });
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


    $scope.customItemTemplate =  function(data) {
        var description = "<div>"+data.pgName+"</div>";
        if(data.pgName.length > 15){
            description =  "<div title='"+data.pgName+"'>"+data.pgName+"</div>";
        }
        return description ;
    }

    $scope.$on("defaultTemp", function(event, data){
        var getTempArray
        var typeOfTemplate;
        $timeout(function() {
            if (data.type === 'FindTemplatesTreePublic') {
                getTempArray = vm.publicTemps;
                typeOfTemplate = "public";
            } else if (data.type === 'FindTemplatesTreeOnlyMe') {
                getTempArray = vm.userTemps;
                typeOfTemplate = "personal";
            } else {
                getTempArray = vm.templates;
                typeOfTemplate = "all";
            }
            
            angular.forEach(getTempArray, function(item, index) {
                if (item.name == data.template) {
                    vm.getTemplateData(item, data.instant, true);
                    if (typeOfTemplate == "personal") {
                        vm.prefillData = "ut";
                        vm.templateType = "User Templates";
                        vm.userTempData = {item: item, instant: data.instant};
                    } else if (typeOfTemplate == "public") {
                        vm.prefillData = "st";
                        vm.templateType = "Global Templates";
                        vm.publicTempData = {item: item, instant: data.instant};
                    } else {
                        vm.prefillData = "all";
                        vm.templateType = "All Templates";
                        vm.templatesData = {item: item, instant: data.instant};
                    }
                    return false;
                }
            });
        }, 1000);
    });


    //SetTemplate when to many results
    $rootScope.$on("searchPanel", function (event, data) {
        if (data.flag == true) {
            vm.getTemplateList(true);
            vm.prefillData = 'all';
            vm.templateType = 'Default';
            var getMessage = data.message.split('.')[0];
            var cabinetFields = [];
            vm.isTemplate = false;
            vm.defaultMessage = getMessage + ", please narrow down your search.";
            
            if (query.query.indexOf("?t") !== -1){
                var data = query.query.split("?t ")[1];
                $scope.field.field17 = data;
            }

            if (query.query.indexOf("?t") == -1) {
                $scope.field.field1 = query.query;
            }
        }
        $scope.$broadcast('setTemplates');
    });

    vm.filterLabelTable = function(){
        vm.fieldTableSpin = false;
        $timeout(function(){
            vm.fieldTableSpin = true;
        }, 1000)
    }

    vm.getMultiCabinet = {
        bindingOptions: {
            dataSource: "cabinetList",
            value: "gridBoxValue"
        },
        valueExpr: "pgFields",
        displayExpr: "pgName",
        placeholder: "Select a cabinet...",
        onValueChanged: function (e) {
            // $scope.gridBoxValue = e.value || [];
            $scope.gridBoxValue = e.value;
            setTimeout(function(){
                $scope.dateValueChanged();
            }, -1)
        },
        multiList: {
            bindingOptions: {
                dataSource: "cabinetList",
                "selectedRowKeys": "gridBoxValue"
            },
            keyExpr: "pgFields",
            columns: [{dataField: "pgName", caption: "Cabinets"}],
            // showColumnHeaders: false,
            selection: {mode: "multiple", showCheckBoxesMode: "always"},
            height: 200,
            paging: {
                pageSize: 255
            },
            elementAttr: {'id': 'popupformtest'},
            onSelectionChanged: function(e){
                var setPg = "";
                angular.forEach(e.selectedRowsData, function(key, idx) {
                    if (idx === (e.selectedRowsData.length - 1)){ 
                        setPg += key.pgID;
                    } else {
                        setPg += key.pgID + ',';
                    }
                });

                wdService.setPgFields(setPg).then(function(res){
                    vm.setWdPgFields(res);
                }, function(error) {
                    var data = { fileAction: false };
                    $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
                });
                $scope.gridBoxValue = e.selectedRowKeys;
            }
        }
    }
   
    vm.setWdPgFields = function(x) {
        var setCabinetResponse = x.data.root;
        var items = setCabinetResponse.items[0];
        if (setCabinetResponse.Header.ErrorCount !== "") {
            var wddata = { fileAction: false };
            $rootScope.$broadcast("errorAction", {visible: true, rctx: setCabinetResponse.Header.wd_Error_RCTX, data: wddata});
            return false;
        }

        angular.forEach(items.Fields, function(key, idx) {
            var addIdx = parseInt(1) + idx;
            if(key.ACTIVE == 0) {
                vm.showPgFields["field" + addIdx] = false;
                $scope.fieldData["field" + addIdx].placeholder = "";
            } else {
                vm.showPgFields["field" + addIdx] = true;
                $scope.fieldData["field" + addIdx].placeholder = key.NAME;
            }
            vm.typePgFields["field" + addIdx] = key.MMDDYY;
        });
    }

    vm.getCabinetName = function () {
        var ul = document.createElement("ul");
        var span = document.createElement("span");
        var container = document.createElement("div");
        ul.classList.add('tipList');
        span.innerHTML = "<b>Multiple Cabinets</b> <br/>"
        for (var i = 0; i < vm.pgName.length; i++) {
            var li = document.createElement("li");
            li.innerHTML = "<span class='ms-Icon ms-Icon--NavigateBackMirrored'></span>&nbsp;&nbsp;" + vm.pgName[i];
            ul.appendChild(li);
        }
        container.appendChild(span);
        container.appendChild(ul);
        return container.outerHTML;
    }

    vm.showFields = {
        "field1": true,
        "field2": true,
        "field9": true,
        "field4": true,
        "field23": true,
        "field17": true,
        "field19": true,
        "field10": true,
        "field11": true,
        "field12": true,
        "field13": true,
        "field14": true,
        "field15": true,
        "field16": true,
        "field8": true,
        "field37": true,
        "field38": true,
        "field39": true,
        "field40": true,
        "field41": true,
        "field46": true,
    };
    vm.formTitle = "Search...";

    vm.searchFt = function () {
        vm.fieldListData = "";
        vm.fieldTableSpin = false;
        $timeout(function () {
            vm.listTable(false, true);
        }, 1000);
    }
    vm.dateBoxUl1 = {
        dateFormat: {
            type: 'date'
        },
        width: '300'
    }

    vm.dateBoxUl2 = {
        dateFormat: {
            type: 'date'
        },
        width: '300'
    }

    vm.dateBoxUl3 = {
        dateFormat: {
            type: 'date'
        },
        width: '300'
    }
    vm.dateBoxUl4 = {
        dateFormat: {
            type: 'date'
        },
        width: '300'
    }

    vm.dateBoxUl5 = {
        dateFormat: {
            type: 'date'
        },
        width: '300'
    }

    vm.dateBoxUl6 = {
        dateFormat: {
            type: 'date'
        },
        width: '300'
    }

    vm.dateBoxUl7 = {
        dateFormat: {
            type: 'date'
        },
        width: '300'
    }
    vm.showPgFields = {};
    vm.typePgFields = {"field1": 0, "field2": 0, "field3": 0, "field4": 0, "field5": 0, "field6": 0, "field7": 0};
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
            if(vm.typePgFields["field"+i] == 1 && vm.showPgFields["field" + i]!= ""){
                $("#fieldDesc"+i).dxDateBox('instance').option('width', 200);
                $("#fieldDesc"+i).dxDateBox('instance').option('placeholder', "MM/DD/YY");
                switch (i) {
                    case 1:
                        $("#fieldDesc"+i).dxDateBox('instance').option('onValueChanged', function(e){
                            $scope.field.field1 = $scope.convertTime(e.value);
                        });
                        break;
                    case 2:
                        $("#fieldDesc"+i).dxDateBox('instance').option('onValueChanged', function(e){
                            $scope.field.field2 = $scope.convertTime(e.value);
                        });
                        break;
                    case 3:
                        $("#fieldDesc"+i).dxDateBox('instance').option('onValueChanged', function(e){
                            $scope.field.field3 = $scope.convertTime(e.value);
                        });
                        break;
                    case 4:
                        $("#fieldDesc"+i).dxDateBox('instance').option('onValueChanged', function(e){
                            $scope.field.field4 = $scope.convertTime(e.value);
                        });
                        break;
                    case 5:
                        $("#fieldDesc"+i).dxDateBox('instance').option('onValueChanged', function(e){
                            $scope.field.field5 = $scope.convertTime(e.value);
                        });
                        break;
                    case 6:
                        $("#fieldDesc"+i).dxDateBox('instance').option('onValueChanged', function(e){
                            $scope.field.field6 = $scope.convertTime(e.value);
                        });
                        break;
                    case 7:
                        $("#fieldDesc"+i).dxDateBox('instance').option('onValueChanged', function(e){
                            $scope.field.field7 = $scope.convertTime(e.value);
                        });
                        break;
                }
            }
        }
    }

    $scope.setDateField = function(){
        for (var i = 1; i <= 7; i++) {
            if(vm.typePgFields["field"+i] == 1 && vm.showPgFields["field" + i]!= ""){
                $("#fieldDesc"+i).dxDateBox('instance').option('width', 200);
                $("#fieldDesc"+i).dxDateBox('instance').option('placeholder', "MM/DD/YY");
                switch (i) {
                    case 1:
                        $scope.field.field1 = $scope.convertTime($("#fieldDesc"+i).dxDateBox('instance').option('value'));
                        break;
                    case 2:
                        $scope.field.field2 = $scope.convertTime($("#fieldDesc"+i).dxDateBox('instance').option('value'));
                        break;
                    case 3:
                        $scope.field.field3 = $scope.convertTime($("#fieldDesc"+i).dxDateBox('instance').option('value'));
                        break;
                    case 4:
                        $scope.field.field4 = $scope.convertTime($("#fieldDesc"+i).dxDateBox('instance').option('value'));
                        break;
                    case 5:
                        $scope.field.field5 = $scope.convertTime($("#fieldDesc"+i).dxDateBox('instance').option('value'));
                        break;
                    case 6:
                        $scope.field.field6 = $scope.convertTime($("#fieldDesc"+i).dxDateBox('instance').option('value'));
                        break;
                    case 7:
                        $scope.field.field7 = $scope.convertTime($("#fieldDesc"+i).dxDateBox('instance').option('value'));
                        break;
                }

            }
        }
    }
    $scope.cabinetList = [];
    $scope.fieldDesc = {
        "field1": "",
        "field2": "",
        "field3": "",
        "field4": "",
        "field5": "",
        "field6": "",
        "field7": ""
    }
    $scope.field = {
        "field1": "",
        "field2": "",
        "field4": {
            "start": "",
            "end": ""
        },
        "field9": {
            "start": "",
            "end": ""
        },
        "field23": {
            "start": "",
            "end": ""
        },
        "field17": "",
        "field10": "",
        "field11": "",
        "field12": "",
        "field13": "",
        "field14": "",
        "field15": "",
        "field16": "",
        "field8": "",
        "field37": "",
        "field38": "",
        "field39": "",
        "field40": "",
        "field41": {
            "start": "",
            "end": ""
        },
        "field46": ""
    };

    vm.setTabName = function(x) {
        vm.prefillData = x;
        if (x == "all") {
            vm.templateType = "All Templates";
        } else if (x == "ut") {
            vm.templateType = "User Templates";
        } else {
            vm.templateType = "Global Templates";
        }
    }

    vm.contextTabTemplate = function(e, y, z, xn) {
        
        var result = {
            target: '#' + e,
            dataSource: $scope.contextualItems,
            width: 200,
            onItemClick: function(data) {
                vm.wdTemplateType = xn;
                vm.setTabName(z);
                vm.setDefaultKey("FindTemplatesList", y, "DefaultTab", 1 , true);
            }
        }
        return result;
    } 

    vm.contextMenuTemplate = function(e) {
        var result = {
            target: '#' + e.Index,
            dataSource: $scope.contextualItems,
            width: 200,
            onItemClick: function(data) {
                var wdSection = "FindTemplatesList";
                var wdTemplateName = e.name;
                var favType = "";
                switch (vm.prefillData) {
                    case 'st' :
                        favType = "FindTemplatesTreePublic";
                        break;
                    case 'ut' :
                        favType = "FindTemplatesTreeOnlyMe";
                        break;
                    case 'all' :
                        favType = "FindTemplatesTree";
                        break;                    

                }
                vm.setDefaultKey(wdSection, wdTemplateName, favType, 1, false);
            }
        };
        return result;
    }

    vm.setDefaultKey = function(n, x, y, z, xn) {
        leftNavService.iniDataSet(n, x, y, z).then(function(res) {
            var setIni = res.data.root;
            if (setIni.Header.ErrorCount != "") {
                var wddata = { fileAction: false };
                $rootScope.$broadcast("errorAction", {visible: true, rctx: setIni.Header.wd_Error_RCTX, data: wddata});
                return false;
            }

            if (!xn) {
                vm.setNewDefault(y, x);
                return false;
            }
            vm.getDefaultTemplate(x);
        }, function(error) {
            var data = { fileAction: false };
            $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
        })
    }

    vm.resetTemplate = function(id, name) {
        vm.showTempleLoader = true;
        wdService.getTemplate(id).then(function (res) {
            var getTempData = res.data.root;
            if (getTempData.Header.ErrorCount != "") {
                var wddata = { fileAction: false };
                $rootScope.$broadcast("errorAction", {visible: true, rctx: getTempData.Header.wd_Error_RCTX, data: wddata});
                vm.showTempleLoader = false;
                return false
            }
            vm.templates = getTempData.items;
            angular.forEach(vm.templates, function(key, idx) {
                if (key.name == name) {
                    vm.getTemplateData(key, true, true);
                };
            });
            vm.setNewDefault(vm.wdTemplateType, name);
            vm.showTempleLoader = false;
        }, function (error) {
            vm.showTempleLoader = false;
            var data = { fileAction: false };
            $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
        });
    }

    vm.setNewDefault = function(e, y) {
        var setTemplateIcon = [];
        angular.forEach(vm.templates, function(item, index) {
            if(item.default == true) {
                item.default = !item.default;
            }

            if (item.name == y) {
                item.default = !item.default;
            }
        })
    }

    vm.startDate = homeService.getStart();
    vm.endDate = homeService.getEnd();
    vm.fields = {
        "field1": {"value": ""},
        "field2": {"value": ""},
        "field3": {"value": ""},
        "field4": {"value": ""},
        "field5": {"value": ""},
        "field6": {"value": ""},
        "field7": {"value": ""}
    };

    vm.init = function () {
        $scope.listFields;
        vm.fieldSpin = true;
        //vm.prefillData = 'st';
        vm.templateType = 'Global Templates';
        vm.uploadToolBar = [
            {location: 'before', text: 'Advanced Search'}
        ];

        $scope.fieldData = {
            "name": {
                "placeholder": "Description"
            },
            "docId": {
                "placeholder": "Doc Id"
            },
            "owner": {
                "placeholder": "Owner"
            },
            "created": {
                "placeholder": "Date Created"
            },
            "modified": {
                "placeholder": "Date Modified"
            },
            "accessed": {
                "placeholder": "Date Accessed"
            },
            "text": {
                "placeholder": "Text in file"
            },
            "cabinet": {
                "value": "",
                "placeholder": "Cabinets"
            },
            "field1": {
                "placeholder": "Field1"
            },
            "field2": {
                "placeholder": "Field2"
            },
            "field3": {
                "placeholder": "Field3"
            },
            "field4": {
                "placeholder": "Field4"
            },
            "field5": {
                "placeholder": "Field5"
            },
            "field6": {
                "placeholder": "Field6"
            },
            "field7": {
                "placeholder": "Field7"
            },
            "tags": {
                "placeholder": "Tags"
            },
            "searchWhat": {
                "placeholder": "Search What"
            },
            "from": {
                "placeholder": "Email From"
            },
            "to": {
                "placeholder": "Email To"
            },
            "cc": {
                "placeholder": "Email CC"
            },
            "bcc": {
                "placeholder": "Email BCC"
            },
            "sent": {
                "placeholder": "Email Sent"
            },
            "addr": {
                "placeholder": "Email Addr"
            }
        }


        $timeout(function () {
            angular.element(document).ready(function () {
                var SpinnerElements = document.querySelectorAll(".ms-Spinner");
                for (var i = 0; i < SpinnerElements.length; i++) {
                    new fabric['Spinner'](SpinnerElements[i]);
                }
            });
        }, 1000);

    }

    

    // vm.cabinetList = {
    //     bindingOptions: { 
    //         value: 'fieldData.cabinet.value', 
             
    //     },
    //     dataSource: 'cabinetLists', 
    //     searchEnabled: true,
    //     valueExpr: 'pgFields', 
    //     displayExpr: 'pgName',
    //     placeholder: 'fieldData.cabinet.placeholder'
    // }

    vm.wdButtons = function (x, y, z, n) {
        vm.showTempleLoader = true;
        $scope.textValue = "";
        if($( window ).width()<=767){
            $("#phxTemplate .nav-save").css({'display':'block','width':'100%', 'border-right':'0px'});
            $("#phxTemplate .saveForm").css({'display':'none', 'width':'0%'});
        }
        
        vm.prefillData = x;
        vm.templateType = y;
        vm.selectedField = 0;
        vm.autoFilter = "";
        vm.checkFt = false;
        vm.setType = true;
        vm.getListFromWdBtn(false, z, vm.defaultList, n);
    };



    vm.getTemplateData = function(x, y, z) {
        vm.wdTempFields = x.Fields;
        vm.formTitle = x.name;
        vm.isTemplate = true;
        $scope.field = {
            "field1": "",
            "field2": "",
            "field4": {
                "start": "",
                "end": ""
            },
            "field9": {
                "start": "",
                "end": ""
            },
            "field23": {
                "start": "",
                "end": ""
            },
            "field17": "",
            "field10": "",
            "field11": "",
            "field12": "",
            "field13": "",
            "field14": "",
            "field15": "",
            "field16": "",
            "field8": "",
            "field37": "",
            "field38": "",
            "field39": "",
            "field40": "",
            "field41": "",
            "field46": ""
        };
        vm.templateName = x.name;
        vm.showFields = {
            "field1": false,
            "field2": false,
            "field9": false,
            "field4": false,
            "field23": false,
            "field17": false,
            "field19": false,
            "field10": false,
            "field11": false,
            "field12": false,
            "field13": false,
            "field14": false,
            "field15": false,
            "field16": false,
            "field8": false,
            "field37": false,
            "field38": false,
            "field39": false,
            "field40": false,
            "field41": false,
            "field46": false,
        };
        setTimeout(function(){
            $scope.setDateField();
        }, -1)
        if ($rootScope.searchEdit) {
            var getTemplate = $rootScope.bmTemplateData.Loc;
            var tempName = getTemplate.split("?@")[1];
            angular.forEach(vm.templates, function(key, idx) {
                if (key.name == tempName) {
                    vm.selected = key;
                }
            });
            angular.forEach(vm.wdTempFields, function(key, index) {
                vm.showFields["field" + key.EID] = true;
                if (key.EID == "9" || key.EID == "4" || key.EID == "23" || key.EID == "41") {
                    var dates = key.DEF.split('.');
                    $scope.field['field' + key.EID].start = dates[0] + '.' + dates[1]; 
                    $scope.field['field' + key.EID].end = '.' + dates[2] + '.' + dates[3]; 
                } else if (key.EID == "19") {
                    angular.forEach(getTemplate.split('?'), function(k, i){
                        if (k.indexOf("G ") !== -1) {
                            var pgListId = (k.split("G ")[1].match(/;/g) || []).length;
                            vm.setCabinet(pgListId, x, k.split("G ")[1]);
                            return false;
                        }
                    });
                    
                } else {
                    $scope.field['field' + key.EID] = key.DEF;
                }

            });
            $rootScope.searchEdit = false;
            return false;
        } else {
            // vm.wdTempFields = x.Fields;
            vm.selected = x;
            // vm.formTitle = x.name;
            // vm.isTemplate = true;
            // $scope.field = {
            //     "field1": "",
            //     "field2": "",
            //     "field4": {
            //         "start": "",
            //         "end": ""
            //     },
            //     "field9": {
            //         "start": "",
            //         "end": ""
            //     },
            //     "field23": {
            //         "start": "",
            //         "end": ""
            //     },
            //     "field17": "",
            //     "field10": "",
            //     "field11": "",
            //     "field12": "",
            //     "field13": "",
            //     "field14": "",
            //     "field15": "",
            //     "field16": "",
            //     "field8": "",
            //     "field37": "",
            //     "field38": "",
            //     "field39": "",
            //     "field40": "",
            //     "field41": "",
            //     "field46": ""
            // };
            // vm.templateName = x.name;
            // vm.showFields = {
            //     "field1": false,
            //     "field2": false,
            //     "field9": false,
            //     "field4": false,
            //     "field23": false,
            //     "field17": false,
            //     "field19": false,
            //     "field10": false,
            //     "field11": false,
            //     "field12": false,
            //     "field13": false,
            //     "field14": false,
            //     "field15": false,
            //     "field16": false,
            //     "field8": false,
            //     "field37": false,
            //     "field38": false,
            //     "field39": false,
            //     "field40": false,
            //     "field41": false,
            //     "field46": false,
            // };
            vm.fieldSpin = false;
            vm.selected = x;

            if (x.bGO == "0" || y == false || x.name == "Quick Access" || x.bGO == "1" && z == true){
                if($( window ).width()<=767) {
                    $("#phxTemplate .nav-save").css({'display':'none','width': '0%'});
                    $("#phxTemplate .saveForm").css({'display':'block','width': '100%'});
                }
                angular.forEach(vm.wdTempFields, function(key, index) {
                    vm.showFields["field" + key.EID] = true;
                    if (key.EID == "9" || key.EID == "4" || key.EID == "23" || key.EID == "41") {
                        var dates = key.DEF.split('.');
                        console.log(dates);
                        $scope.field['field' + key.EID].start = dates[0] + '.' + dates[1]; 
                        $scope.field['field' + key.EID].end = '.' + dates[2] + '.' + dates[3]; 
                    } else if (key.EID == "19") {
                        var pgListId = (key.DEF.match(/;/g) || []).length;
                        vm.setCabinet(pgListId, x, key.DEF);
                    } else {
                        $scope.field['field' + key.EID] = key.DEF;
                    }

                });
                return false;
            } else if (x.bGO == "1" && z == false) {
                $location.path('/home').search({query: "?@ " + x.name}); 
            }
        }   

    }

    vm.setCabinet = function(x, y, z) {
        var cabinetValue = [];
        if (x == 0) {
            console.log(y);
            var xn = vm.setPgFields(y);
            cabinetValue.push(z + "|" + xn);
            vm.setPgFieldValue(cabinetValue);
            vm.setfieldLabelPlaceholder();
        } else {
            var listedPg = z.split(';');
            vm.setPgFields(y);
            angular.forEach(listedPg, function (pgKey, pgIndex) {
                angular.forEach($scope.cabinetList, function (key, index) {
                    if (key.pgID === pgKey) {
                        cabinetValue.push(key.pgFields);
                    }
                });
            });
            vm.setPgFieldValue(cabinetValue);
            vm.setfieldLabelPlaceholder();
        }
    }

    vm.setPgFieldValue = function(x) {
        var setPgField = $("#wdMultiCabinet").dxDropDownBox("instance");

        if ($rootScope.wdTempCabinet) {
            //$scope.gridBoxValue = setPgField.option("value");
            $scope.gridBoxValue = $rootScope.tempPgList;
            $rootScope.wdTempCabinet = false
            return false
        }
        
        if (setPgField == undefined) {
            $scope.gridBoxValue = x;
        } else {
            setPgField.option("value", x);
        }

    }

    vm.setPgFields = function(x) {
        var pgFieldsData = angular.copy(x.Fields);
        vm.setpgFieldData = {};
        vm.setCabinetValue = {};
        
        angular.forEach(pgFieldsData, function(key, index) {
            if (key.EID == "10" || key.EID == "11" || key.EID == "12" || key.EID == "13" || key.EID == "14" || key.EID == "15" || key.EID == "16") {
                vm.setpgFieldData['field' + key.EID] = true;
                vm.setCabinetValue['field' + key.EID] = key.LAB
            }
        });

        for(var i = 10; i <= 16; i++) {
            if (vm.setpgFieldData["field" + i.toString()] == undefined) {
                vm.setpgFieldData['field' + i.toString()] = false;
                vm.setCabinetValue['field' + i.toString()] = "";
            }
        }

        vm.showPgFields = {
            field1: vm.setpgFieldData.field10,
            field2: vm.setpgFieldData.field11,
            field3: vm.setpgFieldData.field12,
            field4: vm.setpgFieldData.field13,
            field5: vm.setpgFieldData.field14,
            field6: vm.setpgFieldData.field15,
            field7: vm.setpgFieldData.field16
        }

        var pgf = vm.setCabinetValue.field10 + "|" + vm.setCabinetValue.field11 + "|" + vm.setCabinetValue.field12 + "|" + vm.setCabinetValue.field13 + "|" + vm.setCabinetValue.field14 + "|" + vm.setCabinetValue.field15 + "|" + vm.setCabinetValue.field16 + "|" 
        return pgf

    }

    vm.setfieldLabelPlaceholder = function() {
        for(var i = 10, xn = 1; i <= 16, xn < 7; i++, xn++) {
            $scope.fieldData["field" + xn].placeholder = vm.setCabinetValue["field" + i]
        }
    }


    vm.getActiveFields = function (x) {
        $scope.gridBoxValue = x;
        var matches = [];
        var result = [];
        var n = x.length;

        for (var i = 0; i < n; i++) {
            var splitted = x[i].split('|');
            for (var j = 0; j < splitted.length; j++) {
                if (matches[j]) {
                    if (matches[j].word === splitted[j]) {
                        matches[j].count++;
                    }
                } else {
                    matches[j] = {};
                    matches[j].word = splitted[j];
                    matches[j].count = 1;
                }
            }
        }

        for (var i = 0; i < matches.length; i++) {
            if (matches[i].count === n) {
                result[i] = matches[i].word;
            } else {
                result[i] = "";
            }
        }

        result.shift();
        result.pop();
        vm.showField(result);
    }

    vm.showField = function(x) {
        for(var i = 0;  i < x.length; i++) {
            var add = parseInt([i]) + parseInt(1);
            if(x[i] != "") {
                vm.showPgFields["field" + add] = x[i];
                $scope.fieldData["field" + add].placeholder = x[i];
            } else {
                vm.showPgFields["field" + add] = "";
            } 
        }
        if (x.length == 0) {
            vm.showPgFields = {
                "field1": "",
                "field2": "",
                "field3": "",
                "field4": "",
                "field5": "",
                "field6": "",
                "field7": "",
            }
        }
    }

    vm.isActive = function (x) {
        return vm.selected === x;
    }

    vm.multiCabinet = function (x) {
        for (var i = 0; i < $scope.cabinetList.length; i++) {
            if (x == $scope.cabinetList[i].pgID) {
                fieldArray.push($scope.cabinetList[i].pgFields.split('|'));
            }
        }
    }

    vm.getFieldsDesc = function (x) {
        var getField = x.element[0].id.split('fieldDesc')[1];
        wdService.getFieldDesTemp($scope.fieldData.cabinet.value.split('|')[0], $scope.field, getField).then(function (res) {
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
        }, function (error) {
            var data = { fileAction: false };
            $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
        });
    }

    vm.checkValue = function (x) {
        var getValue = "";
        if (x.Filter != " ") {
            getValue = x.Filter;
        }
        return getValue;
    }
    $scope.displayDateValue = function(){
        var scr_elm = $("#phxUpload .saveForm .dx-scrollview-content");
        if((scr_elm.width()-270)<=125){
            $('.lbl-option-detail').hide();
        }else{
            $('.lbl-option-detail').show();
        }
    }
    window.onresize = function() {
        $scope.displayDateValue();
    }


    vm.changeDate = function (x) {
        $scope.displayDateValue();
        var getId = x.element[0].id.split('-');
        if(x.element[0].id == '9-start') {
            vm.startDate.forEach(function(item){
                if(item.value == x.value){
                    $('#created-from').html(item.date);
                }
            })
        }
        if(x.element[0].id == '9-end') {
            vm.endDate.forEach(function(item){
                if(item.value == x.value){
                    $('#created-to').html(item.date);
                }
            })
        }
        if(x.element[0].id == '4-start') {
            vm.startDate.forEach(function(item){
                if(item.value == x.value){
                    $('#modified-from').html(item.date);
                }
            })
        }
        if(x.element[0].id == '4-end') {
            vm.endDate.forEach(function(item){
                if(item.value == x.value){
                    $('#modified-to').html(item.date);
                }
            })
        }
        if(x.element[0].id == '23-start') {
            vm.startDate.forEach(function(item){
                if(item.value == x.value){
                    $('#accessed-from').html(item.date);
                }
            })
        }
        if(x.element[0].id == '23-end') {
            vm.endDate.forEach(function(item){
                if(item.value == x.value){
                    $('#accessed-to').html(item.date);
                }
            })
        }
        if (getId[1] == 'start') {
            $scope.field['field' + getId[0]].start = x.value;
            return false;
        }

        $scope.field['field' + getId[0]].end = x.value;
    }

    vm.getTables = function (x, y) {
        var wdFilter = $("#wdFilterTemplate").dxTextBox("instance");
        wdFilter.option("value", "");
        vm.fieldListData = [];
        vm.prefillData = '';
        vm.total = "";
        vm.ftCount = "";
        vm.selectedField = x;
        vm.templateType = y;
        vm.autoFilter = "";
        vm.maxcount = 500;
        vm.indexFr = 0;
        vm.pgCabinetID = ""

        if ($localStorage.ftListId) {
            vm.closeList();
        }
        
        if($scope.gridBoxValue.length == 1) {
            vm.prefillData = 'ft';
            vm.checkFt = true;
            vm.fieldTableSpin = false;
            $timeout(function () {
                vm.pgCabinetID = $scope.gridBoxValue[0].split("|")[0];
                vm.listTable(false, false);
            }, 1000);
            
        } else {
            angular.forEach($scope.cabinetList, function(key, index) {
                angular.forEach($scope.gridBoxValue, function(keyID, indexID) {
                    if (key.pgID == keyID.split('|')[0]) {
                        key.text = key.pgName;
                        $scope.selectedpg.push(key);
                    }
                });
            });
            $("#wdMenu" + x).dxContextMenu("instance").show();
        }
    }

    vm.selectCabinet = function(x) {
        var result = { 
            target:'#wdMenu' + x,
            bindingOptions: {
                dataSource: "selectedpg",
                //visible: "isContextMenuVisible"
                //deep: true,
                //dataPath: 'selectedpg'
            },
            width: 200, 
            onItemClick: function(e) {
                $scope.selectedpg = [];
                vm.prefillData = 'ft';
                vm.checkFt = true;
                vm.pgCabinetID = e.itemData.pgID;
                vm.listTable(false, false);
            },
            onHidden: function(e) {
                $scope.selectedpg = [];
            }
          };
         return result;
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


    vm.listTable = function (x, y) {
        for (var i = 1, w = 10; i <= 7; i++, w++) {
            vm.fields["field" + [i]].value = $scope.field["field" + [w]];
        }
        wdService.fieldTables(vm.pgCabinetID, vm.fields, vm.selectedField, vm.maxcount, vm.indexFr, y, $scope.textValue).then(function (res) {
            var wdFilter = $("#wdFilterTemplate").dxTextBox("instance"),
            wdFilterValue = wdFilter.option("value");
            vm.listlength = res.data.root.FieldTbl.length;

            if (wdFilterValue == "") {
                vm.total = res.data.root.Header.ListCount;
            } else {
                vm.total = res.data.root.FieldTbl.length
            }

            if (res.data.root.Header.ErrorCount != "") {
                vm.chkError(res.data.root.Header);
                return false;
            }

            $localStorage.ftListId = res.data.root.Header.List_ID;
            //vm.closeList(res.data.root);

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
            $timeout(function() {
                vm.fieldTableSpin = true;
            }, 1000);
        }, function (error) {
            var data = { fileAction: false };
            $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
        });
    }

    vm.getToolTip = function (x) {
        var getAllFields = "";
        for (i = 1; i <= 7; i++) {
            if (x["f" + i + "n"]) {
                getAllFields += getAllFields = x["f" + i + "n"] + ' - ' + x["f" + i + "d"] + ' | ';
            }
        }
        return getAllFields.substring(0, getAllFields.length - 2);
    }

    vm.loadMore = {
        text: "Load More",
        type: "success",
        useSubmitBehavior: false,
        onClick: function () {
            vm.indexFr = +vm.indexFr + (vm.maxcount + 1);
            vm.listTable(true, false);
        }
    }

    vm.setField = function (x) {
        vm.selected = x;
        for (var i = 1, w = 10; i <= 7; i++, w++) {
            if (x["f" + i + "n"]) {
                $scope.field["field" + [w]] = x["f" + i + "n"].replace(/<[^>]+>/gm, '');;
                $scope.fieldDesc["field" + [i]] = x["f" + i + "d"].replace(/<[^>]+>/gm, '');;
            }
        }
        vm.autoSearch = "";
        vm.autoFilter = "";
    }

    vm.setSelected = function(x) {
        vm.selected = x;
    }


    vm.sendTo = function() {
        var tempTitle = "";
        var pgIDList = [];
        var subData = [];
        $rootScope.searchTemplateType = true;

        angular.forEach($scope.gridBoxValue, function(key, index) {
            var keyId = key.split("|")[0];
            pgIDList.push(keyId);
        });
        $rootScope.wdTempCabinet = true;
        $rootScope.tempPgList = angular.copy($scope.gridBoxValue);

        if (!vm.isTemplate) {
            vm.templateName = $location.search().query;
        } else {
            tempTitle = "Template Name: " + vm.templateName
        }
        subData.push(vm.templateName);
        $localStorage.templateName = vm.templateName;
        // homeService.setTitle({"path": tempTitle, "flag": "template", "name": "" });
        $location.path('/home').search({xName: $scope.field.field1, fName: $scope.field.field2, access: $scope.field.field23.start + $scope.field.field23.end, create: $scope.field.field9.start + $scope.field.field9.end, modified: $scope.field.field4.start + $scope.field.field4.end, text: $scope.field.field17, field1: $scope.field.field10, field2: $scope.field.field11, field3: $scope.field.field12, field4: $scope.field.field13, field5: $scope.field.field14, field6: $scope.field.field15, field7: $scope.field.field16, cabinet: pgIDList.toString(), typeid: "template", temp: vm.templateName, id: Date.now()})
    }


}]).factory('template', function (wdService) {
    var accessFields = [
        {
            itemType: "group",
            items: [
                {
                    dataField: "Name",
                    visible: false,
                    editorOptions: {
                        placeholder: 'Name',
                        width: '100%'
                    }
                },
                {
                    dataField: "Doc Id",
                    visible: false,
                    editorOptions: {
                        placeholder: 'Doc Id',
                        width: '100%'
                    }
                },
                {
                    dataField: "Date Created",
                    visible: false,
                    editorOptions: {
                        placeholder: 'Date Created',
                        width: '100%'
                    }
                },
                {
                    dataField: "Date Modified",
                    visible: false,
                    editorOptions: {
                        placeholder: 'Date Modified',
                        width: '100%'
                    }
                },
                {
                    dataField: "Date Accessed",
                    visible: false,
                    editorOptions: {
                        placeholder: 'Date Accessed',
                        width: '100%'
                    }
                },
                {
                    dataField: "Text in File",
                    visible: false,
                    editorOptions: {
                        placeholder: 'Text in File',
                        width: '100%'
                    }
                },
                {
                    dataField: "Cabinets",
                    visible: false,
                    editorType: "dxSelectBox",
                    editorOptions: {
                        dataSource: cabinetList,
                        valueExpr: 'pgFields',
                        displayExpr: "pgName",
                    }
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
                    visible: false,
                    editorOptions: {
                        placeholder: 'Field2',
                        width: '100%'
                    }
                },
                {
                    dataField: "Field3",
                    visible: false,
                    editorOptions: {
                        placeholder: 'Field3',
                        width: '100%'
                    }
                },
                {
                    dataField: "Field4",
                    visible: false,
                    editorOptions: {
                        placeholder: 'Field4',
                        width: '100%'
                    }
                },
                {
                    dataField: "Field5",
                    visible: false,
                    editorOptions: {
                        placeholder: 'Field5',
                        width: '100%'
                    }
                },
                {
                    dataField: "Field6",
                    visible: false,
                    editorOptions: {
                        placeholder: 'Field6',
                        width: '100%'
                    }
                },
                {
                    dataField: "Field7",
                    visible: false,
                    editorOptions: {
                        placeholder: 'Field7',
                        width: '100%'
                    }
                },
                {
                    dataField: "Tags",
                    visible: false,
                    editorOptions: {
                        placeholder: 'Tags',
                        width: '100%'
                    }
                },
                {
                    dataField: "Search What",
                    visible: false,
                    editorOptions: {
                        placeholder: 'Search What',
                        width: '100%'
                    }
                },
                {
                    dataField: "Owner",
                    visible: false,
                    editorOptions: {
                        placeholder: 'Owner',
                        width: '100%'
                    }
                },
                {
                    dataField: "Email From",
                    visible: false,
                    editorOptions: {
                        placeholder: 'Email From',
                        width: '100%'
                    }
                },
                {
                    dataField: "Email To",
                    visible: false,
                    editorOptions: {
                        placeholder: 'Email To',
                        width: '100%'
                    }
                },
                {
                    dataField: "Email CC",
                    visible: false,
                    editorOptions: {
                        placeholder: 'Email CC',
                        width: '100%'
                    }
                },
                {
                    dataField: "Email BCC",
                    visible: false,
                    editorOptions: {
                        placeholder: 'Email BCC',
                        width: '100%'
                    }
                },
                {
                    dataField: "Email Sent",
                    visible: false,
                    editorOptions: {
                        placeholder: 'Email Sent',
                        width: '100%'
                    }
                },
                {
                    dataField: "Email Addr",
                    visible: false,
                    editorOptions: {
                        placeholder: 'Email Addr',
                        width: '100%'
                    }
                }
            ],
        }
    ];

    return {
        tempFields: tempFields
    }

    function tempFields() {
        return accessFields;
    };
})
