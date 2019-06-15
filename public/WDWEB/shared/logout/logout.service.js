'use strict'
angular.module('WDWeb').service('wdxLogoutService', ['providerService', '$localStorage', function ( providerService, $localStorage ) {
  return {
    logout: function () {
      var request = {
          method: 'GET',
          url: $localStorage.host + '/cgi-bin/wdwebcgi.exe?LOGOFF+wd_SID=' + $localStorage.userData.session + '+HTMLOnOK=/logoff/logoffSucc.json+HTMLOnFail=/logoff/logoffFail.json'
      }
      return providerService.getResource(request);
    }
  }
}]);
