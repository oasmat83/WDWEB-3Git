'use strict'
angular.module('WDWeb').directive('wdxEmail',[ function () {
  return {
      restrict: 'E',
      replace: true,
      templateUrl: './WDWEB/shared/email/email.html',
      link: function(scope, element, attr) {},
      controller: function($scope, $localStorage, $log, $route, emailService, wdService, homeService, $rootScope, $window) {
            var rn = [];
            var rnList = "";
            var fileID = {};
            $scope.loadPreview = true;
            $scope.wdlName = false;
            $scope.wdSubjectFlag = true;
            $scope.listOfEmails = {"to": "", "cc": "", "bcc": ""};
            $scope.editableEmails = [$localStorage.userData.email];
            $scope.onCustomItemCreating = function(args) {
                var newValue = args.text;
                    $scope.editableEmails.unshift(newValue);
                    args.customItem = newValue;
            }
            $scope.emailTitle = [
                { location: 'before', text: 'Email' }
            ];
            

            angular.element($window).bind('resize', function() {
                var chkEmailScroll = $("#emailContainer").dxScrollView("instance");
                if (chkEmailScroll !== undefined) {
                    $("#emailContainer").dxScrollView("instance").option("height", (window.innerHeight - 250));
                };
            });

            $scope.scrollEmail = {
                scrollByContent: true,
                scrollByThumb: true, 
                showScrollbar: "always",
                height: function() {
                    return window.innerHeight - 250;
                },
                useNative: true
            };

            $scope.onCustomFocusOut = function (e) {
                var input = e.component.field();
                var event = jQuery.Event("keydown");
                event.keyCode = 13;
                event.which = 13;
                input.trigger(event);
            };

            $scope.onValueChanged = function(args) {
                var emailList = args.value,
                    strEmail = emailList.toString(),
                    replaceComma = strEmail.replace(/,/g, ';');
                    if (args.element[0].id == "emailTo") {
                    $scope.listOfEmails.to = replaceComma;
                    } else if (args.element[0].id == "emailCC") {
                    $scope.listOfEmails.cc = replaceComma;
                    } else {
                        $scope.listOfEmails.bcc = replaceComma;
                    }
            };

            $scope.keyDownSubj = function(sub) {
                $scope.wdSubjectFlag = false;
            };

            $scope.setWdlValue = function(xn){
                if ($scope.wdlName) {
                    $scope.emailData.wdlName = xn;
                    return false;
                }
                $scope.emailData.wdlName = "";
            };
            
            $scope.$watch(function() {
                return homeService.getSelectedList();
            }, function(newData) {
                $scope.newEmailData = newData;
                rn = [];
                $scope.emailData.Subject = "Emailing: " + newData.Name;
                $scope.setWdlValue(newData.Description);
                $scope.fileSelection = newData;
                rn.push(newData.RN);
                rnList = rn.toString();
            });

            $scope.attachOption = [{"display": "File", "value": "File"}, {"display": "Worldox Link", "value": "Link"}];

            $scope.emailData = {
                "To": "",
                "CC": "",
                "bc": "",
                "Subject": "",
                "Attach": "File",
                "Body": "",
                "wdlName": ""
            };

            $scope.btnTxt = "Send";
            //$scope.sendBtnIco = "";

            $scope.emailBtn = {
                bindingOptions: {
                    text: "btnTxt"
                    // icon: "sendBtnIco",
                },
                type: "success",
                useSubmitBehavior: true
            };

            $scope.sendToUser = function() {
                wdService.isFileHasChanged().then(function (hasChanged) {
                    if(hasChanged.confirm){
                        $rootScope.$broadcast('showMessageWhenFileChanged', {title:'Edit Metadata', desc:hasChanged.res[0].Description, docid:hasChanged.res[0].DocId});
                        $rootScope.$broadcast('setConfirmHashChanged', {fnc:function(){
                            $('#popupFileChangedOptions').dxPopup().dxPopup("instance").hide();
                            var fileType;
                            $scope.spinner = false;
                            $scope.btnTxt = "Sending";
                            $scope.loadPreview = false;

                            if ($scope.emailData.Attach === "File") {
                                fileType = 1
                            } else {
                                fileType = 0
                            }

                            if ($scope.text == undefined) {
                                txtBody = "";
                                console.log("message undefined");
                            }
                            // Convert decode to template html to display in gmail
                            var txtBody = $scope.text;
                            var parser = new DOMParser;
                            var dom = parser.parseFromString(
                                '<!DOCTYPE html><body>' + txtBody,
                                'text/html');
                            var decodedStringBody = dom.documentElement.outerHTML;

                            emailService.sendEmailService($scope.emailData, $scope.newEmailData, fileType, rnList, $scope.listOfEmails, decodedStringBody).then(function(res) {
                                var emailResponse = res.data.fileStatus;
                                $scope.$parent.$parent.$parent.$parent.dialogTitle = "Email";
                                if (emailResponse.errorStatus.ErrorCount != "") {
                                    $scope.errorType(emailResponse);
                                    $scope.loadPreview = true;
                                    $scope.btnTxt = "Send";
                                    return false;
                                }
                                $scope.loadPreview = true;
                                $scope.btnTxt = "Send";
                                var setErrorData = { title: $scope.newEmailData.DocId, desc: $scope.newEmailData.Description, wdMsg: "File emailed successfully", status: "success", action: "Email" };
                                $rootScope.$broadcast('setDialogStatus', setErrorData);
                            }, function(error) {
                                $scope.loadPreview = true;
                                $scope.btnTxt = "Send";
                                DevExpress.ui.notify("Email FAILED!", "error", 4000);
                            });
                            $(this).off();
                        }});
                    }else{
                        var fileType;
                        $scope.spinner = false;
                        $scope.btnTxt = "Sending";
                        $scope.loadPreview = false;

                        if ($scope.emailData.Attach === "File") {
                            fileType = 1
                        } else {
                            fileType = 0
                        }

                        if ($scope.text == undefined) {
                            txtBody = "";
                            console.log("message undefined");
                        }
                        // Convert decode to template html to display in gmail
                        var txtBody = $scope.text;
                        var parser = new DOMParser;
                        var dom = parser.parseFromString(
                            '<!DOCTYPE html><body>' + txtBody,
                            'text/html');
                        var decodedStringBody = dom.documentElement.outerHTML;

                        emailService.sendEmailService($scope.emailData, $scope.newEmailData, fileType, rnList, $scope.listOfEmails, decodedStringBody).then(function(res) {
                            var emailResponse = res.data.fileStatus;
                            $scope.$parent.$parent.$parent.$parent.dialogTitle = "Email";
                            if (emailResponse.errorStatus.ErrorCount != "") {
                                var data = {title: "Email", desc: $scope.newEmailData.Description, doc: $scope.newEmailData.DocId, action: "Mail, wdInfo", fileAction: true}
                                $scope.setPopupDailog(true, emailResponse.errorStatus.wd_Error_RCTX, data);
                                $scope.loadPreview = true;
                                $scope.btnTxt = "Send";
                                return false;
                            }
                            $scope.loadPreview = true;
                            $scope.btnTxt = "Send";
                            var data = {title: "Email", desc: $scope.newEmailData.Description, doc: $scope.newEmailData.DocId, action: "Mail, wdInfo", fileAction: true}
                            $scope.setPopupDailog(true, "*EMAIL_SUCCESS", data);
                            // var setErrorData = { title: e.DocId, desc: e.Description, wdMsg: "File emailed successfully", status: "success", action: "Email" };
                            // $rootScope.$broadcast('setDialogStatus', setErrorData);
                        }, function(error) {
                            $scope.loadPreview = true;
                            $scope.btnTxt = "Send";
                            DevExpress.ui.notify("Email FAILED!", "error", 4000);
                        });
                    }
                })
            };

            $scope.errorType = function(emailResponse) {
                var setErrorData;
                if (emailResponse.errorStatus.wd_Error_DOCID !== "") {
                    setErrorData = { title: emailResponse.errorStatus.wd_Error_DOCID, desc: emailResponse.errorStatus.wd_Error_DOCNAME, wdMsg: emailResponse.errorStatus.wd_Error_MSG, status: "failed", type: false, action: "Email" };
                    $rootScope.$broadcast('setDialogStatus', setErrorData);
                    return false;
                }
                
                setErrorData = { wdMsg: emailResponse.errorStatus.wd_Error_MSG, status: "failed", type: true, action: "Email" };
                $scope.$parent.fileErrorMessage.push(setErrorData);
                $scope.$parent.fileError = true;
                $scope.$parent.errorTypeDialog = "action";
                $rootScope.$broadcast('setDialogStatus', setErrorData);
        
            }

            $scope.checkTo = {
                validationRules: [{ type: "required", "message": "Email 'TO' is required!" }]
            };

            $scope.wdGetAttach = function(xn) {

                if (xn.value == "Link") {

                    $scope.wdlName = true;
                    $scope.emailData.wdlName = $scope.fileSelection.Description;
                    // if ($scope.fileSelection.length == 1) {
                    //     $scope.emailData.wdlName = $scope.fileSelection[0].Description;
                    // } else {
                    //     var date = new Date();
                    //     var month = Number(new Date().getMonth()) + Number(1);
                    //     var hours = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
                    //     var am_pm = date.getHours() >= 12 ? "PM" : "AM";
                    //     var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
                    //     var seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
                    //     $scope.emailData.wdlName = $scope.fileSelection.length + " files [" + $localStorage.initals + " " + month + "-" + new Date().getDate() + "-" + new Date().getFullYear() + " " + hours + "." + minutes + "." + seconds + " " + am_pm + "]";
                    // }

                    // return false
                }

                $scope.emailData.wdlName = "";
                $scope.wdlName = false;
            };
        }
    };
}]);
