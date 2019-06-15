'use strict'
angular.module('WDWeb').service('loginService', ['providerService', 'TIMEOUT', '$localStorage', function ( providerService, TIMEOUT, $localStorage ) {
  
  return {
    loginPhx: function ( host, data, type ) {
      var request = {
        method: 'POST',
        url: host + 'cgi-bin/wdwebcgi.exe?' +  type + "+i=" + Date.now(),
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        transformRequest: function(obj) {
          var str = [];
          for(var p in obj)
          str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
          return str.join("&");
        },
        data: {
          wd_Server_Name_Value: "*",
          wd_Server_Password_Value: "*",
          wd_User_Code_Value: data.Username,
          wd_User_Password_Value: data.Password,
          HTMLONOK: "/api/authentication/login.json",
          HTMLONFAIL: "/api/authentication/loginFail.json"
        },
        timeout: TIMEOUT.LOGIN
      }
      return providerService.getResource(request);
    },
    getVars: function(host, x, y) {
      var request = {
        method: 'GET',
        url: host + 'cgi-bin/wdwebcgi.exe?SERVE+i=' + Date.now() + '+szVar=' + x + '+wd_USER_CODE_ISO2=' + y + '+html=/api/errorLog/getVar.json',
        timeout: TIMEOUT.SERVE
        //timeout: 1*60 * 1000,
      }
      return providerService.getResource(request);
    },
    userRights: function() {
      var request = {
        method: 'GET',
        url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?SERVE+wd_SID=' + $localStorage.userData.session + '+HTMLOnOK=/api/authentication/userRights.json+HTMLOnFail=/api/authentication/userRights.json',
        timeout: TIMEOUT.SERVE
      }
      return providerService.getResource(request);
    }
  }

  // function getVars() {
  //   var request = {
  //     method: 'GET',
  //     url: $localStorage.host + '/cgi-bin/wdwebcgi.exe?SERVE+HTMLOnOK=/api/errorLog/getVar.json+wdIdUn=' + Date.now(),
  //   }
  // }
}]);
