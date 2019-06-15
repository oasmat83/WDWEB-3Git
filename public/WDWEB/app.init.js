'use strict';

import { truncate } from "fs";

  var config = {
    service: {
      SERVER_HOST: 'localhost',
      PROTOCOL: 'http'
    }
  }
  angular.module('WDWeb', [
      'ngRoute',
      'ngStorage',
      'ngSanitize',
      'oc.lazyLoad',
      'dx',
      'pageslide-directive',
      'ngAnimate',
      'tooltips',
      'ui.tree',
      'ngWig',
      'ngCookies'
  ])
  .config(['$routeProvider', '$httpProvider', '$locationProvider', 'treeConfig', function ($routeProvider, $httpProvider, $locationProvider, treeConfig){
      console.log('Done loading dependencies and configuring module!');
      var setUrl = document.location,
      apiUrl = setUrl.protocol + "//" + setUrl.host,
      flg = truncate
      apiUrl = 'http://24.190.224.178'
    
      if (!$httpProvider.defaults.headers.get) {
          $httpProvider.defaults.headers.get = {};
      }
      $locationProvider.html5Mode({
          enabled: true,
          requireBase: true
      }).hashPrefix('!');

      treeConfig.defaultCollapsed = true;

      $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
      $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
      $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
      //$httpProvider.interceptors.push('timeoutHttpIntercept');
      $httpProvider.interceptors.push(function($location, $cookies, $localStorage, $rootScope) {
          return {
              'request': function(config) {
                
                  // do something on success
                  if(localStorage.getItem('ngStorage-userData')){
                      
                      var isRequestToApi = config.url.indexOf(apiUrl)>-1;
                      if(isRequestToApi){
                          var param = config.url.split("?")[1];
                          $.get(apiUrl + ':4804/index.html?' + param);
                          //config.timeout = 10000; 
                      }
                  } 
                  return config;
              },
              // optional method
              'response': function(response) {
                    var isRequestToApi = response.config.url.indexOf(apiUrl)>-1;
                    
                    if(isRequestToApi){
                        var isRequestValid = JSON.stringify(response.data);
                        if (isRequestValid.indexOf("WDRC_SID_INVALID") != -1) {
                            $localStorage.userData = undefined;
                            $rootScope.$broadcast('closeAllPanel');
                            $cookies.put('wdSession', 'noSession');
                        }
                    }
                    return response;
              },
            //   'responseError': function(response) {
            //     var isRequestToApi = response.config.url.indexOf(apiUrl)>-1,
                
            //     reStatus = response.status;
            //       if(isRequestToApi && flg){
            //           flg = false;
            //           localStorage.clear();
            //           $location.path('/login');
            //           return false;
            //       }
            //     return response;
            // }
          };
      });
      $routeProvider.when('/p1', { templateUrl: 'loader.html' })
  }])

.constant('TIMEOUT', {
    'FINDFILES' : 90000,
    "SERVE": 2000,
    "LOGIN": 10000,
    "SIDEMENU": 6000,
    "VIEW": 30000
}).constant('RIGHTS', {
    "Download": false,
    "View": false,
    "Search": false,
    "Direct Access": false,
    "Project": false,
    "Upload": false,
    "Cabinets": false,
    "Bookmarks": false,
    "Check-Out": false,
    "Check-In": false,
    "Edit Metadata": false,
    "Email": false,
    "Copy": false,
    "Move": false,
    "Delete": false,
    "TableAdd": false,
    "TableEdit": false,
    "TableDel": false
});
  

  angular.element(function() {
      angular.bootstrap(jQuery('#app'), ['WDWeb']);
  });

  angular.module('WDWeb').constant('WORLDOX_HOST', config.service.PROTOCOL + '://' + config.service.SERVER_HOST + '/');
  
