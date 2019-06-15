'use strict'
angular.module('WDWeb').controller("customCtrl",
  ['$scope', '$rootScope', '$localStorage', '$location', '$log', '$route', 'wdService', '$timeout', 'fileListUI',
  function ($scope, $rootScope, $localStorage, $location, $log, $route, wdService, $timeout, fileListUI) {
        var vm = this;

        $scope.setField = {
            find: true,
            read: true,
            write: true,
            profile: true,
            delete: true,
            secure: true
        };

        $scope.setValue = {
            find: true,
            read: false,
            write: false,
            profile: false,
            delete: false,
            secure: false 
        }
        
        $scope.setList = [
            { name: "Owners", icon:  "ms-Icon ms-Icon--Contact redIcon", user: true },
            { name: "Everyone else", icon: "ms-Icon ms-Icon--Globe", user: false }
        ];

            

        vm.btnTypeoptions = [
            { text: "Add Group", type: "success" },
            { text: "Add User", type: "success" },
            { text: "Remove", type: "success" }
        ];

        vm.chkGroup = [
            { 
                width: 80, 
                text: "Find",
                bindingOptions: {
                    disabled: "setField.find",
                    value: "setValue.find"
                },
                onValueChanged: function(e) {
                    var list = $("#wdCustomList").dxList("instance");
                    var select = list.option("selectedItems")[0];
                    console.log(select);
                    if (e.value && select.user) {
                        $scope.setField = { find: false, read: false, write: false, profile: false, delete: false, secure: false};
                    }
                    // $scope.setField = { find: false, read: false, write: false, profile: false, delete: false, secure: false};
                    //$scope.setValue = { find: false, read: true, write: true, profile: true, delete: true, secure: true};
                    console.log(e);
                }
            },
            { 
                width: 80, 
                text: "Read",
                bindingOptions: {
                    disabled: "setField.read",
                    value: "setValue.read"
                } 
            },
            { 
                width: 80, 
                text: "Write",
                bindingOptions: {
                    disabled: "setField.write",
                    value: "setValue.write"
                }
            },
            { 
                width: 80, 
                text: "Profile",
                bindingOptions: {
                    disabled: "setField.profile",
                    value: "setValue.profile"
                }
            },
            { 
                width: 80, 
                text: "Delete",
                bindingOptions: {
                    disabled: "setField.delete",
                    value: "setValue.delete"
                }
            },
            { 
                width: 80, 
                text: "Secure",
                bindingOptions: {
                    disabled: "setField.secure",
                    value: "setValue.secure"
                }
            }
        ]

        vm.setGroupUserList = {
            bindingOptions: {
                searchMode: "searchMode",
                dataSource: "setList",
            },
            height: 400,
            searchEnabled: true,
            selectionMode: "single",
            itemTemplate: function(data) {
                return "<div class='wdlistContainer'> <i class='" + data.icon + "' aria-hidden='true'></i>" + data.name + "</div>";
            },
            onInitialized: function() {
                var list = $("#wdCustomList").dxList("instance");
                list.selectItem(0);
                if ( list.option("selectedItems")[0].name == "Owners" ) {
                    $scope.setField = { find: true, read: true, write: true, profile: true, delete: true, secure: true };
                }
            },
            onSelectionChanged: function(e) {
                vm.setChkFields(e.addedItems[0]);
            }
        }

        vm.setChkFields = function(e) {
            if (e.user == false) {
                $scope.setField = { find: false, read: true, write: true, profile: true, delete: true, secure: true };
                $scope.setValue = {
                    find: false,
                    read: false,
                    write: false,
                    profile: false,
                    delete: false,
                    secure: false 
                }
            } else if (e.user == true && e.name !== "Owners") {
                $scope.setField = { find: false, read: false, write: false, profile: false, delete: false, secure: false };
                $scope.setValue = {
                    find: true,
                    read: true,
                    write: true,
                    profile: true,
                    delete: true,
                    secure: true 
                }
            } else if (e.user == true && e.name == "Owners") {
                $scope.setField = { find: true, read: true, write: true, profile: true, delete: true, secure: true };
                $scope.setValue = {
                    find: true,
                    read: false,
                    write: false,
                    profile: false,
                    delete: false,
                    secure: false 
                }
            }
        }
         
    }
]);