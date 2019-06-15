(function() {
	angular.module('WDWeb').directive('wdTabs', ['$timeout', function($timeout) {
		return {
				templateUrl: './WDWEB/shared/navTabs.html',
				link: function(scope, element, attr) {
			}
		}
	}]).directive('flag',[ '$localStorage', 'wdService', function($localStorage, wdService) {
			return {
				restrict: 'E',
				replace: true,
				template: '<li ng-click="selectLanguage({lang})"><div class="flag-icon-background flag-icon-{{ country }}" >{{ full }}</div></li>',
				scope: {
					country: '@',
					full: '@',
					lang: '@'
				},
				link: function(scope, elm, attrs) {
					// Default flag size

					// scope.$watch('country', function(value) {
					// 	scope.country = angular.lowercase(value);
					// });

					scope.selectLanguage = function(x){
						scope.$emit('setWindow', {"isActive": true, "langType": x.lang});
						$localStorage.language = x.lang;
					}
				}
			};
		}]).directive('wdDialog', ['$localStorage', 'loginService', function($localStorage, loginService){
			return {
				scope: {
					visible: '=',
					rctx: '=',
					host: '=',
					data: '='
				},
				templateUrl: './WDWEB/shared/popup/popup.html',
				link: function(scope, element, attr) {},
				controller: function($scope, $localStorage, wdxLogoutService, $location, $route, $rootScope, $window, wdService, $sessionStorage, $timeout) {
					$scope.titlePopupFileChangedOptions = "";
					$scope.showClose = true;
					$scope.btnTxt = "";
					$scope.cancelTxt = "";
					$scope.wdShowBtn = false;
					$scope.wdShowCancel = false;
					$scope.radio = [];
					$scope.radioSelection = false;
					$scope.wdGroupValue = "";
					$scope.wdlDescTxt = "";
					$scope.wdDescVisible = false;
					var searchQuery = $location.search();

					$scope.wdRadioOpt = {
						bindingOptions: {
							items: "radio",
							value: 'wdGroupValue'
						},
						valueExpr: 'value',
						onValueChanged: function(e) {
							if (e.value == "wdl") {
								$scope.wdlDescTxt = $scope.data.desc;
								$scope.wdDescVisible = true;
							} else {
								$scope.wdlDescTxt = "";
								$scope.wdDescVisible = false;
							}
							$scope.wdGroupValue = e.value;
						}
					}

					$scope.wdlDesc = {
						bindingOptions: {
							value: 'wdlDescTxt',
							visible: 'wdDescVisible'
						}, 
						onValueChanged: function(e) {
							$scope.wdlDescTxt = e.value;
						},
						placeholder: "Description"
					}

					$scope.popupFileChangedOptions = {
						width: 'auto',
						height: 'auto',
						minWidth: 200,
						contentTemplate: "popupFileChangedTemplate",
						showTitle: true,
						dragEnabled: false,
						bindingOptions: {
							title: "dialogTxt.line1",
							visible: "visible",
							showCloseButton: "showClose",
							closeOnOutsideClick: "showClose"
						},
						elementAttr: {
							class: "wdDialogPopup"
						},
						maxWidth: '90vw',
						onShowing: function(e) {
							if($scope.rctx == "LOGOFF_QUES") {
								$scope.showClose = false;
							}
							loginService.getVars($scope.host, $scope.rctx, 'us').then(function(res) {
								var dialogData = res.data.root.Dialog;
								if (dialogData == "") {
									$scope.dialogTxt = {
										line1: "Error",
										line2: "Unknown error id '" + $scope.rctx + "'",
										line3: "",
										line4: "",
										line5: "",
										line6: "",
										line7: "FieldRequired, wdInfo",
										line8: "StatusErrorFull, wdErrorIco",
										line9: "",
										line10: ""
									}
									return false;
								}
								var setDialog = $scope.setDialogTxtType(dialogData)
								$scope.dialogTxt = setDialog

								$scope.setRadioBtn();
							}, function(error) {
								$scope.dialogTxt = {
									line1: "Failed Request",
									line2: "A request failed or a service did not respond",
									line3: "",
									line4: "",
									line5: "",
									line6: "",
									line7: "ServerProcesses, wdInfo",
									line8: "StatusErrorFull, wdErrorIco",		
									line9: "Refresh",
									line10: ""
								}
								$scope.wdShowBtn = true;
								$scope.btnTxt = $scope.dialogTxt.line9;
							});
						},
						onHiding: function(e) {
							$scope.radioSelection = false
						}
					};

					$scope.setDialogTxtType = function(res) {
						var setData = {}
						if($scope.data.fileAction) {
							setData = {
								line1: res['1'] !== undefined ? res['1'] : $scope.data.title,
								line2: res['2'] !== undefined ? res['2'] : $scope.data.doc,
								line3: res['3'] !== undefined ? res['3'] : $scope.data.desc,
								line4: res['4'] !== undefined ? res['4'] : "",
								line5: res['5'] !== undefined ? res['5'] : "",
								line6: res['6'] !== undefined ? res['6'] : "",
								line7: res['7'] !== undefined ? res['7'] : $scope.data.action,
								line8: res['8'] !== undefined ? res['8'] : "",
							}
						} else {
							setData = {
								line1: res['1'] !== undefined ? res['1'] : "Error",
								line2: res['2'] !== undefined ? res['2'] : "",
								line3: res['3'] !== undefined ? res['3'] : "",
								line4: res['4'] !== undefined ? res['4'] : "",
								line5: res['5'] !== undefined ? res['5'] : "",
								line6: res['6'] !== undefined ? res['6'] : "",
								line7: res['7'] !== undefined ? res['7'] : "",
								line8: res['8'] !== undefined ? res['8'] : "",

							}
						}

						if(res['9'] !== undefined) {
							$scope.wdShowBtn = true;
							$scope.btnTxt = res[9];
						}  

						if(res['10'] !== undefined) {
							$scope.wdShowCancel = true;
							$scope.cancelTxt = res[10];
						}  

						if (res['11'] !== undefined) {
							$scope.radioSelection = res['11'];
						}

						return setData
					}

					$scope.wdOkayBtn = {
						bindingOptions: {
							text: "btnTxt"
						},
						onClick: function(e) {
							$scope.setOkayFunc();
						},
						type: "success"
					}

					$scope.wdCancelBtn = {
						bindingOptions: {
							text: "cancelTxt"
						},
						onClick: function(e) {
							$scope.setCancelFunc();
						},
						type: "success"
					}

					$scope.setCancelFunc = function() {
						switch($scope.rctx) {
							case "WDRC_LISTID_INVALID":
							case "WDRC_FINDFILES_QUERY_TIMEOUT":
							case "WDRC_FINDFILES_QUERY_FAILED":
							case "WDRC_FINDFILES_QUERY_INVALID_FILTER":
							case "WDRC_FINDFILES_QUERY_UNDEFINED":
							case "WDRC_ZERO_FAVORITES_CLEAN":
								$location.path('/landing').search({});
								break;
							case "WDRC_ZERO_ITEMS_FILTER":
							case "WDRC_ZERO_FAVORITES_FILTER":
							case "WDRC_ZERO_FOLDER_FILTER":
							case "WDRC_ZERO_FOUND_FILTER":
							case "SEARCH_REQUIRED":
							case "FILE_UPLOAD":
							case "NOT_WDL_FILE":
							case "EDIT_PROFILE_STATUS":
							case "WDRC_ZERO_PROJECT_CLEAN":
							case "READ_ONLY":
							case "ATTACH_TYPE":
							case "WDRC_LOGON_USER_PASSWORD_INVALID":
							case "PASSWORD_FIELD_EMPTY":
							case "EMAIL_FIELD_EMPTY":
							case "WDRC_LOGON_USER_NAME_INVALID":
								$scope.visible = false;
								break;
						}
					}

					$scope.setOkayFunc = function() {
						switch ($scope.dialogTxt.line1) {
							case "LogOff":
								$scope.wdLogOff();
							break;
							case "Download":
							case "Open":
							case "Check-Out":
							case "Check-in":
							case "View":
							case "Edit Metadata":
							case "Copy":
							case "Move":
							case "Failed Request":
							case "Delete":
							case "Error":
							case "Edit":
							case "":
								$rootScope.$broadcast('closeAllPanel');
								$scope.wdRefresh();
							break;
							case "Warning: Large result list":
							case "Search":
								$scope.openSearchPanel();
							break;
							case "Read-Only":
								$scope.OpenReadOnly();
							break;
							case "Attach":
								if ($scope.rctx == "ATTACH_TYPE") {
									$scope.attachFile();
								} else {
									$rootScope.$broadcast('closeAllPanel');
									$scope.wdRefresh();
								}
							break
						}
					};

					$scope.wdLogOff = function() {
						wdxLogoutService.logout().then(function(res){
							$scope.redirectUrl()
						}, function(error) {
							$scope.redirectUrl()
						});
					}

					$scope.wdRefresh = function() {
						$route.reload();
					}

					$scope.redirectUrl = function() {
						if ($location.path() == "/upload") {
							$location.path('/login').search($sessionStorage.urlPara);
							delete $sessionStorage.urlPara;
							return false;
						}
						$location.path('/login');
						$location.url($location.path());
					}

					$scope.openSearchPanel = function() {
						$scope.visible = false;
						$rootScope.$broadcast("openSearchPanel");
					}

					$scope.OpenReadOnly = function() {
						$rootScope.$broadcast("readOnly");
						$scope.visible = false;
					}

					$scope.attachFile = function() {
						switch ($scope.wdGroupValue) {
							case "file":
								$window.location = $rootScope.readOnlyUrl;
								$timeout(function () {
									delete $rootScope.readOnlyUrl 
								}, -1000);
								break
							case "wdl":
								$scope.attachWDL();
								break
						}
					
					}

					$scope.setAttachement = function() {
						switch ($scope.wdGroupValue) {
							case "file":
								$window.location = $rootScope.readOnlyUrl;
								$timeout(function () {
									delete $rootScope.readOnlyUrl 
								}, -1000);
								break
							case "wdl":
								$scope.attachWDL();
								break
						}
					}

					$scope.attachWDL = function() {
						wdService.wdlOpen("new").then(function(res) {
							var wdl = res.data.project;
							if (wdl.errorStatus.ErrorCount !== ""){
								$scope.visible = true;
								$scope.rctx = wdl.errorStatus.wd_Error_RCTX;
								$scope.data.fileAction = false;
								return false
							}
							$scope.getWDLId(wdl.path);
						}, function(err) {
							$scope.visible = true;
							$scope.rctx = "FAILED_SERVER";
							$scope.data.fileAction = false;
						});
					}

					$scope.getWDLId = function(x) {
						wdService.getWdList(x, 0, 200).then(function(res) {
							var wdlData = res.data.root.Header;
							if (wdlData.ErrorCount !== "" && wdlData.wd_Error_RCTX !== "WDRC_ZERO_PROJECT_CLEAN") {
								$scope.visible = true;
								$scope.rctx = wdlDatas.wd_Error_RCTX;
								$scope.data.fileAction = false;
								return false;
							}
							$scope.updateWdl(wdlData['List_ID']);
						}, function(err) {
							$scope.visible = true;
							$scope.rctx = "FAILED_SERVER";
							$scope.data.fileAction = false;
						});
					}


					$scope.updateWdl = function(x) {
						var grid = $("#gridContainer").dxDataGrid("instance"),
						selected = grid.getSelectedRowsData();
						wdService.updateWdl(x, selected[0].FilePathReal).then(function(res) {
							$scope.setWdlDesc(x);
						}, function(err) {
							$scope.visible = true;
							$scope.rctx = "FAILED_SERVER";
							$scope.data.fileAction = false;
						});
					}

					$scope.setWdlDesc = function(x) {
						wdService.setWdlDesc(-1, 1, $scope.wdlDescTxt, x).then(function(res) {
							var addDesc = res.data.setField;
							if (addDesc.errorStatus.ErrorCount !== "") {
								$scope.visible = true;
								$scope.rctx = addDesc.errorStatus.wd_Error_RCTX;
								$scope.data.fileAction = false;
								return false;
							}
							var downloadData = { RN: -1, LID: x, LN: 0 };
							$scope.fileDownload(downloadData);
						}, function(err) {
							$scope.visible = true;
							$scope.rctx = "FAILED_SERVER";
							$scope.data.fileAction = false;
						});
					}

					$scope.fileDownload = function(dwnData) {
						wdService.download(dwnData).then(function(res) {
							var dwnLoadData = res.data.download;
							if (dwnLoadData.errorStatus.ErrorCount !== "") {
								$scope.visible = true;
								$scope.rctx = dwnLoadData.errorStatus.wd_Error_RCTX;
								$scope.data.fileAction = false;
								return false;
							}
							$timeout(function() {
								$window.location = $localStorage.host + '/cgi-bin/wdwebcgi.exe?SERVE+wd_SID=' + $localStorage.userData.session + '+html=/api/apiList.json+dwLoc=' + dwnLoadData.fileLoc + '+domain=' + $localStorage.host + '+popFlag=' + searchQuery.popupType + '+readOnly=1+name=' + dwnLoadData.fileLoc.split("OPEN/")[1];
							}, 0);
						  
						}, function(err) {
							$scope.visible = true;
							$scope.rctx = "FAILED_SERVER";
							$scope.data.fileAction = false;
						});
					}

					$scope.setRadioBtn = function() {
						if ($scope.rctx == "ATTACH_TYPE") {
							$scope.radio = [
								{text: "A full copy of the file", value: "file"},
								{text: "In a Worldox file list (internal use only)", value: "wdl"}
								// {text: "In a Worldox file list (internal use only)", disabled: true, value: "wdl"}
							];
							$scope.wdGroupValue = "file"
						}
					}

					$scope.wdChkBoxOpt = {
						text:  "Attach with Doc ID instead of Document Description",
						elementAttr: {
							id: "attachNme"
						}
					}

				}
			}
		}]);
		// .directive('wdHotkey', ['$localStorage', function($localStorage){
		// 	return {
		// 		scope: {
					
		// 		},
		// 		templateUrl: './WDWEB/shared/popup/hotkey.html',
		// 		link: function(scope, element, attr) {},
		// 		controller: function($scope, hotkeys) {
		// 			hotkeys.bindTo($scope).add({
		// 				combo: 'ctrl+d',
		// 				callback: function () {
		// 					console.log("Open Dialog")
		// 				}
		// 			});
		// 		}
		// 	}
		// }]);
  })();
