export async function init(common){
    let switchAllAmis = document.getElementById("allAmis")
    switchAllAmis.checked = common.readBoolCookie("allAmis")
    switchAllAmis.addEventListener("change", function () {
        common.writeCookie("allAmis", this.checked)
    })


    var radios = document.querySelectorAll('input[name="theme"]');

    for(let rad of radios) {
        const i = parseInt(rad.value)
        rad.addEventListener("change", function () {
            common.writeCookie("theme mode", i)
            common.setThemeMode(i)
        })
        if(i == common.themeMode){
            rad.checked = true
        }
    }



    document.getElementById("disconnect").addEventListener("click", function () {
        common.deco()
    });


    
    let adminP = document.getElementById("adminP")
    let adminS = document.getElementById("admin switch")

    if (common.admin==1 || common.admin===2){
        adminP.classList.remove("cache")
    }
    adminS.addEventListener("change", function () {
        if(adminS.checked){
            common.socketAdminAsync('my_admin_mode',2)
            common.admin=2
        } else {
            common.socketAdminAsync('my_admin_mode',1)
            common.admin=1
        }
    })
    if(common.admin===2){
        adminS.checked=true
    }


    /*let key2 = document.getElementById("key2")
    let key2Val = common.readCookie("key2")
    if (key2Val!=undefined){
        key2.style.visibility="visible";
        key2.style.height="auto";
    }

    key2.addEventListener("click", function () {
        common.writeCookie("key",key2Val)
        common.delCookie("key2")
        window.location.reload()
    })*/
}