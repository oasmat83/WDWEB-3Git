'use strict'
angular.module('WDWeb').controller("fileMenuCtrl",
  ['$scope', '$rootScope', '$timeout', '$localStorage', '$location', '$log', '$route', '$window', 'wdService', 'uxService', 'loginService', 'WORLDOX_HOST', 'profileService',
  function ($scope, $rootScope, $timeout, $localStorage, $location, $log, $route, $window, wdService, uxService, loginService, WORLDOX_HOST, profileService) {
      var userAgent;
      var checkType = {"Action": ""};
      var fileID = {};
      $scope.profileType = false;
      $scope.selectedTab = '';

    //   $scope.$on("selectedTab", function(event, data) {
    //     $scope.selectedTab = "Versions";
    //   })

      $scope.fieldLabels = {
          "field1": "",
          "field2": "",
          "field3": "",
          "field4": "",
          "field5": "",
          "field6": "",
          "field7": ""
      }


      userAgent = $window.navigator.userAgent;

      $scope.initMenu = function () {
        $scope.fieldContainer = {
            "Field1": false,
            "Field2": false,
            "Field3": false,
            "Field4": false,
            "Field5": false,
            "Field6": false,
            "Field7": false
        };
        //STATUS
        $scope.dwnSpinner = true;

        //PANEL TITLE
        //$scope.selectedTab = "View";
        $scope.spinner = true;
      }



      //Customs the PanelTitle
      $scope.tabPanelItems = {
          dataSource: [
              {
                  title: "&nbsp;",
                  icon: "",
                  template: "profile",
                  options: {
                    elementAttr: { id: "wdEditProfileTab"}
                  },
                  onClick: function(e) {
                    //$rootScope.$broadcast('editIcon', {"flag": "Edit"});
                  }

              },
              {
                  title: "Email",
                  icon: "ms-Icon ms-Icon--Mail",
                  template: "email"
              }
          ],

        //   itemTemplate: 'file',
          deferRendering: false,
          animationEnabled: true,
          swipeEnabled: false,
          selectedIndex: 0, /*default is set view tab*/
          height: "100%",
          onContentReady : function(e) {
              e.element.find(".dx-tab").each(function( index ) {
                  $(this).attr({id: 'fileMenuTab' + index});
              });
          },
          onTitleClick: function(evt) {
              $scope.selectedTab = evt.itemData.title;
              $scope.checkMessage = "";
              if (evt.itemData.title === "Profile") {
                  $scope.profileType = false;
              }
              else {
                  $scope.profileBtn = "";
              }

              if (evt.itemData.title === "View") {
                  var selectfiles = $("#gridContainer").dxDataGrid("instance").getSelectedRowsData();
                  $scope.filePage(selectfiles.pop());
              }


          }
      };


      //STATUS MODULE
      var fileInfo = {"name": "" };
      $scope.checkinBtn = {
          text: 'Check In',
          type: 'success',
          useSubmitBehavior: true
      }
      $scope.chkintypeObj = [
          { "display": "Replace over original", "id": "R" },
          { "display": "Add as new version", "id": "N" },
          { "display": "Revert back to original", "id": "D" }
      ];
      $scope.checkinType = {
          formData: checkType,
          readOnly: false,
          showColonAfterLabel: false,
          showValidationSummary: false,
          labelLocation: "top",
          colCount: 1,
          validationGroup: "actionType",
          onInitialized: function(e) {
              formInstance = e.component;
          },
          items: uxService.getAction()
      }
      $scope.chkinValue = "";
      $scope.getChkinData = function(e) {
          $scope.chkinValue = e.value;
      }
      $scope.chkinType = {
          bindingOptions: {
              dataSource: 'chkinTypeObj'
          },
          value: 'chkinValue',
          valueExpr: 'id',
          displayExpr: 'display'
      };
      $scope.checkInSubmit = function(){
          $scope.spinner = false;
          fileID = wdService.getFileData();
          if ($scope.chkinValue == "D") {
              wdService.checkIn(fileID).then(function(res){
                  if (res.data.fileStatus.errorStatus.ErrorCount != ""){
                    return false;
                  }
                  $timeout(function(){
                      $scope.listOptions[0].I = '0';
                      $scope.spinner = true;
                  }, 5000);
              }, function(err){
                    var data = { fileAction: false };
                    $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
              });
          }
          else if ($scope.chkinValue == "R") {
              $scope.uploadToWorldox('', $scope.value.length);
          }

          else if ($scope.chkinValue == "N") {
              $scope.uploadToWorldox('1', $scope.value.length);
          }
          else {
              $scope.spinner = true;
          }
      }


      $scope.uploadToWorldox = function(x, y) {
            fileID = wdService.getFileData();
            if (y === 0) {
                $scope.spinner = true;
                return false;
            }
            wdService.uploadToWorldox(x, fileID, fileInfo.name).then(function(res){
                var uploadData = res.data.uploadVerb;
                if (uploadData.errorStatus.ErrorCount != "") {
                    $scope.spinner = true;
                    return false
                }
                $scope.chkToWorldox();
            }, function(error){
                var data = { fileAction: false };
                $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
            });
      }
      $scope.chkToWorldox = function() {
            fileID = wdService.getFileData();
            wdService.chkToWorldox(fileID, fileInfo.name).then(function(res){
                    var chkinData = res.data.fileStatus;
                    if(chkinData.errorStatus.ErrorCount != "") {
                        $scope.spinner = true;
                        return false
                    }

                    $timeout(function(){
                        $scope.listOptions[0].I = '0';
                        $scope.spinner = true;
                        $scope.cancelPanel();
                    }, 5000);

                }, function(error){
                    var data = { fileAction: false };
                    $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
                })
      }

      $scope.checkOutBtn = {
        text: "Check Out",
        type: "success",
        onClick: function(e) {}
      }

      $scope.download = function(x) {//Download of checkoutBtn
          $scope.dwnSpinner = false;
          wdService.download(x).then(function(res){
              var dwnData = res.data.download;
              if (dwnData.errorStatus.ErrorCount != "") {
              } else if (dwnData.message) {
              } else {

                  if (userAgent.indexOf('Frowser') != -1) {
                      wdService.getFolderLevel().then(function(response) {
                          for (var i = 0; i < response.data.root.Cabinets.length; i++) {
                              if ( response.data.root.Cabinets[i].pgID == x.profileGroupId ) {
                                  var folderList = response.data.root.Cabinets[i].pgFields.split('|');
                                  $scope.getResponse(res.data, x, folderList);
                                  return false;
                              }
                          }
                      }, function(error){
                        var data = { fileAction: false };
                        $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
                      });
                  } else {
                      $window.location.href = ($localStorage.host + res.data.download.fileLoc);
                  }
              }
              $scope.dwnSpinner = true;
          }, function(error) {
                $scope.dwnSpinner = true;
                var data = { fileAction: false };
                $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
          });
      }

      $scope.getResponse = function(x, y, z) {
          var zms = x.download.FileZMS.replace(/\\/g, "\\\\");
          z.shift();
          for (var i = 0; i < z.length; i++) {
              if (z[i] !== "") {
                  z[i] = y["Field" + (i + 1)];
              } else {
                  z[i] = "";
              }
          }
          $window.location.href = ($localStorage.host + '/cgi-bin/wdwebcgi.exe?SERVE+wd_SID=' + $localStorage.userData.session + '+html=/api/apiList.json+dwLoc=' + x.download.fileLoc + '+name=' + x.download.FileNme + '+domain=' + $localStorage.host + '+cabinet=' + y.profileGroupId + '+f1=' + z[0] + '+f2=' + z[1] + '+f3=' + z[2] + '+f4=' + z[3] + '+f5=' + z[4] + '+f6=' + z[5] + '+f7=' + z[6] + '+popFlag=' + $scope.softpopFlag + '+zms=' + zms);
      }

      $scope.fileUpload = {
          uploadUrl: $localStorage.host + $localStorage.uploadLocation,
          bindingOptions: {
              multiple: "multiple",
              accept: "accept",
              value: "value",
              uploadMode: "uploadMode"
          },
          onValueChanged: function(e) {
              if (e.value.length === 0) {
                  fileInfo.name = "";
                  return false;
              };
              $scope.value = e.value;
              fileInfo.name = e.value[0].name;

          }
      };
      //STATUS MODULE - END


      //PROFILE COMMENT MODULE
      $scope.profileBtn = "";
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
      

      $scope.closeEdit = function(){
          $scope.profileType = false;
          $scope.profileBtn = "";
      }
      $scope.updateProfile = {
          bindingOptions: {
              text: 'profileBtn'
          },
          type: 'success',
          useSubmitBehavior: true
      }
      //PROFILE COMMENT MODULE - END
}]);
