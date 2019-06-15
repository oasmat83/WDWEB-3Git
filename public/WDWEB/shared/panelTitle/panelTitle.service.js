'use strict'
angular.module('WDWeb').service('panelTitleService', ['providerService', '$localStorage',function ( providerService, $localStorage ) {
  return {
    testProfile: testProfile,
    getCabinetList: getCabinetList
  }
  function testProfile(x, y){
      var request = {
          method: 'GET',
          url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?TESTPROFILE+wd_SID=' + $localStorage.userData.session + '+wd_File_Field1_Value=' + y.field1.value + '+wd_File_Field2_Value=' + y.field2.value + '+wd_File_Field3_Value=' + y.field3.value + '+wd_File_Field4_Value=' + y.field4.value + '+wd_File_Field5_Value=' + y.field5.value + '+wd_File_Field6_Value=' + y.field6.value + '+wd_File_Field7_Value=' + y.field7.value + '+5350=' + x.Cabinets.split("|")[0] + '+HTMLOnOK=/api/testprofile/test-profile.json+HTMLOnFail=/api/testprofile/test-profile.json+ID=10407+wd_File_Path_Filter=PATH+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now()
      }
      return providerService.getResource(request);
  }
  function getCabinetList() {
      var request = {
          method: "GET",
          url: $localStorage.host + 'cgi-bin/wdwebcgi.exe?SERVE+wd_SID=' + $localStorage.userData.session + '+html=/api/cabinets/uploadCabinet.json+wduser=' + $localStorage.userData.username.split("@")[0] + "+wdIdUn=" + Date.now()
      }
      return providerService.getResource(request);
  }
}]);
