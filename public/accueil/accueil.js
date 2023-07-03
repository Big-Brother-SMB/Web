let side = document.getElementById("mySidenav")
side.style.width="0px"
let out_side_function = function(e){
    if (!side.contains(e.target)){
        side.style.width = "0px"
        window.removeEventListener('click',out_side_function)
    }
}
document.getElementById("logo").addEventListener("click",function() {
    if(side.style.width=="0px"){
        side.style.width = "250px";
        setTimeout(function() {
            window.addEventListener('click',out_side_function);
        }, 50);
    }
});