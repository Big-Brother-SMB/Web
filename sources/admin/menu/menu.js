export async function init(common){
    let week = common.week
    document.getElementById("semainePrecedente").addEventListener("click", function () {
        week--
        common.writeCookie("week", week)
        refreshDatabase()
    });


    document.getElementById("semaineActuelle").addEventListener("click", function () {
        week = common.actualWeek
        common.writeCookie("week", week)
        refreshDatabase()
    });


    document.getElementById("semaineSuivante").addEventListener("click", function () {
        week++
        common.writeCookie("week", week)
        refreshDatabase()
    });


    //point global / edit banderole

    document.getElementById("add point").addEventListener("click",async function(){
        var nbpts=prompt("Nombre de point(s) à ajouter :","1")
        nbpts = parseFloat(nbpts.replaceAll(",","."))
        let nomgain
        let conf
        if (nbpts!==null && !isNaN(nbpts)){
            nomgain=prompt("Nom du gain :", "gain de la semaine " + common.actualWeek)
            if (nomgain!==null){
                await common.socketAdminAsync("addGlobalPoint",[common.getDateHour(),nomgain,nbpts])
                if(nomgain=="gain de la semaine " + common.actualWeek) document.getElementById("add point").style.backgroundColor= "unset"
                alert("Ajout de points effectué")
            }
        }
    });


    let global_points = await common.socketAdminAsync("getGlobalPoint",null)
    let test=true
    global_points.forEach(e => {
        if("gain de la semaine " + common.actualWeek==e.name){
            test=false
        }
    })
    if(test){
        document.getElementById("add point").style.backgroundColor= "red"
    }


    document.getElementById("editbanner").addEventListener("click",async function(){
        let banderole = await common.socketAsync("getBanderole",null)
        banderole=window.prompt("Message de la banderole:",banderole);
        if (banderole!=null){
            await common.socketAdminAsync("setBanderole",banderole)
            document.getElementById("banderole").innerHTML = banderole

            if (banderole != null && banderole != '') {
                document.getElementById("banderole").innerHTML = banderole
                document.getElementsByClassName("marquee-rtl")[0].classList.remove("cache")
                document.querySelector(':root').style.setProperty("--screenH","calc(calc(var(--vh, 1vh) * 100) - 8em - 33px - 3.8em + 1px)")
            }else{
                document.getElementsByClassName("marquee-rtl")[0].classList.add("cache")
                document.querySelector(':root').style.setProperty("--screenH","calc(calc(var(--vh, 1vh) * 100) - 8em - 33px)")
            }
        }
    })
    


    async function refreshDatabase() {
        let text = "Semaine n°" + week + " du " + common.intervalSemaine(week)
        if (week == common.actualWeek) {
            text = "Cette semaine (n°" + week + " du " + common.intervalSemaine(week) + ")"
        }
        document.getElementById("semaine").innerHTML = text

        let info_menu = await common.socketAsync("getMenuThisWeek",week)
        console.log(info_menu)
        let val = info_menu.menu
        if (val == null) {
            val = "inconnu pour le moment"
        }
        document.getElementById("menuSemaine").innerHTML = val

        document.getElementById("menu self").setAttribute("src",info_menu.self)
    }



    refreshDatabase();

    document.getElementById("menuSemaine").addEventListener("click",async function(){
        let info_menu = await common.socketAsync("getMenuThisWeek",week)
        let p= info_menu.menu
        if (p==null || p=="" || p=="null"){
            p = "inconnu pour le moment"
        }
        p=window.prompt("Menu de la semaine "+week+":",p);
        if (p==null){
            p=info_menu.menu
        }
        if (p=="" || p=="null"){
            p = "inconnu pour le moment"
        }
        await common.socketAdminAsync("setMenu",{semaine:week,menu:p,self:info_menu.self})
        document.getElementById("menuSemaine").innerHTML = p
    })


    document.getElementById("menu self").addEventListener("click",async function(){
        let info_menu = await common.socketAsync("getMenuThisWeek",week)
        let p = info_menu.self
        p=window.prompt("Menu du self de la semaine "+week+":",p);
        if (p==null){
            p=info_menu.self
        }
        await common.socketAdminAsync("setMenu",{semaine:week,menu:info_menu.menu,self:p})
        document.getElementById("menu self").setAttribute("src",p)
    })
}