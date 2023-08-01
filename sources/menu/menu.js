const day = ["Lundi", "Mardi","Jeudi","Vendredi"]

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

    async function refreshDatabase() {
        let info_menu = await common.socketAsync("getMenuThisWeek",week)
        if (week == common.actualWeek) {
            document.getElementById("semaine").innerHTML = "Cette semaine (n°" + week + " du " + common.intervalSemaine(week) + ")"
        } else {
            document.getElementById("semaine").innerHTML = "Semaine n°" + week + " du " + common.intervalSemaine(week)
        }
        let menu
        try{
            menu = info_menu["menu"]
        }catch(e){}
        if (menu == null) {
            menu = "inconnu pour le moment"
        }
        menu=menu.replaceAll("/","<br>")
        document.getElementById("menuSemaine").innerHTML = "<u>Menu du foyer :</u><br>" + menu

        document.getElementById("menu self").setAttribute("src",info_menu.self)
    }

    refreshDatabase();
}