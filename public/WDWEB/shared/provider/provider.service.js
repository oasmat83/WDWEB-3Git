'use strict'
angular.module('WDWeb').service('providerService', ['$http', '$q', function ($http, $q) {
    return {
        getResource: function (request) {
            var defer = $q.defer();

            //Determine if to send the server call if for VtabTree and there is a response in storage
            //Using session storage so will be removed when tab closes
            var sendCall = true;
            if (request.url.indexOf('VtabTree') != -1) {
                if (sessionStorage.getItem("VtabTree")) {
                    sendCall = false;
                }
            }

            if (sendCall) {
                $http(request).then(
                    function successService(response) {
                        //If response is VtabTree, store the response to allow easy load later in session
                        if (request.url.indexOf('VtabTree') != -1) {
                            sessionStorage.setItem("VtabTree", JSON.stringify(response));
                            console.log(response);
                        }
                        
                        defer.resolve(response);
                    },
                    function failService(response) {
                        defer.reject('Failed to load resource.');
                    });
            }
            else {
                //Just send the stored response in session storage
                defer.resolve(JSON.parse(sessionStorage.getItem("VtabTree")));
            }

            return defer.promise;
        }
    }
}]);
