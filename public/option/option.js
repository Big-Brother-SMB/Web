import * as common from "../common.js";

let switchAllAmis = document.getElementById("allAmis")

switchAllAmis.checked = common.boolAllAmis
switchAllAmis.addEventListener("change", function () {
    common.writeCookie("allAmis", this.checked)
})


var ele = document.getElementsByName("color");

let colorMode=common.colorMode
let backgroundColor=common.backgroundColor
let textColor=common.textColor
for(let i = 0; i < ele.length; i++) {
    ele[i].addEventListener("change", function () {
        common.writeCookie("color mode", i)
        colorMode = i
        common.setColorMode(colorMode,backgroundColor,textColor)
    })
    if(i == colorMode){
        ele[i].checked = true
    }

}


let selectBack = document.getElementById("color back");
selectBack.value = backgroundColor
selectBack.addEventListener("input", function () {
    common.writeCookie("color background", this.value)
    backgroundColor = this.value
    common.setColorMode(colorMode,backgroundColor,textColor)
})

let selectText = document.getElementById("color text");
selectText.value = textColor
selectText.addEventListener("input", function () {
    common.writeCookie("color text", this.value)
    textColor = this.value
    common.setColorMode(colorMode,backgroundColor,textColor)
})



document.getElementById("disconnect").addEventListener("click", function () {
    common.deco()
});

let admin=document.getElementById("admin")
let adminS=document.getElementById("admin switch")
let adminP=document.getElementById("adminP")
let retour=document.getElementById("retour")
let adminVal=common.admin
retour.addEventListener("click",function(){
    if(adminVal==2){
        window.location.href="../admin/menu/menu.html"
    } else {
        window.location.href="../menu/menu.html"
    }
})
if (adminVal===1){
    admin.style.visibility="visible";
}
if (adminVal===2){
    adminS.checked=true
}
if (adminVal==1 || adminVal===2){
    adminP.style.visibility="visible";
    adminP.style.height="auto";
}
adminS.addEventListener("change", function () {
    if(adminS.checked){
        common.socketAdminAsync('my_admin_mode',2)
        admin.style.visibility="hidden";
        adminVal=2
    } else {
        common.socketAdminAsync('my_admin_mode',1)
        admin.style.visibility="visible";
        adminVal=1
    }
})
