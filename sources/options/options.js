export async function init(common){
    document.getElementById("download").href = "/database.db?"+common.key
    document.getElementById("download2").href = "/PyScan.zip?"+common.key

    let name_mode = document.getElementById("name_mode")
    name_mode.checked = common.readBoolCookie("name_mode")
    name_mode.addEventListener("change", function () {
        common.writeCookie("name_mode", this.checked)
    })

    let notifAccept = document.getElementById("notifAccept")
    notifAccept.checked = common.readBoolCookie("notifAccept")
    notifAccept.addEventListener("change", async function () {
        common.writeCookie("notifAccept", this.checked)
        await navigator.serviceWorker.register("/sw.js").then((registration) => {
            registration.active.postMessage({notif:notifAccept.checked,user:common.uuid});
        });
        if(this.checked) common.askNotificationPermission()
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
        
        if(1 == common.achievement[rad.getAttribute("achievement")]){
            rad.parentElement.classList.remove("cache")
        }
    }


    let son = document.getElementById("son")
    if(1 == common.achievement["troll"]){
        son.parentElement.parentElement.classList.remove("cache")
    }
    son.checked = common.readBoolCookie("son")
    son.addEventListener("change", function () {
        common.writeCookie("son", this.checked)
    })

    document.getElementById("voirToken").addEventListener("click", async function () {
        common.popUp_Active("Token",common.key,(btn)=>{
            btn.addEventListener("click",()=>{
                common.popUp_Stop()
            },{once:true})
        })
    });

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
            common.socketAdminAsync('setMyAdminMode',1)
            common.loadpage("sidebar:admin")
            common.admin_permission.admin_only = 1
            common.admin=2
        } else {
            common.socketAdminAsync('setMyAdminMode',0)
            common.loadpage("sidebar:admin")
            common.admin_permission.admin_only = 0
            common.admin=1
        }
    })
    if(common.admin==2){
        adminS.checked=true
    }





    document.getElementById("installer").addEventListener("click", function () {
        common.popUp_Active("Tuto installer PWA"
          ,"<b>Pour installer l'application, suivez les instructions.</b><br><br>"
          +"<div class='divImgPopupOption'><img src='/options/tuto1.jpg'><img src='/options/tuto2.jpg'></div><br>"
          ,(btn)=>{
            btn.addEventListener("click",()=>{
                common.popUp_Active("Tuto installer PWA"
                ,"<b>Pour installer l'application, suivez les instructions.</b><br><br>"
                +"<div class='divImgPopupOption'><img src='/options/tuto3.jpeg'><img src='/options/tuto4.jpeg'></div><br>"
                ,(btn)=>{
                  btn.addEventListener("click",()=>{
                      common.popUp_Stop()
                  },{once:true})
                })
            },{once:true})
        })
    })
}