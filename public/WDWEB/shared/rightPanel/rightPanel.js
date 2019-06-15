angular.module('WDWeb').controller("rightPanel", ['$scope', 'panels', function($scope, panels) {
    $scope.$on('rightHello', function(event, args) {
        console.log("dfd");
        $scope.message = args.message;
        panels.open("rightPanel");
    });
}]);