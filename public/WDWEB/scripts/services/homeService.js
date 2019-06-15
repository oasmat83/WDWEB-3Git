'use strict'
angular.module('WDWeb').service('homeService',
['$http', '$localStorage', '$rootScope', '$location', 'wdService', '$log',
function ( $http, $localStorage, $rootScope, $location, wdService, $log ) {
    var panelValue = 1;
    var favMatter = [];
    var selected = "";
    var cabinet = false;
    var title = {};
    var selectedFiles = [];
    var email = {};
    function handleDate(date) {
        return date[0] + ", " + date[1] + " " + date[2] +", " + date[3];
    }
    var date = new Date(Date.now());
    var startLastMonth = new Date(date.getFullYear(), date.getMonth() -1, 1);
    var endLastMonth = new Date(date.getFullYear(), date.getMonth() , 0);
    var newDate = new Date(Date.now()).toDateString().split(" ");
    var LastMonday="";
    var LastTuesday="";
    var LastWednesday ="";
    var LastThursday ="";
    var LastFriday = "";
    var LastSaturday = "";
    var LastSunday = "";
    switch (newDate[0]) {
        case 'Mon':
            LastMonday = new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -7));
            LastTuesday = new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -6));
            LastWednesday = new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -5));
            LastThursday = new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -4));
            LastFriday = new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -3));
            LastSaturday = new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -2));
            LastSunday =new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -1));
            break;
        case 'Tue':
            LastMonday = new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -8));
            LastTuesday = new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -7));
            LastWednesday = new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -6));
            LastThursday = new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -5));
            LastFriday = new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -4));
            LastSaturday = new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -3));
            LastSunday =new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -2));
            break;
        case 'Wed':
            LastMonday = new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -9));
            LastTuesday = new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -8));
            LastWednesday = new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -7));
            LastThursday = new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -6));
            LastFriday = new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -5));
            LastSaturday = new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -4));
            LastSunday =new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -3));
            break;
        case 'Thu': 
            LastMonday= new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -10));
            LastTuesday = new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -9));
            LastWednesday = new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -8));
            LastThursday = new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -7));
            LastFriday = new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -6));
            LastSaturday = new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -5));
            LastSunday =new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -4));
            break;
        case 'Fri':
            LastMonday= new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -11));
            LastTuesday = new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -10));
            LastWednesday = new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -9));
            LastThursday = new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -8));
            LastFriday = new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -7));
            LastSaturday = new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -6));
            LastSunday =new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -5));
            break;
        case 'Sat':
            LastMonday= new  Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -12));
            LastTuesday = new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -11));
            LastWednesday = new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -10));
            LastThursday = new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -9));
            LastFriday = new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -8));
            LastSaturday = new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -7));
            LastSunday =new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -6));
            break;
        case 'Sun':
            LastMonday =new  Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -13));
            LastTuesday = new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -12));
            LastWednesday = new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -11));
            LastThursday = new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -10));
            LastFriday = new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -9));
            LastSaturday = new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -8));
            LastSunday =new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -7));
            break;
    }
    var startDates = [
        {value: '0.0', Title: '',date:''},
        {value: '1.1', Title: 'Today', date: handleDate(new Date(Date.now()).toDateString().split(" "))},
        {value: '1.2', Title: 'Yesterday', date:handleDate(new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -1)).toDateString().split(" "))},
        {value: '1.3', Title: 'Last Monday', date:handleDate(LastMonday.toDateString().split(" "))},
        {value: '1.4', Title: 'Last Tuesday', date:handleDate(LastTuesday.toDateString().split(" "))},
        {value: '1.5', Title: 'Last Wednesday', date:handleDate(LastWednesday.toDateString().split(" "))},
        {value: '1.6', Title: 'Last Thursday', date:handleDate(LastThursday.toDateString().split(" "))},
        {value: '1.7', Title: 'Last Friday', date:handleDate(LastFriday.toDateString().split(" "))},
        {value: '1.8', Title: 'Last Saturday', date:handleDate(LastSaturday.toDateString().split(" "))},
        {value: '1.9', Title: 'Last Sunday', date:handleDate(LastSunday.toDateString().split(" "))},
        {value: '1.10', Title: '1st of Last Mo.', date:handleDate(new Date(startLastMonth).toDateString().split(" "))},
        {value: '1.11', Title: 'End of Last Mo.',date:handleDate(new Date(endLastMonth).toDateString().split(" "))},
        {value: '1.12', Title: '7 Days Ago',date:handleDate(new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -7)).toDateString().split(" "))},
        {value: '1.13', Title: '14 Days Ago',date:handleDate(new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -14)).toDateString().split(" "))},
        {value: '1.14', Title: '30 Days Ago',date:handleDate(new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -30)).toDateString().split(" "))},
        {value: '1.15', Title: '60 Days Ago',date:handleDate(new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -60)).toDateString().split(" "))},
        {value: '1.16', Title: '90 Days Ago',date:handleDate(new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -90)).toDateString().split(" "))},
        {value: '1.17', Title: 'Last Month',date:handleDate(new Date(new Date(Date.now()).setUTCMonth(new Date(Date.now()).getUTCMonth()-1)).toDateString().split(" "))},
        {value: '1.18', Title: '2 Months Ago',date:handleDate(new Date(new Date(Date.now()).setUTCMonth(new Date(Date.now()).getUTCMonth()-2)).toDateString().split(" "))},
        {value: '1.19', Title: '3 Months Ago',date:handleDate(new Date(new Date(Date.now()).setUTCMonth(new Date(Date.now()).getUTCMonth()-3)).toDateString().split(" "))},
        {value: '1.20', Title: '4 Months Ago',date:handleDate(new Date(new Date(Date.now()).setUTCMonth(new Date(Date.now()).getUTCMonth()-4)).toDateString().split(" "))},
        {value: '1.21', Title: '5 Months Ago',date:handleDate(new Date(new Date(Date.now()).setUTCMonth(new Date(Date.now()).getUTCMonth()-5)).toDateString().split(" "))},
        {value: '1.22', Title: '6 Months Ago',date:handleDate(new Date(new Date(Date.now()).setUTCMonth(new Date(Date.now()).getUTCMonth()-6)).toDateString().split(" "))},
        {value: '1.23', Title: '7 Months Ago',date:handleDate(new Date(new Date(Date.now()).setUTCMonth(new Date(Date.now()).getUTCMonth()-7)).toDateString().split(" "))},
        {value: '1.24', Title: '8 Months Ago',date:handleDate(new Date(new Date(Date.now()).setUTCMonth(new Date(Date.now()).getUTCMonth()-8)).toDateString().split(" "))},
        {value: '1.25', Title: '9 Months Ago',date:handleDate(new Date(new Date(Date.now()).setUTCMonth(new Date(Date.now()).getUTCMonth()-9)).toDateString().split(" "))},
        {value: '1.26', Title: '10 Months Ago',date:handleDate(new Date(new Date(Date.now()).setUTCMonth(new Date(Date.now()).getUTCMonth()-10)).toDateString().split(" "))},
        {value: '1.27', Title: '11 Months Ago',date:handleDate(new Date(new Date(Date.now()).setUTCMonth(new Date(Date.now()).getUTCMonth()-11)).toDateString().split(" "))},
        {value: '1.28', Title: '12 Months Ago',date:handleDate(new Date(new Date(Date.now()).setUTCMonth(new Date(Date.now()).getUTCMonth()-12)).toDateString().split(" "))},
        {value: '1.29', Title: 'Last Year',date:handleDate(new Date(new Date(Date.now()).setUTCFullYear(new Date(Date.now()).getUTCFullYear()-1)).toDateString().split(" "))},
        {value: '1.30', Title: '2 Years Ago',date:handleDate(new Date(new Date(Date.now()).setUTCFullYear(new Date(Date.now()).getUTCFullYear()-2)).toDateString().split(" "))},
        {value: '1.31', Title: '3 Years Ago',date:handleDate(new Date(new Date(Date.now()).setUTCFullYear(new Date(Date.now()).getUTCFullYear()-3)).toDateString().split(" "))},
        {value: '1.32', Title: '4 Years Ago',date:handleDate(new Date(new Date(Date.now()).setUTCFullYear(new Date(Date.now()).getUTCFullYear()-4)).toDateString().split(" "))},
        {value: '1.33', Title: '5 Years Ago',date:handleDate(new Date(new Date(Date.now()).setUTCFullYear(new Date(Date.now()).getUTCFullYear()-5)).toDateString().split(" "))},
        {value: '1.34', Title: '6 Years Ago',date:handleDate(new Date(new Date(Date.now()).setUTCFullYear(new Date(Date.now()).getUTCFullYear()-6)).toDateString().split(" "))},
        {value: '1.35', Title: '7 Years Ago',date:handleDate(new Date(new Date(Date.now()).setUTCFullYear(new Date(Date.now()).getUTCFullYear()-7)).toDateString().split(" "))},
        {value: '1.36', Title: '8 Years Ago',date:handleDate(new Date(new Date(Date.now()).setUTCFullYear(new Date(Date.now()).getUTCFullYear()-8)).toDateString().split(" "))},
        {value: '1.37', Title: '9 Years Ago',date:handleDate(new Date(new Date(Date.now()).setUTCFullYear(new Date(Date.now()).getUTCFullYear()-9)).toDateString().split(" "))},
        {value: '1.38', Title: '10 Years Ago',date:handleDate(new Date(new Date(Date.now()).setUTCFullYear(new Date(Date.now()).getUTCFullYear()-10)).toDateString().split(" "))}
   ];

   var endDates = [
        {value: '.0.0', Title: '',date:''},
        {value: '.1.1', Title: 'Today', date: handleDate(new Date(Date.now()).toDateString().split(" "))},
        {value: '.1.2', Title: 'Yesterday', date:handleDate(new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -1)).toDateString().split(" "))},
        {value: '.1.3', Title: 'Last Monday', date:handleDate(LastMonday.toDateString().split(" "))},
        {value: '.1.4', Title: 'Last Tuesday', date:handleDate(LastTuesday.toDateString().split(" "))},
        {value: '.1.5', Title: 'Last Wednesday', date:handleDate(LastWednesday.toDateString().split(" "))},
        {value: '.1.6', Title: 'Last Thursday', date:handleDate(LastThursday.toDateString().split(" "))},
        {value: '.1.7', Title: 'Last Friday', date:handleDate(LastFriday.toDateString().split(" "))},
        {value: '.1.8', Title: 'Last Saturday', date:handleDate(LastSaturday.toDateString().split(" "))},
        {value: '.1.9', Title: 'Last Sunday', date:handleDate(LastSunday.toDateString().split(" "))},
        {value: '.1.10', Title: '1st of Last Mo.', date:handleDate(new Date(startLastMonth).toDateString().split(" "))},
        {value: '.1.11', Title: 'End of Last Mo.',date:handleDate(new Date(endLastMonth).toDateString().split(" "))},
        {value: '.1.12', Title: '7 Days Ago',date:handleDate(new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -7)).toDateString().split(" "))},
        {value: '.1.13', Title: '14 Days Ago',date:handleDate(new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -14)).toDateString().split(" "))},
        {value: '.1.14', Title: '30 Days Ago',date:handleDate(new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -30)).toDateString().split(" "))},
        {value: '.1.15', Title: '60 Days Ago',date:handleDate(new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -60)).toDateString().split(" "))},
        {value: '.1.16', Title: '90 Days Ago',date:handleDate(new Date(new Date(Date.now()).setUTCDate(new Date(Date.now()).getUTCDate() -90)).toDateString().split(" "))},
        {value: '.1.17', Title: 'Last Month',date:handleDate(new Date(new Date(Date.now()).setUTCMonth(new Date(Date.now()).getUTCMonth()-1)).toDateString().split(" "))},
        {value: '.1.18', Title: '2 Months Ago',date:handleDate(new Date(new Date(Date.now()).setUTCMonth(new Date(Date.now()).getUTCMonth()-2)).toDateString().split(" "))},
        {value: '.1.19', Title: '3 Months Ago',date:handleDate(new Date(new Date(Date.now()).setUTCMonth(new Date(Date.now()).getUTCMonth()-3)).toDateString().split(" "))},
        {value: '.1.20', Title: '4 Months Ago',date:handleDate(new Date(new Date(Date.now()).setUTCMonth(new Date(Date.now()).getUTCMonth()-4)).toDateString().split(" "))},
        {value: '.1.21', Title: '5 Months Ago',date:handleDate(new Date(new Date(Date.now()).setUTCMonth(new Date(Date.now()).getUTCMonth()-5)).toDateString().split(" "))},
        {value: '.1.22', Title: '6 Months Ago',date:handleDate(new Date(new Date(Date.now()).setUTCMonth(new Date(Date.now()).getUTCMonth()-6)).toDateString().split(" "))},
        {value: '.1.23', Title: '7 Months Ago',date:handleDate(new Date(new Date(Date.now()).setUTCMonth(new Date(Date.now()).getUTCMonth()-7)).toDateString().split(" "))},
        {value: '.1.24', Title: '8 Months Ago',date:handleDate(new Date(new Date(Date.now()).setUTCMonth(new Date(Date.now()).getUTCMonth()-8)).toDateString().split(" "))},
        {value: '.1.25', Title: '9 Months Ago',date:handleDate(new Date(new Date(Date.now()).setUTCMonth(new Date(Date.now()).getUTCMonth()-9)).toDateString().split(" "))},
        {value: '.1.26', Title: '10 Months Ago',date:handleDate(new Date(new Date(Date.now()).setUTCMonth(new Date(Date.now()).getUTCMonth()-10)).toDateString().split(" "))},
        {value: '.1.27', Title: '11 Months Ago',date:handleDate(new Date(new Date(Date.now()).setUTCMonth(new Date(Date.now()).getUTCMonth()-11)).toDateString().split(" "))},
        {value: '.1.28', Title: '12 Months Ago',date:handleDate(new Date(new Date(Date.now()).setUTCMonth(new Date(Date.now()).getUTCMonth()-12)).toDateString().split(" "))},
        {value: '.1.29', Title: 'Last Year',date:handleDate(new Date(new Date(Date.now()).setUTCFullYear(new Date(Date.now()).getUTCFullYear()-1)).toDateString().split(" "))},
        {value: '.1.30', Title: '2 Years Ago',date:handleDate(new Date(new Date(Date.now()).setUTCFullYear(new Date(Date.now()).getUTCFullYear()-2)).toDateString().split(" "))},
        {value: '.1.31', Title: '3 Years Ago',date:handleDate(new Date(new Date(Date.now()).setUTCFullYear(new Date(Date.now()).getUTCFullYear()-3)).toDateString().split(" "))},
        {value: '.1.32', Title: '4 Years Ago',date:handleDate(new Date(new Date(Date.now()).setUTCFullYear(new Date(Date.now()).getUTCFullYear()-4)).toDateString().split(" "))},
        {value: '.1.33', Title: '5 Years Ago',date:handleDate(new Date(new Date(Date.now()).setUTCFullYear(new Date(Date.now()).getUTCFullYear()-5)).toDateString().split(" "))},
        {value: '.1.34', Title: '6 Years Ago',date:handleDate(new Date(new Date(Date.now()).setUTCFullYear(new Date(Date.now()).getUTCFullYear()-6)).toDateString().split(" "))},
        {value: '.1.35', Title: '7 Years Ago',date:handleDate(new Date(new Date(Date.now()).setUTCFullYear(new Date(Date.now()).getUTCFullYear()-7)).toDateString().split(" "))},
        {value: '.1.36', Title: '8 Years Ago',date:handleDate(new Date(new Date(Date.now()).setUTCFullYear(new Date(Date.now()).getUTCFullYear()-8)).toDateString().split(" "))},
        {value: '.1.37', Title: '9 Years Ago',date:handleDate(new Date(new Date(Date.now()).setUTCFullYear(new Date(Date.now()).getUTCFullYear()-9)).toDateString().split(" "))},
        {value: '.1.38', Title: '10 Years Ago',date:handleDate(new Date(new Date(Date.now()).setUTCFullYear(new Date(Date.now()).getUTCFullYear()-10)).toDateString().split(" "))}
    ]

    return {

        showElements: showElements,
        getUploadPanel: getUploadPanel,
        setUploadPanel: setUploadPanel,
        setMatterList: setMatterList,
        getMatterList: getMatterList,
        checkLocalStorage: checkLocalStorage,
        setCabinetMenu: setCabinetMenu,
        getCabinetMenu: getCabinetMenu,
        getStart: getStart,
        getEnd: getEnd,
        setTitle: setTitle,
        getTitle: getTitle,
        setSelected: setSelected,
        getSelected: getSelected,
        getSelectedList: getSelectedList

    }


    /**** Phx Services****/

    function getEmail() {
        return email;
    }

    function setEmail(x, y) {
        email = {
            initList: x,
            newList: y
        }
        console.log(email);
    }

    function getSelected() {
        return selected
    }

    function getSelectedList() {
        return selectedFiles;
    }

    function setSelected(x) {
        console.log(x);
        selected = x.length;
        selectedFiles = x;
    }

    function setTitle(x) {
        title = x;
    }

    function getTitle() {
        return title;
    }

    function getEnd() {
        return endDates;
    }

    function getStart() {
        return startDates;
    }

    function setCabinetMenu(x) {
        cabinet = x;
    }

    function getCabinetMenu() {
        return cabinet;
    }


    function showElements(obj) {
        //myElements.showNav = obj.showNav;
        this.showNav = obj.showNav;
        $rootScope.$broadcast('navEvent', obj);
    }

    function getUploadPanel() {
        return panelValue;
    }

    function setUploadPanel(x){
        panelValue = x;
    }

    function setMatterList(x) {
        if (x != null) {
            favMatter = x;
        }
    }

    function getMatterList() {
        return favMatter;
    }

    function checkLocalStorage() {
        if (!$localStorage.userData) {
            redirect();
            return false;
        }

        wdService.chksession().then(function(res){
            if (res.data.user == '' || !res.data.user){
                redirect();
            }
        }, function(error) {
            $log.error(error);
        });

    }

    function redirect() {
        $localStorage.$reset();
        $location.path("/login");
        $location.url($location.path());
    }
}]);
