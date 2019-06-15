/******************************************************
 * Common functions
******************************************************/

var TableElements = document.querySelectorAll(".ms-Table");
for (var i = 0; i < TableElements.length; i++) {
  new fabric['Table'](TableElements[i]);
}

var CommandBarElements = document.querySelectorAll(".ms-CommandBar");
  for (var i = 0; i < CommandBarElements.length; i++) {
    new fabric['CommandBar'](CommandBarElements[i]);
}

var ButtonElements = document.querySelectorAll(".ms-Button");
  for (var i = 0; i < ButtonElements.length; i++) {
    new fabric['Button'](ButtonElements[i], function() {
      // Insert Event Here
    });
}

var ToggleElements = document.querySelectorAll(".ms-Toggle");
  for (var i = 0; i < ToggleElements.length; i++) {
    new fabric['Toggle'](ToggleElements[i]);
}

var ListItemElements = document.querySelectorAll(".ms-ListItem");
  for (var i = 0; i < ListItemElements.length; i++) {
    new fabric['ListItem'](ListItemElements[i]);
}

var TextFieldElements = document.querySelectorAll(".ms-TextField");
  for (var i = 0; i < TextFieldElements.length; i++) {
    new fabric['TextField'](TextFieldElements[i]);
}
var CheckBoxElements = document.querySelectorAll(".ms-CheckBox");
  for (var i = 0; i < CheckBoxElements.length; i++) {
    new fabric['CheckBox'](CheckBoxElements[i]);
}

var ChoiceFieldGroupElements = document.querySelectorAll(".ms-ChoiceFieldGroup");
  for (var i = 0; i < ChoiceFieldGroupElements.length; i++) {
    new fabric['ChoiceFieldGroup'](ChoiceFieldGroupElements[i]);
}

var DropdownHTMLElements = document.querySelectorAll('.ms-Dropdown');
  for (var i = 0; i < DropdownHTMLElements.length; ++i) {
    var Dropdown = new fabric['Dropdown'](DropdownHTMLElements[i]);
}

var SearchBoxElements = document.querySelectorAll(".ms-SearchBox");
  for (var i = 0; i < SearchBoxElements.length; i++) {
    new fabric['SearchBox'](SearchBoxElements[i]);
}

var CalloutExamples = document.querySelectorAll(".ms-CalloutExample");
  for (var i = 0; i < CalloutExamples.length; i++) {
    var Example = CalloutExamples[i];
    var ExampleButtonElement = Example.querySelector(".ms-CalloutExample-button .ms-Button");
    var CalloutElement = Example.querySelector(".ms-Callout");
    new fabric['Callout'](
      CalloutElement,
      ExampleButtonElement,
      "right"
    );
}

var CommandButtonElements = document.querySelectorAll(".ms-CommandButton");
  for (var i = 0; i < CommandButtonElements.length; i++) {
    new fabric['CommandButton'](CommandButtonElements[i]);
}

var ContextualMenuElements = document.querySelectorAll(".ms-ContextualMenuExample");
  for (var i = 0; i < ContextualMenuElements.length; i++) {
    var ButtonElement = ContextualMenuElements[i].querySelector(".ms-Button");
    var ContextualMenuElement = ContextualMenuElements[i].querySelector(".ms-ContextualMenu");
    new fabric['ContextualMenu'](ContextualMenuElement, ButtonElement);
}

var PanelExamples = document.getElementsByClassName("ms-PanelExample");
for (var i = 0; i < PanelExamples.length; i++) {
  (function() {
    var PanelExampleButton = PanelExamples[i].querySelector(".ms-Button");
    var PanelExamplePanel = PanelExamples[i].querySelector(".ms-Panel");
    PanelExampleButton.addEventListener("click", function(i) {
      new fabric['Panel'](PanelExamplePanel);
    });
  }());
}

var PersonaCardElement = document.querySelectorAll(".ms-PersonaCard");
  for (var i = 0; i < PersonaCardElement.length; i++) {
    new fabric.PersonaCard(PersonaCardElement[i]);
}


var PivotElements = document.querySelectorAll(".ms-Pivot");
  for (var i = 0; i < PivotElements.length; i++) {
    new fabric['Pivot'](PivotElements[i]);
}

var FacePileElements = document.querySelectorAll(".ms-FacePile");
  for (var i = 0; i < FacePileElements.length; i++) {
    new fabric['FacePile'](FacePileElements[i]);
}

var PeoplePickerElements = document.querySelectorAll(".ms-PeoplePicker");
  for (var i = 0; i < PeoplePickerElements.length; i++) {
    new fabric['PeoplePicker'](PeoplePickerElements[i]);
}

$(document).ready(function(){
  window.onresize = function(){
     if ($(window).width() < 480) {
      $('#nav-trigger').prop('checked', false);
    }
  }
});
// Layout - Classic Style
// Layout - Dashboard Style
// Layout - Social Style
/******************************************************
 * Left Body Nav
******************************************************/
$(document).ready(function(){

    $('.getSub').click(function(){
        $(this).addClass("is-open");
        $(this).parent().addClass("slide-out");
    });

    $('.js-back').click(function(e){
        e.stopPropagation();
        $(this).parents('.is-open').first().removeClass("is-open");
        $(this).parents('.slide-out').first().removeClass("slide-out");
    })

    $('#navBtn').click(function(){
        $(".bodyColumn").toggleClass("openCollapse");
    });

});
/******************************************************
 * Theme Config JS
******************************************************/
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

function navTabReponsiveToogle(){
    if($( window ).width()<=1024){
        var x = document.getElementById("myTopnav");
        if (x.className.indexOf("topnav responsive") == -1 ||  x.className.indexOf("ms-Pivot-links topnav") != -1) {
            x.className = "topnav responsive";
        } else {
            x.className = "ms-Pivot-links topnav";
        }
    }
}