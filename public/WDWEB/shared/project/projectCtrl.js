angular.module('WDWeb').controller("projectCtrl", ['$scope', '$rootScope', '$route', '$routeParams', '$timeout', '$log', '$window', '$localStorage', '$location', 'template', 'wdService', 'homeService', function($scope, $rootScope, $route, $routeParams, $timeout, $log, $window, $localStorage, $location, template, wdService, homeService){
    var vm = this;
    $scope.uploadMode = "instantly";
    $scope.value = [];
    $scope.accept = 'wdl';
    vm.uploadToolBar = [
        { location: 'before', text: 'Project' }
    ];

    vm.openWDL = {
        uploadUrl: $localStorage.host + $localStorage.uploadLocation.split("/SAVE")[0] + '/upload-file.asp?+ID=11633',
        bindingOptions: {
            multiple: false,
            uploadMode: "uploadMode",
            value: "value"
        },
        labelText: "",
        onValueChanged: function(e) {
            var values = e.value;
            if (values.length != 0) {
                var count = values[0].name.split('.').length-1;
                var last = "";
                var ext = "";
                if (count == 1) {
                    last = 0;
                    ext = values[0].name.split('.');
                } else {
                    last = values[0].name.lastIndexOf('.');
                    ext = ([values[0].name.slice(0, last), values[0].name.slice(last + 1)]);
                }
                var capitalize = ext[1].toUpperCase();
                $.each(values, function(index, value) {
                    if(capitalize != "WDL") { 
                        e.element.find(".dx-fileuploader-files-container .dx-fileuploader-cancel-button").eq(index).trigger("dxclick");
                        return false
                    }
                    wdService.wdlOpen(values[0].name).then(function(res){
                        var getName = res.data.project;
                        if (getName.errorStatus.ErrorCount != "") {
                            return false
                        } 
                        $location.path('/home').search({ query: getName.path });
                    }, function(err) {
                        $log.error(err);
                    });
                });
            }
        }
    }
}]);