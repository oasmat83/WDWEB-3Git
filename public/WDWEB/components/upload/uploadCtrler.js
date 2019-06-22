angular.module('WDWeb').controller("uploadCtrler", ['$scope', '$rootScope', '$route', '$routeParams', '$timeout', '$log', '$window', '$localStorage', '$location', 'uploader', 'wdService', 'homeService', 'fileListUI', function($scope, $rootScope, $route, $routeParams, $timeout, $log, $window, $localStorage, $location, uploader, wdService, homeService, fileListUI){
    var vm = this;
    vm.checkFt = false;
    vm.moreTables = false;
    $scope.cabinetList = [];
    $scope.getcabinetList = [];
    vm.uploadInc = true;
    $scope.accept = "*";
    $scope.value = [];
    $scope.fieldTableSpin = true;
    vm.showPgFields = {"field1": "", "field2": "", "field3": "", "field4": "", "field5": "", "field6": "", "field7": ""};
    vm.typePgFields = {"field1": 0, "field2": 0, "field3": 0, "field4": 0, "field5": 0, "field6": 0, "field7": 0};
    vm.securityList = [ { name: "None", value: "" }, { name: "Hidden", value: 16 }, { name: "Protected", value: 8 } ];
    $scope.listOfTags = [];
    $scope.tagValues = [];
    vm.fieldListData = [];
    $scope.openCats = false;
    $scope.showUploadLoader = true;
    $scope.textValue = "";
    vm.noResults = "";

    angular.element($window).bind('resize', function() {
        var chkLeftUpload = $("#leftUploader").dxScrollView("instance");
        if (chkLeftUpload !== undefined) {
            $("#leftUploader").dxScrollView("instance").option("height", (window.innerHeight - 225));
        };
    });

    $scope.wdFilterBox = {
        placeholder: "Filter",
        elementAttr: {
            id: "wdFilterUpload"
        },
        onEnterKey: function(e) {
            $scope.fieldTableSpin = false;
            $scope.textValue = e.event.target.value;
            vm.noResults = "";
            if (vm.prefillData == 'ft') {
                vm.searchFt();
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
            var wdFilter = $("#wdFilterUpload").dxTextBox("instance");
            $scope.textValue = wdFilter.option("value");
            vm.noResults = "";
            if (vm.prefillData == 'ft') {
                vm.searchFt();
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
    
    $scope.uploadMode = "instantly";

    $scope.$on('setFavQuick', function(e) {
        $scope.showUploadLoader = true;
        vm.quickProfile = [];
        vm.favMatters = [];
        vm.prefillData ='';
        vm.uploadTitle = "QuickProfile";
        $timeout(function() {
            wdService.getQuickProfile().then(function(res) {
                vm.quickProfile = res.data.root.QuickProfiles;
                vm.prefillData ='qp';
                $scope.showUploadLoader = false;
                vm.selected = res.data.root.QuickProfiles[0];
                $scope.setOverUpload();
            }, function(error){
                var data = { fileAction: false };
                $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
            });
    
            wdService.getFavMatters().then(function(res) {
                vm.favMatters = res.data.root.FavMatters;
                $scope.showUploadLoader = false;
                $scope.setOverUpload();
            }, function(error){
                var data = { fileAction: false };
                $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
            });

        }, 1000);

        wdService.getPgCabinets().then(function(res) {
            var pgList = res.data.root;
            if (pgList.Header.ErrorCount !== "") {
                console.log(pgList.Header.wd_Error_MSG);
                return false
            }
            $scope.uploadData = {
                Cabinets: ""
            }

            for(var xn = 1; xn <= 7; xn++) {
                vm.showPgFields["field" + xn] = false;
                vm.typePgFields["field" + xn] = false;
                $scope.fields["field" + xn].value = "";
            }
            
            $scope.getcabinetList = pgList.items;
        }, function(err) {
            var data = { fileAction: false };
            $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
        });

        // wdService.getCabinetList().then(function(res){
        //     $scope.cabinetList = [];
        //     if (res.data.root.Header.ErrorCount != "") {
        //         console.log(res.data.root.Header.wd_Error_MSG);
        //         return false;
        //     }
        //     for (i = 0; i < res.data.root.Cabinets.length; i++) {
        //         $scope.cabinetList.push(res.data.root.Cabinets[i]);
        //     }
        //     $scope.setOverUpload();
        // }, function(error){
        //     var data = { fileAction: false };
        //     $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
        // });

        $scope.setCategoryList("");
        

    });

    // $scope.pgCabinetId = {
    //     bindingOptions: {
    //         value: "uploadData.Cabinets",
    //         dataSource: "getcabinetList"
    //     },
    //     displayExpr: "Name",
    //     onValueChanged: function(e) {
    //         vm.selectedCabinet(e);
    //     },
    //     itemTemplate: function(data) {
    //         return "<div class='custom-item'>" + data.Name + "</div>";
    //     },
    //     elementAttr: {
    //         id: "uploadPGID"
    //     }
    // }

    $scope.setOverUpload = function(){
        $("#pxpUploadForm").mouseover(function(e){
            $rootScope.checkOverUpload = true;
        });
        $("#pxpUploadForm").mouseout(function(e){
            $rootScope.checkOverUpload = false;
        });
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
            if(vm.typePgFields["field"+i] == 1 && vm.showPgFields["field" + i]!= ""){
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
            if(vm.typePgFields["field"+i] == 1 && vm.showPgFields["field" + i]!= ""){
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

    vm.init = function() {
        $scope.uploadData = {
            "Cabinets": "",
            "Description": "",
            "Security": "",
            "Type": "3",
            'disabled': false
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

        vm.isActive = function(x) {
            return vm.selected === x;
        }

        vm.selectedCabinet = function(e) {
            vm.Cabinets = e.PGID;
            angular.forEach(e.value.Fields, function(key, idx) {
                var addIdx = parseInt(1) + idx;
                if(key.ACTIVE == 0) {
                    vm.showPgFields["field" + addIdx] = false;
                    vm.showPgFields["field" + addIdx] = "";
                } else {
                    vm.showPgFields["field" + addIdx] = true;
                    vm.showPgFields["field" + addIdx] = key.NAME;
                }
                vm.typePgFields["field" + addIdx] = key.MMDDYY;
            });
            if (e.event !== undefined) {
                $scope.fields = { "field1": {"value": ""}, "field2":{"value": ""}, "field3":{"value": ""}, "field4":{"value": ""}, "field5":{"value": ""}, "field6": {"value": ""}, "field7": {"value":""} };
                vm.fieldDesc = { "field1": "", "field2": "", "field3": "", "field4": "", "field5": "", "field6": "", "field7": "" }
            }
            setTimeout(function(){
                $scope.dateValueChanged();
            }, -1)
            // var getFields = e.value.split('|');
            // for(var i = 1;  i <= 7; i++) {
            //     if(getFields[i] != "") {
            //         vm.showPgFields["field" + i] = getFields[i];
            //     } else {
            //         vm.showPgFields["field" + i] = "";
            //     }
            // }
            

            // if (vm.prefillData == "ft") {
            //     var getfirstfield = e.value.split('|');
            //     for(var i = 1;  i <= 7; i++) {
            //         if (getfirstfield[i] !== ""){
            //             vm.getTables(i, getfirstfield[i]);
            //             break;
            //         }
            //     };
            // };
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
            width: '300',
            onValueChanged: function(e) {
                console.log(e);
            }
        }
        vm.dateBoxUl6 = {
            dateFormat: {
                type: 'date'
            },
            width: '300',
            onValueChanged: function(e) {
                console.log(e);
            }
        }
        vm.dateBoxUl7 = {
            dateFormat: {
                type: 'date'
            },
            width: '300',
            onValueChanged: function(e) {
                console.log(e);
            }
        }
        vm.fileFlag = false;

        $timeout(function(){
            angular.element(document).ready(function(){
                var SpinnerElements = document.querySelectorAll(".fieldSpinner");
                for (var i = 0; i < SpinnerElements.length; i++) {
                    new fabric['Spinner'](SpinnerElements[i]);
                }
            });
        }, 0);

        vm.homeService = homeService;

        $scope.$watch('homeService.getMatterList()', function(newVal) {
            vm.favMatters = newVal;
        });

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

        $scope.sendBtn = {
            text: "Upload",
            type: "success",
            onClick: checkField,
            useSubmitBehavior: false
        }
        $scope.submitUpload = {
            text: "",
            type: "",
            useSubmitBehavior: true,
            visible: false
        }


        $scope.securityOpt = {
            bindingOptions: {
                formData: "uploadData",
                readOnly: false,
                showColonAfterLabel: true,
                showValidationSummary: false,
                colCount: 1,
            },
            items: uploader.securitySelect()
        }

    }

    vm.setFavMatter = function(e, x) {
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

    vm.closeList = function() {
        //var listId = x.Header.List_ID;
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

    $scope.checkTables = function() {
        var fieldNum = vm.selectedField;
        vm.getTables(fieldNum, $scope.fields["field" + fieldNum].placeholder);
    }

    vm.getTables = function(x, y) {
        var wdFilter = $("#wdFilterUpload").dxTextBox("instance");
        wdFilter.option("value", "");
        vm.total = "";
        vm.ftCount = "";
        $scope.fieldTableSpin = false;
        vm.selectedField = x;
        vm.maxcount = 500;
        vm.indexFr = 0;
        vm.prefillData = '';
        vm.uploadTitle = y;
        $scope.fieldPanel = true;
        vm.autoFilter = "";
        if ($localStorage.ftListId) {
            vm.closeList();
        }
        $timeout(function() {
            vm.checkFt = true;
            vm.prefillData = 'ft';
            vm.fieldListData = [];
            $scope.listTable(false, false);
        }, 1000);
    }

    vm.loadMore = {
        text: "Load More",
        type: "success",
        useSubmitBehavior: false,
        onClick: function() {
            vm.indexFr =+ vm.indexFr + (vm.maxcount + 1);
            $scope.listTable(true, false);
        }
    }

    vm.searchFt = function() {
        $scope.fieldTableSpin = false;
        $timeout(function() {
            vm.fieldListData = [];
            $scope.listTable(false, true);
        },1000);
    }

    vm.chkError = function(err) {
        if (err.wd_Error_MSG == "WDRC_ZERO_FIELDS_CLEAN") {
            vm.noResults = "Your filter has no results."
            $timeout(function(){
                $scope.fieldTableSpin = true;
            }, 1000);
            return false
        }
        
        $scope.fieldTableSpin = true;
    }

    $scope.listTable = function(x, y) {
        wdService.fieldTables($scope.uploadData.Cabinets.PGID, $scope.fields, vm.selectedField, vm.maxcount, vm.indexFr, y, $scope.textValue).then(function(res){
            
            var wdFilter = $("#wdFilterUpload").dxTextBox("instance"),
            wdFilterValue = wdFilter.option("value");
            vm.listlength = res.data.root.FieldTbl.length;
            vm.noResults = "";

            if (wdFilterValue == "") {
                vm.total = res.data.root.Header.ListCount;
            } else {
                vm.total = res.data.root.FieldTbl.length
            }

            if (res.data.root.Header.ErrorCount != "") {
                vm.chkError(res.data.root.Header)
                return false;
            }

            $localStorage.ftListId = res.data.root.Header.List_ID;

            
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

            $scope.fieldNum = res.data.root.Header.FieldNum;
            vm.listCount = parseInt(res.data.root.Header.ListCount);
            $scope.fieldNumber = vm.selectedField;
            $timeout(function() {
                $scope.fieldTableSpin = true;
            }, 1000);
        }, function(err){
            $scope.fieldTableSpin = true;
            var data = { fileAction: false };
            $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
        });
    }


    vm.tags = {
        bindingOptions: {
            dataSource: "listOfTags",
            value: "tagValues"
        },
        displayExpr: "CD",
        valueExpr: "CN",
        itemTemplate: "customTagItem"
    }

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
            $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
        });
    }

    $scope.showDetails = function(x) {
        var testedProfile = x.Profile.Fields;
        $scope.upload.fieldDesc = {
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
                vm["wdFieldColor" + xn] = "#a80000";
            } else {
                vm["wdFieldColor" + xn] = "#107c10";
            }
            vm.fieldDesc["field" + xn] = testedProfile["Field" + xn].wd_File_Field_Desc;
        }
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
            $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
        });
    }

    vm.getUploadData = function(x, y) {
        if($( window ).width()<=767) {
            $("#phxUpload .nav-save").css({'display':'none','width': '0%'});
            $("#phxUpload .saveForm").css({'display':'block','width': '100%'});
        }
        
        vm.fileFlag = true;
        vm.selected = x;
        vm.autoFilter = "";

        angular.forEach($scope.getcabinetList, function(key, idx) {
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

        for (var i = 1; i <= 7; i++) {
            $scope.fields["field" + i].value = x["f" + i + "c"];
            vm["wdFieldColor" + i] = "#107c10";
        }
        setTimeout(function(){
            $scope.setDateField();
        }, -1)

        
        //$scope.uploadData.Cabinets = x.dwPGID + "|" + x.f1n  + "|" + x.f2n + "|" + x.f3n + "|" + x.f4n + "|" + x.f5n + "|" + x.f6n + "|" + x.f7n + "|";

        // $scope.uploadDatadisabled = $scope.uploadData.disabled;
        
        vm.fieldDesc = {
            "field1": x.f1d,
            "field2": x.f2d,
            "field3": x.f3d,
            "field4": x.f4d,
            "field5": x.f5d,
            "field6": x.f6d,
            "field7": x.f7d
        }
    };

    /**
     * Engines MultiUploads, used promises to do sequentially.
     * @param elementData, upload customs.
     * @param elementFields, upload fields.
     * @param elementsValue, upload elements array.
     */
    function severalUploads(elementData, elementFields, elementsValue) {
        var recordsSelected = elementsValue;
        recordsSelected.reduce(
            function (sequence, value, index) {
                return sequence.then(function() {
                    return promiseCall(elementData, elementFields, value, index);
                });
            },
            Promise.resolve()
        ).then(function() {
            setTimeout(function() {
              $scope.uploadData.disabled = true;
              $scope.checkDesc.validationRules[0].type = 'required';
              $scope.uploadData.Description = '';
              $scope.$apply();
            }, 4000);
        });

        function promiseCall(elementData, elementFields, value, index){
            return new Promise(function (fulfill, reject){
                var delayDisplayResults = 1500;
                setTimeout(function() {
                  elementData.Description = value.name.split(".").slice(0,-1).join(".") || filename + "";
                  singleUpload(elementData, elementFields, value, index);
                  fulfill({ value: value });
                }, delayDisplayResults);
            });
        }
    }

    /**
     * Engines a single upload.
     * @param elementData, upload customs.
     * @param elementFields, upload fields.
     * @param elementsValue, upload element.
     */
    function singleUpload(elementData, elementFields, elementValue, index) {
        //If index is sent as undefined, change to 0 to allow toast to display correctly
        //index = (index === undefined ? 0 : index);
        vm.uploadInc = false;
        wdService.uploadDoc(elementData, elementFields, elementValue).then(function(res) {
            var uploadData = res.data.download;
            if (uploadData.errorStatus.ErrorCount != "") {
                vm.uploadInc = true;
                vm.newFileErr(uploadData);
                // for(var xn = 1; xn <= 7; xn++) {
                //     if ( uploadData["wd_File_Field_Error" + xn] !== "" ) {
                //         vm["wdFieldColor" + xn] = "#a80000";
                //     } else {
                //         vm["wdFieldColor" + xn] = "#107c10";
                //     }
                //     vm.fieldDesc["field" + xn] = uploadData["FileField" + xn + "Desc"];
                // }
                return false
            }
            $scope.setFileCategory(uploadData, elementData);
            // $scope.uploadVerb(uploadData, elementData);
        }, function(error) {
            vm.uploadInc = true;
            var data = { fileAction: false };
            $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
        });
    }

    vm.newFileErr = function(err) {
        switch (err.errorStatus.wd_Error_RCTX) {
            case "WDRC_TESTPROFILE_FIELD_INVALID":
            for(var i = 1; i <= 7; i++) {
                if (err.errorStatus.wd_Error_VAR == "wd_FILE_FIELD" + i + "_VALUE") {
                    vm.fieldDesc["field" + i] = "Invalid field code";
                    vm["wdFieldColor" + i] = "#a80000";
                }
            }
            break
            default:
            var data = { fileAction: false };
            $rootScope.$broadcast("errorAction", {visible: true, rctx: err.errorStatus.wd_Error_RCTX, data: data});
        }
    }

    vm.sendTo = function() {
        if($scope.value.length > 1)
            severalUploads($scope.uploadData, $scope.fields, $scope.value);
        else
            singleUpload($scope.uploadData, $scope.fields, $scope.value[0]);
    }

    $scope.setFileCategory = function(data, name) {
        var myTagList = $('#wdTagsList').dxTagBox('option', 'value');
        var fileData = { LID: data.FileLID, RN: data.FileRN, LN: 0 };
        if (myTagList.length !== 0) {
            var addCategory = "";

            for (var xn = 0; xn < myTagList.length; xn++) {
                addCategory = addCategory + "+wd_FILE_CAT_ADD_VALUE[" + xn + "]=" + myTagList[xn];
            }

            wdService.setCats(addCategory, fileData).then(function(res) {
                $scope.uploadVerb(data, name);
            }, function(err){
                var data = { fileAction: false };
                $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
            });
            return false;
        }
        $scope.uploadVerb(data, name);
    }

    $scope.uploadVerb = function (data, name) {
        //If index is sent as undefined, change to 0 to allow toast to display correctly
        // index = (index === undefined ? 0 : index);
        wdService.uploadVerb(data, $scope.value, name).then(function(res) {
            var dataInfo = res.data.uploadVerb;
            if (dataInfo.errorStatus.ErrorCount != "") {
                vm.uploadInc = true;
                var setErrorData = { wdMsg: dataInfo.errorStatus.wd_Error_MSG };
                $scope.$parent.dialogTitle = "Upload"
                $scope.$parent.fileErrorMessage.push(setErrorData);
                $scope.$parent.genericError = true;
                $scope.$parent.errorTypeDialog = "action";
                $scope.$parent.fileError = true;
                return false
            }

            $timeout(function() {
                vm.uploadInc = true;

                for (var i = 1; i <= 7; i++) {
                    if ($scope.fields['field' + [i]].value == undefined){
                        $scope.fields['field' + [i]].value = "";
                    }
                }
                $rootScope.uploadLocation = { xName: "", fName: "", access: "", create: "", modified: "", text: "", field1: $scope.fields.field1.value, field2: $scope.fields.field2.value, field3: $scope.fields.field3.value, field4: $scope.fields.field4.value, field5: $scope.fields.field5.value, field6: $scope.fields.field6.value, field7: $scope.fields.field7.value, cabinet: $scope.uploadData.Cabinets.PGID, typeid: "template", temp: "", "id": Date.now() };
                //$location.path('/home').search({xName: "", fName: "", access: "", create: "", modified: "", text: "", field1: $scope.fields.field1.value, field2: $scope.fields.field2.value, field3: $scope.fields.field3.value, field4: $scope.fields.field4.value, field5: $scope.fields.field5.value, field6: $scope.fields.field6.value, field7: $scope.fields.field7.value, cabinet: $scope.uploadData.Cabinets.PGID, typeid: "template", temp: "", "id": Date.now()});
                var data = { fileAction: false };
                $rootScope.$broadcast("errorAction", {visible: true, rctx: "UPLOAD_SUCCESS", data: data});
            }, 0);

        }, function(err) {
            vm.uploadInc = true;
            var data = { fileAction: false };
            $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
        });
    }

    $scope.uploadDocument = function() {
        // Finally do the upload
        if ($scope.saveType == "2") {
            $window.location.href = ($localStorage.host + '/cgi-bin/wdwebcgi.exe?SERVE+wd_SID=' + $localStorage.userData.session + '+html=/fileFunctions/apiList.json+cabinet=' + $scope.uploadData.Cabinets.split("|")[0] + '+f1=' + $scope.fields.field1.value + '+f2=' + $scope.fields.field2.value + '+f3=' + $scope.fields.field3.value + '+f4=' + $scope.fields.field4.value + '+f5=' + $scope.fields.field5.value + '+f6=' + $scope.fields.field6.value + '+f7=' + $scope.fields.field7.value  + '+desc=' + $scope.uploadData.Description + '+type=3+security=' + $scope.uploadData.Security);
        } else {
            wdService.getFolderLevel().then(function(response) {
                for (var i = 0; i < response.data.root.Cabinets.length; i++) {

                    if ( response.data.root.Cabinets[i].pgID == $scope.uploadData.Cabinets.split("|")[0] && $scope.uploadData.Type !== undefined) {
                        var folderList = response.data.root.Cabinets[i].pgFields.split('|');
                        $window.location.href = ($localStorage.host + '/cgi-bin/wdwebcgi.exe?SERVE+wd_SID=' + $localStorage.userData.session + '+html=/fileFunctions/apiList.json+cabinet=' + $scope.uploadData.Cabinets.split("|")[0] + '+f1=' + folderList[1] + '+f2=' + folderList[2] + '+f3=' + folderList[3] + '+f4=' + folderList[4] + '+f5=' + folderList[5] + '+f6=' + folderList[6] + '+f7=' + folderList[7] + '+desc=' + $scope.uploadData.Description + '+type=' + $scope.uploadData.Type + '+security=' + $scope.uploadData.Security);
                        return false;
                    }
                }
            }, function(error){
                var data = { fileAction: false };
                $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
            });
        }
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

        wdService.getFieldDes($scope.uploadData.Cabinets.split("|")[0], fields, getField, "SAVE").then(function(res) {
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
        }, function(error) {
            var data = { fileAction: false };
            $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
        });
    }

    vm.wdButtons = function(x, y){
        var wdFilter = $("#wdFilterUpload").dxTextBox("instance");
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
        if (y == "QuickProfile") {
            vm.selected = vm.quickProfile[0];
        } else {
            vm.selected = vm.favMatters[0];
        }
    };

    vm.scrollLeftNav = {
        scrollByContent: true,
        scrollByThumb: true, 
        showScrollbar: "always",
        height: function() {
            return window.innerHeight - 225;
        },
        useNative: true
    }

    vm.scrollRightForm = {
        scrollByContent: true,
        scrollByThumb: true, 
        showScrollbar: "always",
        height: function() {
            return window.innerHeight - 250;
        },
        useNative: true    
    }


    $scope.newFileBtn = {
        uploadUrl: $localStorage.host + $localStorage.uploadLocation,
        multiple: false,
        uploadedMessage: "I am ready.",
        selectButtonText: "Click to Browse or Drop file here",
        bindingOptions: {
            accept: "accept",
            value: "value",
            uploadMode: "uploadMode"
        },
        onValueChanged: function(e) {
            $scope.value = e.value;
            if(e.value.length === 1)
                statusDescriptionField("required", false);
        },
        onOptionChanged: function(e) {
            if(e.value === 100)
                (e.model.value.length>1) ? statusDescriptionField("", true): statusDescriptionField("required", false);
        }
    }

    vm.setSelected = function(x) {
        vm.selected = x;
    }


    vm.getCategoryList = function(x) {
        var catList = fileListUI.getCategoryList(x);
        var setCategoryArry = [];
        catList.then(function(res) {
            var wdCateResults = res.data;
            $scope.wholeCatList = wdCateResults.root;
            if (wdCateResults.root.Header.Error_Count != "") {
                console.log(wdCateResults.Header.wd_Error_MSG);
                return false;
            }

            angular.forEach(wdCateResults.root.Items, function(key, idx){
                key.text = key.CD;
                key.onClick = function(e) {
                    var getTagValue = $('#wdTagsList').dxTagBox('option', 'value');
                    var pushData = getTagValue.push(key.CN);
                    //$('#wdTagsList').dxTagBox('option', 'value', pushData);
                    //$scope.tagValues.push(key.CD);
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
                        e.model.$parent.$parent.$parent.uploadToggle = false;
                        e.model.$parent.$parent.$parent.openCats = true;
                        $rootScope.$broadcast('categoryList', { cats: $scope.wholeCatList, file: false, type: "upLoadTo" });
                    }
                }
            ]

            //$scope.wdDropCategory = setCategoryArry;

        }, function(error) {
            var data = { fileAction: false };
            $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
        });
    }


    $scope.categoryUpload = [];

    vm.categoryContextualMenu = {
        target: "#categoryMenuBtn",
        bindingOptions: {
            items: "categoryUpload"
        }
    }
    

    vm.contexualMenuBtnCat = {
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
                vm.getCategoryList(wdProfileResults.Profile.wdPath);
    
            }, function(error) {
                var data = { fileAction: false };
                $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
            });
            $("#wdCatMenu").dxContextMenu("toggle", true);
        }
    };

    $scope.tableErr = function(err) {
        $scope.uploadInc = true;
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
            $scope.setPopupDailog(true, err.Header.wd_Error_RCTX, data);
        }
    }

    

    /**
     * Changes dinamically, the field Description, according selected files.
     * @param rule, whether this going to be neither a field required or not.
     * @param consent, whether this going to be neither disabled or not.
     */
     function statusDescriptionField(rule, consent) {
         $scope.checkDesc.validationRules[0].type = rule;
         $scope.uploadData.disabled = consent;
         if(consent)
            $scope.uploadData.Description = '';
     }


    vm.uploadToolBar = [
        { location: 'before', text: 'Upload' }
    ];

    vm.setField = function(x) {
        console.log(x);
        vm.selected = x;
        for (i = 1; i <= 7; i++) {
            if (x["f" + i + "n"]) {
                $scope.fields["field" + i].value = x["f" + i + "n"].replace(/<[^>]+>/gm, '');
                vm.fieldDesc["field" + i] = x["f" + i + "d"].replace(/<[^>]+>/gm, '');
            }
        }
        vm.autoSearch = "";
        vm.autoFilter = "";
    }

    vm.setTooltip = function(data) {
        return "<div class='custom-item'>" + data.Name + "</div>";
    }

    $scope.enterDesc = function(data) {
        console.log(data);
    }

    vm.getToolTip = function(x) {
        var getAllFields = "";
        for (i = 1; i <= 7; i++) {
            if (x["f" + i + "n"]) {
                getAllFields += getAllFields = x["f" + i + "n"] + ' - ' + x["f" + i + "d"] + ' | ';
            }
        }
        return getAllFields.substring(0, getAllFields.length - 2);
    }

    $scope.checkDesc = {
        validationRules: [{ type: "required", "message": "Description is required." }]
    }

    $scope.checkPg = {
        validationRules: [{ type: "required", "message": "Cabinet is required." }]
    }

    $scope.checkUpload = {
        validationRules: [{ type: "required", "message": "Upload a file." }]
    }

    $scope.checkField = {
        validationRules: [{ type: "required", "message": "Field(s) are required" }]
    }

    function checkField(event) {
        var result = event.validationGroup.validate();
        if (result.isValid) {
            vm.sendTo();
        }
    }

}]).factory('uploader', function($localStorage, wdService){

    var fieldsSelect = [];
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
                        ],
                        valueExpr: 'value',
                        displayExpr: "name"
                    }
                }
            ]
        }
    ];
    var uploader = [
        {
            itemType: "group",
            items: [
                {
                    dataField: "Description",
                    editorOptions: {
                        placeholder: 'Description'
                    },
                    validationRules: [{
                        type: "required"
                    }]
                },
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
                        ],
                        valueExpr: 'value',
                        displayExpr: "name"
                    }
                }
            ],
        }
    ];

    return {
        uploadFields: uploadFields,
        securitySelect: securitySelect
        // getCabinets: getCabinets

    }

    // function getCabinets() {
    //     return cabinetList
    // }

    function uploadFields(){
        return uploader;
    }

    function securitySelect() {
        return security;
    }
});

var cabinetList = [],
    fileInfo = {
        name: ""
    }

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
