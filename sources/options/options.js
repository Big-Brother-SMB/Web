export async function init(common){
    document.getElementById("download").href = "/database.db?"+common.key
    document.getElementById("download2").href = "/pyscan.zip?"+common.key

    let name_mode = document.getElementById("name_mode")
    name_mode.checked = common.readBoolCookie("name_mode")
    name_mode.addEventListener("change", function () {
        common.writeCookie("name_mode", this.checked)
    })


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



    document.getElementById("suppToken").addEventListener("click", async function () {
        await common.socketAsync('setTuto',false)
        await common.socketAsync("suppAllToken",null)
        common.deco()
    });


    document.getElementById("disconnect").addEventListener("click", function () {
        common.deco()
    });



    let adminS = document.getElementById("admin switch")

    adminS.addEventListener("change", function () {
        if(adminS.checked){
            common.socketAdminAsync('setMyAdminMode',2)
            common.loadpage("sidebar:admin")
            common.admin=2
        } else {
            common.socketAdminAsync('setMyAdminMode',1)
            common.loadpage("sidebar:admin")
            common.admin=1
        }
    })
    if(common.admin===2){
        adminS.checked=true
    }
}