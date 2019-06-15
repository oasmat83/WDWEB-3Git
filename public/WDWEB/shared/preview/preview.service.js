'use strict'
angular.module('WDWeb').service('previewService', ['providerService', '$localStorage', 'TIMEOUT', function ( providerService, $localStorage, TIMEOUT ) {
    return {
        getSession: getSession,
        getPreview: getPreview
    }

    function getPreview(viewData) {
        var ts = Math.round((new Date()).getTime() / 1000);
        var request = {
            method: 'GET',
            url: $localStorage.host + viewData.fileLoc + '?cache=' + ts,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }
        return providerService.getResource(request);
    }
    function getSession(x, y) {
        var request = {
            method: 'GET',
            url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?VIEWFILE+wd_SID=' + $localStorage.userData.session + '+html=api/fileActions/previewer.json+wd_List_ID=' + x.LID + '+wd_List_RecNum=' + x.RN + '+OffsetCount=' + x.LN + '+wd_VIEW_JPEG_PATH=' + $localStorage.host + '^PATH^+reqId=' + y,
            timeout: TIMEOUT.VIEW
        }
        return providerService.getResource(request);
    }
}]);
