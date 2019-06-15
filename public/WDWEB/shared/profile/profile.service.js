'use strict'
angular.module('WDWeb').service('profileService', ['providerService', '$localStorage', function ( providerService, $localStorage ) {
    var setMyDesc = {};

    return {
        submitComment: submitComment,
        setDesc: setDesc,
        getDesc: getDesc
    }

    function setDesc (x) {
        setMyDesc = x;
    }

    function getDesc () {
        return setMyDesc;
    }

    function submitComment(x, y) {
        var request = {
            method: 'GET',
            url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?SERVE+wd_SID=' + $localStorage.userData.session + '+Html=/fileFunctions/comments.json+wd_List_RecNum=' + y.RN + '+wd_List_ID=' + y.LID + '+wdComment=' + x
        }
        providerService.getResource(request);
    }
}]);
