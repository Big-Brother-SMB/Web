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

        if(info_menu.self!="undefined" && info_menu.self!=undefined){
            document.getElementById("menu self").setAttribute("src",info_menu.self)
            document.getElementById("menu self").addEventListener("error", remplace_img);
        }else{
            remplace_img()
        }
    }

    refreshDatabase();
}



function remplace_img(){			// on ajoute un écouteur sur l'evenement d'erreur des images
    if(this!=undefined)  this.removeEventListener("error",remplace_img);			// /!\ important: on annule l'écouteur sur l'erreur dans le cas ou l'image de remplacement n'existe pas non plus, sinon on aura un boucle infinie, ce qui plantera compltement la page.
    switch (Math.floor(Math.random() * 5)) {
        case 0:
            document.getElementById("menu self").setAttribute("src", "https://media.tenor.com/2roX3uxz_68AAAAM/cat-space.gif");
            break;
        case 1:
            document.getElementById("menu self").setAttribute("src", "https://media.tenor.com/_4YgA77ExHEAAAAd/rick-roll.gif");
            break;
        case 2:
            document.getElementById("menu self").setAttribute("src", "https://media.tenor.com/lb5IqGp_7EMAAAAM/trollfacelmaaaao.gif");
            break;
        case 3:
            document.getElementById("menu self").setAttribute("src", "https://media.tenor.com/a3XdWRycefwAAAAC/obelix-faim.gif");
            break;
        case 4:
            document.getElementById("menu self").setAttribute("src", "https://user-images.githubusercontent.com/24848110/33519396-7e56363c-d79d-11e7-969b-09782f5ccbab.png");
            break;
        default:
            document.getElementById("menu self").setAttribute("src", "https://media.tenor.com/_4YgA77ExHEAAAAd/rick-roll.gif"); 
    }      
}