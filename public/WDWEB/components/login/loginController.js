'use strict'
angular.module('WDWeb').controller("loginController",
  ['$scope', '$timeout', '$localStorage', '$location', '$log', 'wdService', 'uxService', 'loginService', 'WORLDOX_HOST', 'homeService', '$window', '$rootScope', '$cookies', 'RIGHTS', '$sessionStorage',
  function ($scope, $timeout, $localStorage, $location, $log, wdService, uxService, loginService, WORLDOX_HOST, homeService, $window, $rootScope, $cookies, RIGHTS, $sessionStorage) {
      var WDXHOST='';
      var formInstance;
      var spinner = document.querySelectorAll(".ms-Spinner");
      var searchQuery = $location.search();
      var userAgent = $window.navigator.userAgent;
      var authSession = $cookies.get("wdSession");
      $scope.showlogin = false;
      $scope.isRememberUserName = "";

      var formData = {
          "Username": "",
          "Password": ""
      };


      var loginUiData = {
        "root": {
            "Dialog": {
                "1": "Sign into Worldox Web2",
                "2": "Email2",
                "3": "Password2",
                "4": "Remember Email2",
                "5": "Login2"
            }
        }
     }

      var buttonIndicator;
      $rootScope.pageTitle = "Login to Worldox Web";
      $scope.userValid = false;
      $scope.tooglePassWord = false;
      $scope.setBtnPropterty = false;
      $scope.setBtnVisibility = true;
      $scope.errorDailog = false;
      $scope.wdErrorRctx = "";
      $scope.WDXHOST = "";
      $scope.wdFileData = {
          fileAction: false
      };

      $scope.wdLanguageList = [
        { display: "English", code: "us" },
        { display: "Spanish", code: "es" }
      ]

      $scope.init = function() {
        $rootScope.setBody = true;
        $scope.spinner = true;
        if ($scope.tooglePassWord) {
            $scope.passIcon = "ms-Icon ms-Icon--Hide";
            return false;
        }
        $scope.passIcon = "ms-Icon ms-Icon--RedEye";


        loginService.getVars(WDXHOST, "*LOGONFORM", 'us').then(function(res){
            var loginTxt = res.data.root.Dialog;
            if (loginTxt == "") {
                $scope.setText();
                return false
            }
            $scope.getVarSucces(loginTxt, 'us');
        }, function(error) {
            $scope.setText();
        });

        if (authSession !== undefined) {
            $scope.loginErr = "Worldox session closed/expired!";
            $cookies.remove("wdSession");
            return false;
        }
        $scope.loginErr = "";
      }

      initLogin();

      /**
       * Initializes Worldox host.
       * @param x, boolean value
       * @param y, boolean value
       */
      function initLogin() {
        switch ($location.port()) {
            case '80':
            case '443':
                WDXHOST = $location.protocol() + "://" + $location.host() + "/";
                break;
            default:
                WDXHOST = $location.protocol() + "://" + $location.host() + ":" + $location.port() + "/";
        }
        // WDXHOST= "http://65.206.104.80/";
        WDXHOST= "http://24.190.224.178/";
      }


      $scope.moveToLeft = true;
      $scope.direction = 0;
      $scope.loginSpinner = true;
      $scope.loginErr = "";

      $scope.isActive = function(x) {
        return $scope.selected === x;
      }


      $scope.pssValidation = {
        validationRules: [{
            type: "required",
            message: "Password is required"
        }]
      }

      $scope.showPassword = {
        elementAttr: {
            id: "showPassword",
        },
        text: 'Show Password',
        value: false,
        tabIndex: 4,
        onOptionChanged: function(e) {
            if (!e.value) {
                $("#password").dxTextBox("instance").option("mode", "password");
                return false
            }
            $("#password").dxTextBox("instance").option("mode", "text");
        }
      }

      $scope.chkuser = function(e) {
          if (localStorage.rememberUserName == '' || localStorage.rememberUserName == undefined) {
            $timeout(function(){
                e.component.focus();
            }, 1000)
          }
      }

      $scope.rememberUserName = {
          elementAttr: {
              id: "rememberUserName",
          },
          value: false,
          tabIndex: 3,
          bindingOptions: {
              text: "rememberMe"
          },
        onOptionChanged: function(e) {
              if(e.value == true) {
                  $scope.isRememberUserName = true;
              }
              else {
                  $scope.isRememberUserName = false;
              }
        },
        onContentReady: function (e) {
            if(localStorage.rememberUserName) {
                $scope.isRememberUserName = true;
                e.component.option('value', true);
                $timeout(function(){
                    $("#password input").focus()
                }, 1000);
            }else{
                $scope.isRememberUserName = false;
                e.component.option('value', false);
                $timeout(function(){
                    $("#user input").focus()
                }, 1000);
            }
        }
      }

      $timeout(function(){
          $('#user input').val(localStorage.rememberUserName);
          $scope.userValid = localStorage.rememberUserName;
          $scope.loginData.username.value = localStorage.rememberUserName;
      }, 100);


      $timeout(function(){
          angular.element(document).ready(function(){
            
            // $('#user input').focus();
            // $("#loginForm").focus();
            $("#user input").on('keyup', function (e) {
                if (e.keyCode == 13) {
                    // Do something
                }
            });
            // element.classList.add("loaded");
          });
      }, 0);

      if ($localStorage.userData) {
          wdService.chksession().then(function(res){
              if (res.data.user == '' || !res.data.user){
                  $scope.showlogin = true;
                  $localStorage.$reset();
              } else {
                  $scope.urlDirect();
              }
          }, function(error){
              $log.error(error);
          });
      } else {
          $scope.showlogin = true;
      }

      $scope.selectedTab = "Login";

      $scope.loginFields = {
          formData: formData,
          readOnly: false,
          showColonAfterLabel: true,
          showValidationSummary: false,
          validationGroup: "customerData",
          labelLocation: "left",
          onInitialized: function(e) {
              formInstance = e.component;
          },
          items: uxService.getloginData("Login")
      };

      $scope.loginData = {
          username: {
              bindingOptions:{
                  value: ""
              },
              editorOptions: {
                  placeholder: "Username"
              }
          }  ,
          password: {
              bindingOptions:{
                  value: ""
              },
              editorOptions: {
                  placeholder: "Password"
              }
          }
      }

      $scope.passIcon = "ms-Icon ms-Icon--RedEye";

      $scope.togglePassword = {
        bindingOptions: {
            icon: "passIcon"
        },
        text: "",
        onClick: function(e) {
            $scope.tooglePassWord = !$scope.tooglePassWord;
            if ($scope.tooglePassWord) {
                $("#password").dxTextBox("instance").option("mode", "text");
                $scope.passIcon = "ms-Icon ms-Icon--Hide";
                return false;
            }
            $("#password").dxTextBox("instance").option("mode", "password");
            $scope.passIcon = "ms-Icon ms-Icon--RedEye";
        }
      }

      $scope.submitOptions = {
            text: "Login",
            type: "success",
            useSubmitBehavior: true,
            validationGroup: "customerData",
            width: "100%",
            tabIndex: 4,
            template: function(data, container) {
                $("<div class='button-indicator'></div><span class='dx-button-text'>" + data.text + "</span>").appendTo(container);
                buttonIndicator = container.find(".button-indicator").dxLoadIndicator({
                    visible: false,
                    width: 16,
                    height: 16
                }).dxLoadIndicator("instance");
            },
            onClick: function() {

                // buttonIndicator.option("visible", true); 
                // $scope.setBtnPropterty = true;
            },
            bindingOptions: {
                disabled: "setBtnPropterty",
                visible: "setBtnVisibility"
            }
      };

      $scope.checkEmailValue = function(e) {
          console.log(e);
      }
 
      $scope.login = function(e) {
        $scope.setBtnVisibility = false;
        $scope.loginErr = "";
        if($scope.loginData.username.value == undefined || $scope.loginData.username.value == "")  {
            $scope.errorDailog = true;
            $scope.wdErrorRctx = "EMAIL_FIELD_EMPTY";
            $scope.WDXHOST = WDXHOST;
            $scope.setBtnVisibility = true;
            return false;
        }

        if($scope.loginData.password.value == undefined || $scope.loginData.password.value == "")  {
            $scope.setBtnVisibility = true;
            $timeout(function(){
                $("#password input").focus()
            }, -1000);
            return false;
        }

        if( !$scope.loginData.password.value || !$scope.loginData.username) return;
      
        formData = {
            "Username": $scope.loginData.username.value,
            "Password": $scope.loginData.password.value
        };

        loginService.loginPhx(WDXHOST, formData, "LOGON").then(function(res){
            if (res.data.ErrorCount != ""){

                if (res.data.error) {
                    $scope.loginSpinner = true;
                    $scope.loginErr = res.data.error;
                    $scope.setBtnVisibility = true;
                    return false;
                }
                $scope.errorDailog = true;
                $scope.wdErrorRctx = res.data.wd_Error_RCTX1;
                $scope.WDXHOST = WDXHOST;
                $scope.setBtnVisibility = true;
                return false;
            }

            var getCheckBox = $("#rememberUserName").dxCheckBox("instance");
            res.data['username'] = formData.Username;
            res.data['email'] = formData.Username;
            $localStorage.userData = res.data;
            $localStorage.host = WDXHOST;
            $localStorage.uploadLocation = res.data.uploadFolder;
            $localStorage.initals = res.data.ownerInital;
            $localStorage.serverName = res.data.servername;
            $localStorage.firmName = res.data.Firm;
            
            if(getCheckBox.option("value") == true) {
                localStorage.rememberUserName = formData.Username;
            } else {
                localStorage.rememberUserName = '';
            }

            $timeout(function(){
                $scope.getUserRights();
            }, 0);

        }, function(err){
            $scope.loginErr = "A request failed or a service did not respond";
            $scope.loginSpinner = true;
            $scope.setBtnVisibility = true;
        });
    }

      $scope.getUserRights = function() {
        loginService.userRights().then(function(res) {
            var rights = res.data.root;
            if (rights.Header.ErrorCount !== "") {
                $localStorage.userRights = RIGHTS;
                $scope.urlDirect()
                return false;
            }
            $localStorage.userRights = rights.items[0];
            $rootScope.getRights = $localStorage.userRights;
            $scope.urlDirect()
        }, function(err) {
            $localStorage.userRights = RIGHTS;
            $scope.urlDirect()
        });
      }

      $scope.urlDirect = function() {
          if (searchQuery.action) {
              $scope.actionType();
          } else {
              if($rootScope.checkIframe()){
                  $location.path('/home');
                  var iframeQuery = $location.search();
                  if(iframeQuery.query!=''){
                      localStorage.iframeQuery = iframeQuery.query;
                  }
              }else{
                  $location.path('/landing');
              }
          }
      }
      $scope.wdLangOption = {
        bindingOptions: {
            dataSource: "wdLanguageList",
        },
        value: $scope.wdLanguageList[0].code,
        displayExpr: "display",
        valueExpr: "code",
        placeholder: "Select a language",
        itemTemplate: "langItem",
        elementAttr: {
            class: "wdlangSelect"
        },
        fieldTemplate: "wdlangField",
        onValueChanged: function(e) {
            loginService.getVars(WDXHOST, "*LOGONFORM", e.value).then(function(res){
                var loginTxt = res.data.root.Dialog;
                $scope.getVarSucces(loginTxt, e.value);
            }, function(error) {
                $scope.setText();
            });
        },
        width: "356px"
      }

      $scope.getVarSucces = function(txt, e) {
            $scope.loginUiTxt = txt["1"];
            $scope.emailPlaceholder = txt["2"];
            $scope.passPlaceholder = txt["3"];
            $scope.rememberMe = txt["4"];
            $localStorage.wdCountryCode = e;
            $scope.spinner = false;
      }

      $scope.setText = function() {
            $scope.loginUiTxt = "Sign into Worldox Web";
            $scope.emailPlaceholder = "Email";
            $scope.passPlaceholder = "Password";
            $scope.rememberMe = "Remember password";
            $scope.spinner = false;
      }

      $scope.actionType = function() {
            var chkVersion = searchQuery.wdVer == undefined ? "" : searchQuery.wdVer;
            if (searchQuery.action == "save" && searchQuery.wdId) {
                $sessionStorage.urlPara = $location.search();
                $location.path('/upload').search({query: searchQuery.wdId, formats: searchQuery.Formats, hook: searchQuery.Hook, popupType: searchQuery.PopupType, wdVer: chkVersion });
            }
            else if (searchQuery.action == "save" && !searchQuery.wdId ) {
                $sessionStorage.urlPara = $location.search();
                $location.path('/upload').search({query: "", formats: searchQuery.Formats, hook: searchQuery.Hook, popupType: searchQuery.PopupType, multi: searchQuery.mult, desc: searchQuery.Desc, ext: searchQuery.Ext, wdVer: chkVersion });
            }
            else if (searchQuery.action == "WDL") {
                $window.location.href = ($localStorage.host + '/cgi-bin/wdwebcgi.exe?SERVE+wd_SID=' + $localStorage.userData.session + '+html=/api/apiList.json+loc=' + $localStorage.uploadLocation + '+domain=' + $localStorage.host + '+popFlag=' + searchQuery.PopupType);
            }
            else {
                if (searchQuery.attach) {
                    $sessionStorage.urlPara = $location.search();
                    $location.path('/home').search({query: searchQuery.wdId, attach: searchQuery.attach, noEdit: searchQuery.NotForEdit, popupType: searchQuery.PopupType});
                    return false;
                }
                if (searchQuery.wdId == undefined) {
                    $location.path('/landing')
                    return false;
                }
                $location.path('/home').search({ query: searchQuery.wdId });
            }
    }

    $scope.logInLoader = {
        width: 16,
        height: 16
    }

    $scope.testEnter = function(e) {
        if(e.event.keyCode == 13 && userAgent.indexOf('Frowser') != -1){
            $scope.setBtnVisibility = false;
            $scope.loginData.password.value = e.event.target.value;
            $scope.login();
        }
        //else{

            /*
            * fix IE enter after fill value username
            * */

            //$scope.loginData.username.value = e.event.target.value
        //}
    }

    $scope.chkPass = function(e) {
        console.log(e);
    }
}]);
