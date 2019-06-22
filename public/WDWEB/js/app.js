
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