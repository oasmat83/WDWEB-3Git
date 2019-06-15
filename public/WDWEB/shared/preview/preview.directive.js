'use strict'
angular.module('WDWeb').directive('wdxPreview',[ function () {
  return {
      restrict: 'E',
      replace: true,
      templateUrl: './WDWEB/shared/preview/preview.html',
      link: function(scope, element, attr) {
          scope.resetToolbarPreparing = function(){
              setTimeout(function(){
                  var getLeftNavWidth = $("#leftNav").dxResizable("instance").option("width");
                  $("#gridContainer").css("width", (window.innerWidth - getLeftNavWidth)).css("max-width", (window.innerWidth - getLeftNavWidth));
                  $("#listTitle").css({'max-width': "0px", "width" : "0px"});
                  $("#gridContainer").dxDataGrid("instance")._windowResizeCallBack();
                  scope.setTitleHeaderWidth();
              }, -1);
          };
          scope.setTitleHeaderWidth = function(){
              $("#listTitle").css({'max-width': "0px", "width" : "0px"});
              var width_header = $("#gridContainer .dx-datagrid-header-panel").width();
              var width_after = $("#gridContainer .dx-datagrid-header-panel .dx-toolbar-after").width();
              var width_before = parseInt(width_header)-parseInt(width_after)-50;
              setTimeout(function(){
                  $("#listTitle").css({'max-width': width_before+"px", "width" : width_before+"0px"});
              }, 100);
          }
      }
  };
}]);
