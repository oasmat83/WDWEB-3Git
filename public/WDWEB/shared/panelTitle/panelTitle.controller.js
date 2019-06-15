'use strict'
angular.module('WDWeb').controller("panelTitleController",
['$scope', 'uploader', 'wdService', 'homeService', 'panelTitleService', '$rootScope', '$timeout', 'profileService', 'fileListUI', function($scope, uploader, wdService, homeService, panelTitleService, $rootScope, $timeout, profileService, fileListUI){
    var cabinetList = [];
    $scope.selectlist = "";
    $scope.showComment = false;
    $scope.activeIcon = 'Profile';


    $scope.$on("setfield", function() {
        //$scope.editFileProfile('Edit', 8);
    });

    $scope.$on("editIcon", function(event, data){
        //$scope.activeIcon = data.flag;
        $scope.$parent.profileBtn = data.flag;
        $scope.newData = data.newData;
    });


    //$scope.listOfCabinets = [];
    $scope.$watch(function(){
        return homeService.getSelected();
    }, function(newVal) {
        $scope.selectlist = newVal - 1;
    });

    $scope.$watch(function() {
        return homeService.getSelectedList();
    }, function(newData) {
        $scope.myFileList = newData;
        if (newData.length == 1) {
            switch ($scope.myFileList[0].Comments) {
                case '':
                    $scope.showComment = false;
                break;
                default:
                $scope.showComment = true;
            }
            return false;
        }
        $scope.showComment = true;
    })

    $scope.goToList = function() {
        $rootScope.$broadcast('selectedTab', { flag: "Versions"});
        $rootScope.tabTypeFlag = true;
    }


    $scope.getStatusIcon = function(status) {
        switch (status) {
            case '0' :
                return "dx-icon ms-Icon ms-Icon--nothing";
                break;
            case '48' :
                return "dx-icon ms-Icon ms-Icon--PageCheckedOut statusGreen"
                break;
            case '49' :
                return "dx-icon ms-Icon ms-Icon--PageCheckedOut statusRed"
                break
            case '51' :
                return "dx-icon ms-Icon ms-Icon--UnlockSolid statusGreen"
                break;
            case '52' :
                return "dx-icon ms-Icon ms-Icon--LockSolid statusGreen"
                break;
            case '53' :
                return "dx-icon ms-Icon ms-Icon--LockSolid statusYellow"
                break;
            case '54' :
                return "dx-icon ms-Icon ms-Icon--LockSolid statusYellow"
                break;
            case '55' :
                return "dx-icon ms-Icon ms-Icon--LockSolid statusRed"
                break;
            case '56' :
                return "dx-icon ms-Icon ms-Icon--LockSolid statusRed"
                break;
        }
    }

    $scope.getIconTitle = function(status, owner) {
        switch (status) {
            case '0' :
                return "";
                break;
            case '48' :
                return "File is Checked out to you"
                break;
            case '49' :
                return "File is Checked out to " + owner
                break
            case '51' :
                return "Hidden by you"
                break;
            case '52' :
                return "File Secured by:" + owner
                break;
            case '53' :
                return ""
                break;
            case '54' :
                return "Read only access"
                break;
            case '55' :
                return ""
                break;
            case '56' :
                return "Your a Manager with access"
                break;
        }
    }

    $scope.fieldContainer = {
        "Field1": false,
        "Field2": false,
        "Field3": false,
        "Field4": false,
        "Field5": false,
        "Field6": false,
        "Field7": false
    };
    
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
        "descComm": "",
        "placeholderCo": "Comments",
        "placeholderDesc": "Description"
    }

    $scope.editFileProfile = function(x, a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, xn) {
        $scope.actionId = xn;
        $scope.$parent.profileBtn = q;
        $scope.$parent.profileType = true;
        $scope.editFields = {
            'field1': a,
            'field2': b,
            'field3': c,
            'field4': d,
            'field5': e,
            'field6': f,
            'field7': g,
            "placeholder1": h,
            "placeholder2": i,
            "placeholder3": j,
            "placeholder4": k,
            "placeholder5": l,
            "placeholder6": m,
            "placeholder7": n,
            "description": o,
            "comment": p,
            "placeholderCo": "Comments",
            "placeholderDesc": "Description",
            "descComm": o + '\r\n\r\n' + p
        }

    }
    

    /**
     * Closes the edit panel.
     * @return, none.
     */
    $scope.closeEdit = function(){
      $scope.$parent.profileType = false;
      $scope.$parent.profileBtn = "";
    }

    /**
     * Onclick delete button in RightSidebar
     */

    //Delete file Popup option
    $scope.currentDeleteFilesRightSidebar = {};
    $scope.visibleDeletePopupRightSidebar = false;

    $scope.popupOptionsRightSidebar = {
        width: 550,
        height: 400,
        contentTemplate: "deleteRightSidebar",
        showTitle: true,
        title: "Delete",
        dragEnabled: false,
        closeOnBackButton: false,
        closeOnOutsideClick: false,
        showCloseButton: false,
        bindingOptions: {
            visible: "visibleDeletePopupRightSidebar",
        }
    };

    $scope.showDeletePopupRightSidebar = function () {
        $scope.currentDeleteFilesRightSidebar = $scope.myFileList[0];
        console.log($scope.currentDeleteFilesRightSidebar);
        $scope.visibleDeletePopupRightSidebar = true;
    };

    $scope.applyDeleteButtonOptions = {
        text: "Ok",
        type: "success",
        width: 90,
        onClick: function(e) {
            $scope.visibleDeletePopupRightSidebar = false;
        }
    };

    $scope.cancelDeleteButtonOptions = {
        text: "Cancel",
        type: "danger",
        width: 90,
        onClick: function(e) {
            $scope.visibleDeletePopupRightSidebar = false;
        }
    };



    /**
     * Makes a request to the paneltitle service.
     * @return, a list of cabinets.
     */
    function getCabinets () {
      var cabinetList = [];
      panelTitleService.getCabinetList().then(function(res){
          if (res.data.root.Header.ErrorCount !== "") {
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
      return cabinetList;
    }
}]);
