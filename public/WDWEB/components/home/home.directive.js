angular.module('WDWeb').directive('wdProjects', function($localStorage, $location, wdService, homeService, $rootScope) {
    return {
        templateUrl: './WDWEB/shared/project/wdl.html',
        link: function(scope, element, attr) {
            scope.uploadMode = "instantly";
            scope.value = [];
            scope.wdlUpload = {
                uploadUrl: $localStorage.host + $localStorage.uploadLocation + "?id=" + Date.now(),
                labelText: "",
                selectButtonText: "Project",
                width: 65,
                bindingOptions: {
                    //multiple: false,
                    uploadMode: "uploadMode",
                    value: "value"
                },
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
                                var data = { fileAction: false };
                                $rootScope.$broadcast("errorAction", {visible: true, rctx: "NOT_WDL_FILE", data: data});
                                return false
                            }
    
                        });
                    }
                },
                onUploadError: function(e) {
                    var data = { fileAction: false };
                    $rootScope.$broadcast("errorAction", {visible: true, rctx: "FILE_UPLOAD", data: data});
                },
                onUploaded: function(e) {
                    wdService.wdlOpen(e.file.name).then(function(res){
                        var getName = res.data.project;
                        if (getName.errorStatus.ErrorCount != "") {
                            var data = { fileAction: false };
                            $rootScope.$broadcast("errorAction", {visible: true, rctx: getName.errorStatus.wd_Error_RCTX, data: data});
                            e.component.reset();
                            return false
                        }
                        e.component.reset();
                        $location.path('/home').search({ query: "Project: " + getName.path });
                    }, function(err) {
                        var data = { fileAction: false };
                        $rootScope.$broadcast("errorAction", {visible: true, rctx: "FAILED_SERVER", data: data});
                    });
                }
            }
        }
    }
});