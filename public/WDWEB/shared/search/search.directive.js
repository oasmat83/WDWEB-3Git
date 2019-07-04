angular.module('WDWeb').
directive('wdxSearch',['$document', function ($document) {
  return {
      restrict: 'A',
      replace: true,
      templateUrl: './WDWEB/shared/search/search.html',
      scope: {
          clickOutside: '&'
      },
      link: function (scope, el, attr) {
        
      },
      controller: function($scope, $location, $localStorage, $rootScope, homeService, $timeout, $route) {

            $scope.searchBox = "";
            $scope.searchPlaceholder = "Search by Doc ID/Description";

     
            $scope.searchTypeFlag = 0; 
            $scope.contexualList = [
                { 
                    text: "Search by Doc ID/Description",
                    value: 0,
                    setTo: "Default",
                    onClick: function(e) {
                        $scope.searchPlaceholder = e.itemData.text;
                    }
                },
                { 
                    text: "Search by Text",
                    value: 1,
                    setTo: "",
                    onClick: function(e) {
                        $scope.searchPlaceholder = e.itemData.text;
                    }
                },
                { 
                    text: "Search Doc ID/Description and Text",
                    value: 2,
                    setTo: "",
                    onClick: function(e) {
                        $scope.searchPlaceholder = e.itemData.text;
                    }
                },
                { 
                    text: "Search Doc ID/Description or Text",
                    value: 3,
                    setTo: "",
                    onClick: function(e) {
                        $scope.searchPlaceholder = e.itemData.text;
                    }
                }
            ];

            $scope.searchTxtBox = {
                bindingOptions: {
                    value: "searchBox",
                    placeholder: "searchPlaceholder",
                },
                width: "100%",
                onValueChanged: function(e) {
                    $scope.searchBox = e.value.trim();
                },
                showClearButton: true,
                onKeyUp: function(e) {
                    if(e.event.keyCode == 13){
                        if (e.event.target.value == "") {
                            var data = { fileAction: false };
                            $rootScope.$broadcast("errorAction", {visible: true, rctx: "SEARCH_REQUIRED", data: data});
                            return false;
                        }
                        $rootScope.searchTemplateType = false;
                        $scope.searchWorldox(e.event.target.value);
                    }
                },
                onInitialized: function(e) {
                    setTimeout(function () {
                        e.component.focus();
                    }, 0);
                }
            }


            $scope.searchBtn = {
                icon: "ms-Icon ms-Icon--Search",
                onClick: function(e) {
                    if ($scope.searchBox == "") {
                        var data = { fileAction: false };
                        $rootScope.$broadcast("errorAction", {visible: true, rctx: "SEARCH_REQUIRED", data: data});
                        return false;
                    }
                    $rootScope.searchTemplateType = false;
                    $scope.searchWorldox($scope.searchBox);
                }
            }


            $scope.contexualMenuBtn = {
                icon: "ms-Icon ms-Icon--FabricFolderSearch",
                onClick: function() {
                    $("#navSearchContext").dxContextMenu("toggle", true);
                }
            }

            $scope.contexualMenu = {
                items: $scope.contexualList,
                target: "#contextSearchBtn",
                onItemClick: function(e) {
                    angular.forEach($scope.contexualList, function(key, idx) {
                        if (key.setTo == "Default") {
                            key.setTo = ""
                        }
                        if (key.text == e.itemData.text) {
                            key.setTo = "Default"
                        }
                    });
                    $scope.searchTypeFlag = e.itemData.value;
                },
                itemTemplate: "contextItem"
            }

            $scope.searchWorldox = function(e) {
                var locUrl = $location.search();
                var setQuery;
                if ($scope.searchTypeFlag === 1) {
                    $rootScope.title = "Text: " + e;
                    $rootScope.bc = "";
                    setQuery = '?t ' + encodeURIComponent(e);
                } else if ($scope.searchTypeFlag === 0) {
                    setQuery = encodeURIComponent(e);
    
                } else if ($scope.searchTypeFlag === 2){
                    setQuery = '?D ' + encodeURIComponent(e) + ' OR ?E ' + encodeURIComponent(e) + ' AND ?T ' + encodeURIComponent(e);
                } else {
                    setQuery = '?D ' + encodeURIComponent(e) + ' OR ?E ' + encodeURIComponent(e) + ' OR ?T ' + encodeURIComponent(e) + " OR";
                }
                $scope.chkRoute(locUrl, setQuery);
            }

            $scope.chkRoute = function(x, y) {
                $localStorage.isOpeningDocPanel = false;
                if (x.query !== y) {
                    $location.path('/home').search({query: y});
                    return false;
                };
                $route.reload();
            };

        }
    };
}]);
