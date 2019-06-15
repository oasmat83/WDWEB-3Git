'use strict'
angular.module('WDWeb').controller("categoryCtrl",
  ['$scope', '$rootScope', '$localStorage', '$location', '$log', '$route', 'wdService', '$timeout', 'fileListUI',
  function ($scope, $rootScope, $localStorage, $location, $log, $route, wdService, $timeout, fileListUI) {
    var vm = this;
    vm.openCatPanel = false;
    $scope.catTab = "All";
    $scope.catType = [];
    vm.categoryTypeDialog = true;
    $scope.iconGroupList = [];
    vm.moreIcon = true;
    vm.iconList = [];
    $scope.catData = {
        name: "",
        iconid: ""
    }
    vm.setHtmlIcon = "";

    $scope.$watch(function() {
        return vm.moreIcon;
    }, function(newValue) {
        if (!newValue) {
            fileListUI.getCategoryList('.').then(function(res) {
                var catGroup = res.data.root;
                if (catGroup.Header.Error_Count !== "") {
                    var data = { fileAction: false };
                    $rootScope.$broadcast("errorAction", {visible: true, rctx: catGroup.Header.wd_Error_RCTX, data: data});
                    return false;
                }
                $scope.iconGroupList = [];
                angular.forEach(catGroup.Items, function(key, index) {
                    if (key.CN.indexOf(".ico") == -1) {
                        $scope.iconGroupList.push(key);
                        //vm.chkMultiLevel(key);
                   }
                });
                $scope.groupValue = $scope.iconGroupList[0];
                vm.setMoreIcons();
                //vm.setGroupd = res.data.root.Items;

            }, function(error) {
                var data = { fileAction: false };
                $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
            });
        }
    });

    $scope.$watch(function(){
        return vm.categoryTypeDialog;
    }, function(newValue) {
        if (!newValue) {
            fileListUI.getCategoryList('.\\Internal').then(function(res) {
                var catData = res.data.root;
                if (catData.Header.Error_Count !== "") {
                    var data = { fileAction: false };
                    $rootScope.$broadcast("errorAction", {visible: true, rctx: catData.Header.wd_Error_RCTX, data: data});
                    return false;
                }
                vm.catInternal = res.data.root.Items;
            }, function(error) {
                var data = { fileAction: false };
                $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
            });
        }
    });

    vm.chkMultiLevel = function(x) {
        fileListUI.getCategoryList(x.CN).then(function(res) {
            var catGroup = res.data.root;
            if (catGroup.Header.Error_Count !== "") {
                var data = { fileAction: false };
                $rootScope.$broadcast("errorAction", {visible: true, rctx: catGroup.Header.wd_Error_RCTX, data: data});
                return false;
            }
            angular.forEach(catGroup.Items, function(key, index) {
                if (key.CN.indexOf(".ico") == -1) {
                    var arr = $scope.iconGroupList.indexOf(x);
                    $scope.iconGroupList.splice(arr, 1);
                    $scope.iconGroupList.push(key);
                    vm.chkMultiLevel(key);
                } 
            });
        }, function(error) {
            var data = { fileAction: false };
            $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
        });
    }

    $scope.$on("categoryList", function(event, data) {
        vm.catErr = "";
        vm.displayType = data.type;
        $scope.copyList = angular.copy(data.cats.Items);
        $scope.categoryList = data.cats.Items;
        $("#catTabPanel").dxTabPanel("instance").option("selectedIndex", 0);
        $("#catGridOptions").dxDataGrid("instance").selectRowsByIndexes([0]);
        vm.selectedFile = data.file;
        $scope.catType = [
            {text: "Personal (seen by you)", value: 2},
            {text: "Public (seen by everyone)", value: 1},
            {text: "Folder (seen only in " + vm.selectedFile.Location + ")", value: ""} 
        ];
        vm.categoryTypeDialog = true;
        vm.selectedCategory = $scope.catType[0].value;


        if (vm.selectedFile.CAT_ID !== "") {
            var grid = $("#catGridOptions").dxDataGrid("instance");
            angular.forEach(vm.selectedFile.CAT_ID, function(key, index) {
                angular.forEach($scope.categoryList, function(lKey, lIndex) {
                    if (key.CN == lKey.CN) {
                        grid.selectRowsByIndexes(lIndex);
                    }
                });
            });
        }
    });


    $scope.$on("closeCats", function(event, data) {
        vm.openCatPanel = data.panelupdate;
    });

    $scope.filterRow = {
        visible: true,
        applyFilter: "auto"
    };

    vm.setType = {
        text: "Select",
        type: "success",
        onClick: function(e) {
            vm.categoryTypeDialog = false;
        }
    }

    vm.categoryNameValidation = {
        validationRules: [{
            type: "required",
            message: "Category name is required"
        }]
    };

    vm.submit = function() {
        var xn;
        if ($scope.setButtonType == "Edit") {
            var editData;
            var catGrid = $("#catGridOptions").dxDataGrid("instance");
            angular.forEach(catGrid.getSelectedRowsData(), function(key, index) {
                editData = {
                    name: $scope.catData.name,
                    icoid: $scope.catData.iconid,
                    listId: key.L,
                    recId: key.R
                }
                vm.setCategory(editData);
            });
        }

        xn = {
            icoPath: vm.icoPthValue,
            selectedType: vm.selectedCategory,
            folderPth: vm.setFolderPath,
            name: $scope.catData.name,
            action: vm.setActionType,
            delFlag: vm.delFlag
        }

        wdService.addEditDelCategory(xn).then(function (res) {
            var tagUpdate = res.data.root;
            var setErrorData;
            if (tagUpdate.Header.Error_Count !== "") {
                setErrorData = { wdMsg: tagUpdate.Header.Error_Msg, status: "failed", type: true, action: $scope.setButtonType + " Category" };
                $rootScope.$broadcast('setDialogStatus', setErrorData);
                return false;
            }
            vm.reloadGrid();
        }, function(error) {
            var data = { fileAction: false };
            $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
        });
    }

    vm.updateEditNewCat = {
        bindingOptions: {
            text: "setButtonType"
        },
        type: "success",
        useSubmitBehavior: true
    }

    vm.reloadGrid = function() {
        var dataGrid = $("#gridContainer").dxDataGrid("instance");
        fileListUI.getCategoryList(vm.selectedFile.FilePath).then(function(res) {
            vm.setcloseIconPanel()
            $rootScope.$broadcast('categoryList', { cats: res.data.root, file: vm.selectedFile, type: "dataGrid" });
            dataGrid.refresh();
        });
    }

    vm.setCategory = function (e) {
        wdService.updCategory().then(function(res) {
        }, function(err) {
            var data = { fileAction: false };
            $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
        });
    }

    vm.setInitIco = function() {
        console.log('faskflja');
    }

    vm.catGridOptions = {
        columns:  [
            {
                caption: "Name",
                dataField: "CD",
                cellTemplate: "catTemplate",
            },
            {
                caption: "Type",
                dataField: "TAB_NAME"
            }
        ],
        onToolbarPreparing: function(e) {
            e.toolbarOptions.items.unshift({
                location: "before",
                template: "fileData"
            },{
                location: "after",
                widget: "dxButton",
                locateInMenu: "auto",
                options: {
                    icon: "ms-Icon ms-Icon--CheckMark",
                    text: "Select",
                    onClick: function(st) {
                        var selectedCat = e.component.getSelectedRowsData();
                        if (selectedCat.length == 0) {
                            vm.catErr = ("Please select a category");
                            return false;
                        }

                        if (vm.displayType == "dataGrid") {

                            vm.setTagCatergory(selectedCat, false, e);

                        } else {
                            angular.forEach(selectedCat, function(key, index) {
                                var getTagValue = $('#wdTagsList').dxTagBox('option', 'value');
                                getTagValue.push(key.CD);
                            });

                            $scope.$parent.uploadToggle = true;
                            $scope.$parent.openCats = false;

                        } 
                
                    }
                }
            },{
                location: "after",
                widget: "dxButton",
                locateInMenu: "auto",
                options: {
                    icon: "ms-Icon ms-Icon--AddTo",
                    text: "Add",
                    onClick: function(e) {
                        $scope.setButtonType = "Add";
                        vm.setActionType = "New";
                        vm.delFlag = "";
                        if ($scope.catTab == "All") {
                            vm.categoryTypeDialog = true;
                        } else {
                            vm.categoryTypeDialog = false;
                        } 
                        $scope.catData = {
                            name: "",
                            iconid: ""
                        };
                        vm.setHtmlIcon = "";
                        vm.openCatPanel = true;
                    }
                }
            },{
                location: "after",
                widget: "dxButton",
                locateInMenu: "auto",
                options: {
                    icon: "ms-Icon ms-Icon--Edit",
                    text: "Edit",
                    onClick: function(xn) {
                        $scope.setButtonType = "Edit";
                        vm.setFolderPath = "";
                        vm.delFlag = "";
                        var selectedCat = e.component.getSelectedRowsData();
                        if (selectedCat.length == 0) {
                            vm.catErr = ("Please select a category");
                            return false;
                        } 
                        
                        if (selectedCat[0].TAB_NAME == "Personal"){
                            vm.selectedCategory = 2;
                        } else {
                            vm.selectedCategory = 1;
                        } 

                        vm.setActionType = selectedCat[0].CN;
                        vm.openCatPanel = true;
                        vm.categoryTypeDialog = false;
                        angular.forEach(selectedCat, function(key, index) {
                            if (index === selectedCat.length -1) {
                                var htmlData = "<img src='"+ $rootScope.host + key.CI + "' height='16' width='16'/>";
                                vm.setHtmlIcon = htmlData;
                                $scope.catData = {
                                    name: key.CD,
                                    iconid: key.CN
                                }
                            }
                        });
                    }
                }
            },{
                location: "after",
                widget: "dxButton",
                locateInMenu: "auto",
                options: {
                    icon: "ms-Icon ms-Icon--Delete",
                    text: "Delete",
                    onClick: function(dt) {
                        $scope.setButtonType = "Delete";
                        vm.setFolderPath = "";
                        var selectedCat = e.component.getSelectedRowsData();
                        if (selectedCat.length == 0) {
                            vm.catErr = ("Please select a category");
                            return false;
                        }

                        if (selectedCat[0].TAB_NAME == "Personal"){
                            vm.selectedCategory = 2;
                        } else {
                            vm.selectedCategory = 1;
                        } 

                        vm.setActionType = selectedCat[0].CN;
                        vm.delFlag = selectedCat[0].CN;
                        vm.submit();
                        // $("#updateEditNewCat").dxButton("instance").option().onClick();
                    }
                }
            }
            )
        }, 
        bindingOptions: {
            dataSource: "categoryList",
            // filterRow: "filterRow",
        },
        hoverStateEnabled: true,
        selection: {
            mode: "single",
            allowSelectAll: true,
            selectAllMode: "page",
            showCheckBoxesMode: "always"
        },
        scrolling: {
            mode: "infinite"
        },
        height: function() {
            return vm.getHeight();
        },
        onContextMenuPreparing: function(e) {
            if (e.target !== "headerPanel" && e.row.rowType === 'data') {
                e.items = [{ 
                    text: "Select", 
                    icon: "ms-Icon ms-Icon--CheckMark",
                    onClick: function(st){
                        var selectedCat = e.component.getSelectedRowsData();
                        if (selectedCat.length == 0) {
                            vm.catErr = ("Please select a category");
                            return false;
                        }
                        vm.setTagCatergory(selectedCat, false, e);
                    }
                }];
            };
        },
        onRowClick: function(e) {
            vm.catErr = "";
        }
    }

    vm.getHeight = function() {
        return window.innerHeight - 104;
    }

    vm.catergoryType = {
        bindingOptions: {
            items: "catType"
        },
        onValueChanged: function(e) {
            vm.selectedCategory = e.value.value;
            if (vm.selectedCategory == "") {
                vm.setFolderPath = vm.selectedFile.FilePath;
            } else {
                vm.setFolderPath = "";
            }
        }
    }

    vm.catTabPanel = {
        dataSource: [
            {
                title: "All",
                icon: "ms-Icon ms-Icon--AddTo"
            },
            {
                title: "Personal",
                icon: "ms-Icon ms-Icon--PartyLeader"
            },
            {
                title: "Public",
                icon: "ms-Icon ms-Icon--Globe"
            },
            {
                title: "Folder",
                icon: "ms-Icon ms-Icon--FabricFolder"
            }
        ],

        itemTemplate: 'category',
        height: "100%",
        onTitleClick: function(evt) {
            function filterProducts(category){
                return function filter(catsList) {
                    return catsList.TAB_NAME === category;
                  };
            }

            if (evt.itemData.title !== "All") {
                var filtered = $scope.copyList.filter(filterProducts(evt.itemData.title));
                $scope.categoryList = filtered;
                vm.categoryTypeDialog = false;
                vm.selectedCategory = evt.itemData.title;
            } else {
                vm.categoryTypeDialog = true;
                $scope.categoryList = $scope.copyList;
            }

            if (evt.itemData.title == "Personal") {
                vm.selectedCategory = 2;
                vm.setFolderPath = "";
            } else if (evt.itemData.title == "Public") {
                vm.selectedCategory = 1;
                vm.setFolderPath = "";
            } else if (evt.itemData.title == "Folder") {
                vm.selectedCategory = "";
                vm.setFolderPath = vm.selectedFile.FilePath;
            }
            
            $scope.catTab = evt.itemData.title;
        }
       
    };

    vm.newCatName = {
        bindingOptions:{ 
            value: 'catData.name'
        }, 
        placeholder: 'New category name',
        onValueChanged: function(e) {
            $scope.catData.name = e.value;
        }

    }

    vm.setIcon = function(e) {
        vm.icoPthValue;
        var htmlData = "<img src='"+ $rootScope.host + e.CI + "' height='16' width='16'/>";
        vm.iconName = e.CD;
        $scope.catData.iconid = e.TAB_BBID;
        vm.setHtmlIcon = htmlData;
        if (e.CN.indexOf("Internal") !== -1) {
            vm.icoPthValue = e.L;
            return false;
        }
        vm.icoPthValue = e.CN;
    }

    vm.clearCatIcon = function() {
        $scope.catData.iconid = "";
        vm.setHtmlIcon = "";
    }

    vm.getMoreIcon = function() {
        vm.moreIcon = false;
    }

    vm.setMoreIcon = {
        text: "Update",
        type: "success",
        onClick: function(e) {
            vm.moreIcon = true;
        } 
    }

    vm.selectCatGroup = {
        bindingOptions: {
            dataSource: "iconGroupList",
            value: "groupValue",
        },
        placeholder: "Select a icon Group",
        displayExpr: "CD",
        
        onValueChanged: function(xn) {
            $scope.groupValue = xn.value;
            vm.setMoreIcons();
        }
    }

    vm.setMoreIcons = function(){
        fileListUI.getCategoryList($scope.groupValue.CN).then(function(res) {
            var catData = res.data.root;
            if (catData.Header.Error_Count !== "") {
                var data = { fileAction: false };
                $rootScope.$broadcast("errorAction", {visible: true, rctx: catData.Header.wd_Error_RCTX, data: data});
                return false;
            }
            vm.iconList = catData.Items;

        }, function(error) {
            var data = { fileAction: false };
            $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
        });
    };

    vm.setcloseIconPanel = function() {
        $('#newCatName').dxValidator('instance').reset();    
        if (!vm.moreIcon) {
            vm.moreIcon = true;
            $scope.iconGroupList = []
            vm.clearCatIcon();
            return false;
        }
        vm.openCatPanel = false;
    }

    vm.setTagCatergory = function(x, y, z) {
        angular.forEach(x, function(key, index) {
            wdService.addRemoveCat(key, vm.selectedFile, y).then(function(res) {
                var categoryResp = res.data.category;
                if ( categoryResp.errorStatus.ErrorCount !== "" ) {
                    var data = { fileAction: false };
                    $rootScope.$broadcast("errorAction", {visible: true, rctx: categoryResp.errorStatus.wd_Error_RCTX, data: data});
                    return false
                }
            }, function(error) {
                // var data = { fileAction: false };
                // $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
            }); 

            if (index === x.length -1) {
                $scope.$parent.openCats = false;
                $route.reload();
            }
        });
    }
     
  
    }]
);