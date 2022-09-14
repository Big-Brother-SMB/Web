let switchAllAmis = document.getElementById("allAmis")
//let inputCodeBar = document.getElementById("code bar")

switchAllAmis.checked = bollAllAmis
switchAllAmis.addEventListener("change", function () {
    writeCookie("allAmis", this.checked)
})


var ele = document.getElementsByName("color");


console.log("colorMode : " + colorMode)
setColorMode("..")


for(i = 0; i < ele.length; i++) {
    const index = i
    ele[index].addEventListener("change", function () {
        writeCookie("color mode", index)
        colorMode = index
        setColorMode("..")
    })
    if(index == colorMode){
        ele[index].checked = true

    }

}


let selectBack = document.getElementById("color back");
selectBack.value = backgroundColor
selectBack.addEventListener("input", function () {
    writeCookie("color background", this.value)
    backgroundColor = this.value
    setColorMode("..")
    //document.getElementById("article").style.backgroundColor = this.value;
})

let selectText = document.getElementById("color text");
selectText.value = textColor
selectText.addEventListener("input", function () {
    writeCookie("color text", this.value)
    textColor = this.value
    setColorMode("..")
})



document.getElementById("disconnect").addEventListener("click", function () {
    deco()
});

let admin=document.getElementById("admin")
let adminS=document.getElementById("admin switch")
let adminP=document.getElementById("adminP")
let retour=document.getElementById("retour")
let adminVal=-1
retour.addEventListener("click",function(){
    if(adminVal===1){
        window.location.href="../admin/menu/menu.html"
    } else {
        window.location.href="../menu/menu.html"
    }
})
database.ref("modo/users/"+user).once('value').then(function(snapshot) {
    adminVal=snapshot.val()
    if (snapshot.val()===0){
        admin.style.visibility="visible";
    }
    if (snapshot.val()===1){
        adminS.checked=true
    }
    if (snapshot.val()===0 || snapshot.val()===1){
        adminP.style.visibility="visible";
        adminP.style.height="auto";
    }
    adminS.addEventListener("change", function () {
        if(adminS.checked){
            database.ref("modo/users/"+user).set(1)
            admin.style.visibility="hidden";
            adminVal=1
        } else {
            database.ref("modo/users/"+user).set(0)
            admin.style.visibility="visible";
            adminVal=0
        }
    })
})

charged(true)
