angular.module('WDWeb').controller("emailController",
['$scope', '$localStorage', '$log', '$route', 'emailService', 'wdService',
function($scope, $localStorage, $log, emailService, wdService, $route){
    // var fileID = {};
    //
    // $scope.emailData = {
    //     "To": "",
    //     "CC": "",
    //     "BCC": $localStorage.userData.email,
    //     "Subject": "",
    //     "Body": "",
    //     "Attach": ""
    // };
    //
    // $scope.emailBtn = {
    //     text: "Send",
    //     type: "success",
    //     useSubmitBehavior: true,
    //     validationGroup: "emailFile"
    // }
    //
    // $scope.emailFields = {
    //     bindingOptions: {
    //         formData: "emailData",
    //         readOnly: false,
    //         showColonAfterLabel: false,
    //         showValidationSummary: false,
    //         colCount: 1,
    //         validationGroup: "emailFile"
    //     },
    //     items: emailService.sendEmail
    // }
    //
    // $scope.sendToUser = function(e) {
    //     var fileType;
    //     $scope.spinner = false;
    //     if ($scope.emailData.Attach == "File") {
    //         fileType = 1
    //     } else {
    //         fileType = 0
    //     }
    //     wdService.sendEmail($scope.emailData, e, fileType).then(function(res){
    //         emailService.setMessage("DocID: " + fileID.DocId + " 'SUCCESSFULLY' emailed the file!", "success");
    //         $route.reload();
    //     }, function(error) {
    //         emailService.setMessage("DocID: " + fileID.DocId + " 'FAILED' to email file!", "error");
    //         $log.error(error);
    //         $route.reload();
    //     });
    // }
}]);
