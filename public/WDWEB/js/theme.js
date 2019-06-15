/// ...... GET STYLES ......///
$(document).ready(function(){
  var arrList
  var buildLink


  $.ajax({
    type: "GET",
    url: "../../js/data/config.json",
    dataType: "JSON",
    success: function(json) {

      var arrList = [
        json.settings.componentCss,
        json.settings.fabricCss,
        json.settings.appCss
      ];

      if (localStorage["themeColor"]){

          for (var i = 0; i < arrList.length; i++){
            buildLink =  json.settings.path + 'theme-'+ localStorage.getItem('themeColor') + '/' + arrList[i];
            setfromLoop(arrList[i]);
          }

      } else {

        for (var i = 0; i < arrList.length; i++){
            buildLink =  json.settings.path + 'theme-'+ json.settings.defaultTheme + '/' + arrList[i];
            setfromLoop(arrList[i]);
        }

      }

      if (json.settings.userThemes !== true){
          $('.wdTheme').hide();
      }

      $('.wdThemeLink').click(function(e){
          if (e.target.id == 'Default'){
              localStorage.setItem('themeColor', json.settings.defaultTheme);
              setStyle(json);
              //location.reload();
              return false;
          }
          var lowerCase = e.target.id.toLowerCase();
          localStorage.setItem('themeColor', lowerCase);
          setStyle(json);
          //location.reload();
      });


    }, error: function(err){
      console.log(err);
    }
  });

  function setStyle(x){
      $('#componentCss').attr('href', x.settings.path + 'theme-'+ localStorage.getItem('themeColor') + '/fabric.components.css');
      $('#fabricCss').attr('href', x.settings.path + 'theme-'+ localStorage.getItem('themeColor') + '/fabric.css');
      $('#appCss').attr('href', x.settings.path + 'theme-'+ localStorage.getItem('themeColor') + '/app.css');
  }

  function setfromLoop(x) {
    if (x.indexOf('fabric.components.css') !== -1){
        $('#componentCss').attr('href', buildLink);
    } else if (x.indexOf('fabric.css') !== -1) {
        $('#fabricCss').attr('href', buildLink);
    } else {
        $('#appCss').attr('href', buildLink);
    }
  }

  function hideLoader(){
    //   setTimeout(function(){
    //     $('.pageOverlay').hide();
    //   }, 1000);
  }
});