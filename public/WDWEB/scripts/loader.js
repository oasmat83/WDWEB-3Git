var scoped = angular.element($("#app")).scope();

window.addEventListener("load", function (event) {
    var setTime = -1000;
    setTimeout(function () {
        var element = document.getElementById("overlay");
        var bdy = document.getElementsByTagName('body')[0];
        if(window.location.href.indexOf("/home") == -1 && window.location.href.indexOf("action=save") == -1 && window.location.href.indexOf("/upload") == -1) {
            element.classList.add("loaded");
        }
        if(window.location.href.indexOf("action=save") != -1){
            setTimeout(function(){
                element.classList.add("loaded");
            }, 3000)
        }
        if(window.location.href.indexOf("/upload") != -1) {
            setTimeout(function () {
                element.classList.add("loaded");
            }, 2500)
        }
        bdy.classList.remove("overflow");
    }, setTime);
});


function wdFrowser(e) {
    var idxGrid = $("#gridContainer").dxDataGrid("instance");
    var list = idxGrid.getDataSource().items();
    var idx;
    for(var i = 0; i < list.length; i++) {
        if (list[i].FilePathReal.toUpperCase() == e.toUpperCase()) {
            var scope = angular.element($("#app")).scope();
            idx = parseInt(list[i].LN) - 1;
            idxGrid.selectRowsByIndexes(idx);
            scope.$apply(function(){
                scope.$broadcast('updateDataGrid', {"idx": idx})
            });
            return false;
        }
    }
};

function reloadGrid() {
    location.reload();
    console.log("Function was init from the frowser");
};

function showloader(x) {
    var scope = angular.element($("#app")).scope();
    scope.$apply(function(){
        scope.$broadcast('updateGridLoader', {"message": x})
    });
}

function doLogoff() {
    // var scope = angular.element($("#app")).scope();
    // scope.$apply(function(){
    //     scope.$broadcast("frowserLogOff");
    // });
};

function userData() {
    var data = localStorage.getItem('ngStorage-userData');
    // convert = JSON.parse(data);
    return data
}