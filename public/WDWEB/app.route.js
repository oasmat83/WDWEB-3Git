(function () {

  function routeConfigurator($routeProvider) {
    $routeProvider
      .when('/login', {
        controller: 'loginController',
        templateUrl: './WDWEB/components/login/login.html',
        resolve: {
              lazy: ['$ocLazyLoad', function($ocLazyLoad) {
                  return $ocLazyLoad.load([{
                      name: 'WDWeb',
                      files: ['./WDWEB/components/login/loginController.js']
                  }]);
              }],
              load: function(wdService){
                wdService.showElements({
                    showNav: false,
                    location: '/login'
                });
              }
          }
      })
      .when('/landing', {
        controller: 'landingController as la',
        templateUrl: './WDWEB/components/landing/landing.html',
        resolve: {
              lazy: ['$ocLazyLoad', function($ocLazyLoad) {
                  return $ocLazyLoad.load([{
                      name: 'WDWeb',
                      files: ['./WDWEB/components/landing/landingCtrl.js']
                  }]);
              }],
              load: function(wdService){
                wdService.showElements({
                    showNav: true,
                    location: '/landing'
                });
              }
          }
      })
      .when('/home',  {
        templateUrl: './WDWEB/components/home/home.html',
        controller: 'homeController as home',
        resolve: {
              lazy: ['$ocLazyLoad', function($ocLazyLoad) {
                  return $ocLazyLoad.load([{
                      name: 'WDWeb',
                      files: ['./WDWEB/components/home/homeController.js']
                  }]);
              }],
              load: function(wdService){
                wdService.showElements({
                    showNav: true,
                    location: '/home'
                })
              }
          }
      })

      .when('/upload',  {
        templateUrl: './WDWEB/components/upload/uploadCtrl.html',
        controller: 'uploadCtrl',
        resolve: {
              lazy: ['$ocLazyLoad', function($ocLazyLoad) {
                  return $ocLazyLoad.load([{
                      name: 'WDWeb',
                      files: ['./WDWEB/components/upload/uploadCtrl.js']
                  }]);
              }],
              load: function(wdService){
                wdService.showElements({
                    showNav: false,
                    location: '/upload'
                })
              }
          }
      })

      .when('/cabinets',  {
        templateUrl: './WDWEB/shared/cabinet/cabinets.html',
        controller: 'cabinetCtrl as cab',
        resolve: {
              lazy: ['$ocLazyLoad', function($ocLazyLoad) {
                  return $ocLazyLoad.load([{
                      name: 'WDWeb',
                      files: ['./WDWEB/shared/cabinet/cabinetCtrl.js']
                  }]);
              }],
              load: function(wdService){
                wdService.showElements({
                    showNav: true,
                    location: '/cabinets'
                })
              }
          }
      })

      .otherwise({ redirectTo: '/login' });
  }
  var WDWeb = angular.module('WDWeb');
  WDWeb.config(['$routeProvider', routeConfigurator]);


})();
