let side = document.getElementById("mySidenav")
side.addEventListener("mouseenter",function() {
    if(window.innerWidth>=1400){
        side.style.width = "250px";
    }
});

side.addEventListener("mouseleave",function() {
    if(window.innerWidth>=1400){
        side.style.width = "80px";   
    }
});

let btn_menu = document.getElementById("btn_menu")
btn_menu.addEventListener("click",function() {
    if(window.innerWidth<1400){
        if(side.style.height=="0px" || side.style.height==""){
            side.style.height = "calc(100vh - 8em - 33px)";
            side.style.width = "100%";
        }else{
            side.style.height = "0";
            side.style.width = "100%";
        }
    }
});

/*side.addEventListener("mouseleave",function() {
    side.style.width = "80px";
});*/