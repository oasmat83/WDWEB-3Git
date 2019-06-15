'use strict'
angular.module('WDWeb').directive('wdxDelete',[ function () {
  return {
      restrict: 'E',
      replace: true,
      templateUrl: './WDWEB/shared/delete/delete.html',
      link: function(scope, element, attr) {},
      controller: function($scope, $log, $route, $timeout, uxService, deleteService, wdService) {
        var fileID = {};
        fileID = wdService.getFileData();
        $scope.deleteBtn = function() {
            $scope.spinner = false;
            if (fileID.Status === "49" || fileID.Status === "48"){
                $scope.spinner = true;
                $scope.deleteMessage = 'File cannot be deleted, while Checked-out.'
                DevExpress.ui.notify(fileID.DocId + "cannot be deleted while checked-out.", "error", 2000);
                return false;
            }
            deleteService.deleteFile(fileID).then(function(res){
                $timeout(function(){
                    uxService.setMessage("DocID: " + fileID.DocId + " deleted 'SUCCESSFULLY'!", "success");
                    $route.reload();
                }, 5000)
            }, function(error){
                var data = { fileAction: false };
                $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
            })
        }
      }
  };
}]);
