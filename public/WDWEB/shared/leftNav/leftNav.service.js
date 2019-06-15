'use strict'
angular.module('WDWeb').service('leftNavService', ['providerService', '$localStorage', 'TIMEOUT', function (providerService, $localStorage, TIMEOUT) {
    return {
        getLeftNavItem: getLeftNavItem,
        bookmarks: bookmarks,
        cabinets: cabinets,
        favMatters: favMatters,
        favorites: favorites,
        iniData: iniData,
        workspaces: workspaces,
        iniDataSet: iniDataSet,
        getChild: getChild,
        seqIniData: seqIniData
    };

    function getLeftNavItem(section) {
        let host = $localStorage.host !== undefined ? $localStorage.host : '';
        let session = $localStorage.userData !== undefined ? ($localStorage.userData.session !== undefined ? $localStorage.userData.session : '') : '';
        let username = $localStorage.userData !== undefined ? ($localStorage.userData.username !== undefined ? $localStorage.userData.username.split("@")[0] : '') : '';
        let jsonFile = '';
        switch (section) {
            case 'favorites':
                jsonFile = '/api/sideMenu/favorites.json';
                break;
            case 'bookmark':
                jsonFile = '/api/sideMenu/bookmarks.json';
                break;
            case 'matters':
                jsonFile = '/api/sideMenu/favMattersAccess.json+favId=access';
                break;
            case 'cabinets':
                jsonFile = '/api/sideMenu/cabinets.json';
                break;
        }

        var request = {
            method: 'GET',
            url: host + '/cgi-bin/wdwebcgi.exe?SERVE+wd_SID=' + session + '+html=' + jsonFile + '+wduser=' + username + "+wdIdUn=" + Date.now(),
            timeout: TIMEOUT.SIDEMENU
        };
        return providerService.getResource(request);
    }


    function bookmarks() {
        var request = {
            method: 'GET',
            url: $localStorage.host + '/cgi-bin/wdwebcgi.exe?SERVE+wd_SID=' + $localStorage.userData.session + '+html=/api/sideMenu/bookmarks.json+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now(),
        };
        return providerService.getResource(request);
    }
    function cabinets() {
        var request = {
            method: 'GET',
            url: $localStorage.host + '/cgi-bin/wdwebcgi.exe?SERVE+wd_SID=' + $localStorage.userData.session + '+html=/api/sideMenu/cabinets.json+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now()
        };
        return providerService.getResource(request);
    }
    function favMatters() {
        var request = {
            method: 'GET',
            url: $localStorage.host + '/cgi-bin/wdwebcgi.exe?SERVE+wd_SID=' + $localStorage.userData.session + '+html=/api/sideMenu/favMattersAccess.json+favId=access+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now()
        };
        return providerService.getResource(request);
    }
    function favorites() {
        var request = {
            method: 'GET',
            url: $localStorage.host + '/cgi-bin/wdwebcgi.exe?SERVE+wd_SID=' + $localStorage.userData.session + '+html=/api/sideMenu/favorites.json+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now()
        };
        return providerService.getResource(request);
    }
    function iniData(x, y) {
        var request = {
            method: 'GET',
            url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?SERVE+wd_SID=' + $localStorage.userData.session + '+html=/api/ini/iniRead.json+szSection=' + x + '+szINI=' + y + '+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now(),
            timeout: TIMEOUT.SIDEMENU
        };
        return providerService.getResource(request);
    }

    function seqIniData(x, y) {
        var request = {
            method: 'GET',
            url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?SERVE+wd_SID=' + $localStorage.userData.session + '+html=/api/ini/iniRead.json+szSection=' + x + '+szINI=' + y + '+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now(),
            timeout: TIMEOUT.SIDEMENU
        };
        return providerService.getResource(request);
    }

    function iniDataSet(sec, name, key, ini) {
        var request = {
            method: 'GET',
            url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?SERVE+wd_SID=' + $localStorage.userData.session + '+html=/api/ini/iniSet.json+szSection=' + sec + '+szINI=' + ini + '+szKey=' + key + '+szData=' + encodeURIComponent(name) + '+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now(),
            timeout: TIMEOUT.SIDEMENU
        };
        return providerService.getResource(request);
    }

    function workspaces(x, y, z) {
        var request = {
            method: 'GET',
            url: $localStorage.host + '/cgi-bin/wdwebcgi.exe?TREEVIEW+wd_SID=' + $localStorage.userData.session + '+html=/api/sideMenu/workspacesRoot.json+wd_List_ID=' + x + '+dwRecNum=' + y + '+dwExpand=' + z + '+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now(),
            timeout: TIMEOUT.SIDEMENU
            //url: $localStorage.host + '/cgi-bin/wdwebcgi.exe?SERVE+wd_SID=' + $localStorage.userData.session + '+html=/api/sideMenu/workspaces.json'
        };
        return providerService.getResource(request);
    }

    function getChild(x, y, z) {
        var request = {
            method: 'GET',
            url: $localStorage.host + '/cgi-bin/wdwebcgi.exe?SERVE+wd_SID=' + $localStorage.userData.session + '+html=/api/sideMenu/expandBranch.json+wd_List_ID=' + x + '+dwRecNum=' + y + '+dwExpand=' + z + '+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now(),
            timeout: TIMEOUT.SIDEMENU
        };
        return providerService.getResource(request);
    }


}]);
