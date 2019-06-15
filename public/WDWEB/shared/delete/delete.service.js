'use strict'
angular.module('WDWeb').service('deleteService', ['providerService', '$localStorage', function ( providerService, $localStorage ) {
    return {
      deleteFile: deleteFile
    }

    function deleteFile (x) {
        var request = {
            method: 'GET',
            url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?DELFILE+wd_SID=' + $localStorage.userData.session + '+wd_List_ID=' + x.LID + '+Wd_List_RecNum=' + x.RN + '+HTMLOnOK=/fileFunctions/deleteFile.json+HTMLOnFail=/fileFunctions/deleteFailed.json'
        }
        return providerService.getResource(request);
    }
}]);
