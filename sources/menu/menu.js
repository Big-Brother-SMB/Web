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
        
        document.getElementById("menuSemaine").innerHTML = "<u>Menu du foyer :</u><br>" + menu

        document.getElementById("menu_self").addEventListener("error", remplace_img);
        document.getElementById("menu_self").setAttribute("src","/Images_menu/page-" + week + ".jpg")


        //sondage
        for (let i=0;i<listSondage.length;i++){
            const sondage = listSondage[i]
            let note = await common.socketAsync("getSondageMenu",{w:week,j:i})
            let j = i
            if(j>2)j++
            listNote[i]=note
            if((common.generedDate(week,j).getTime() > Date.now() && i!=0)
                || common.generedDate(week,1).getTime() > Date.now() && i==0){
                for (const elem of sondage){
                    elem.classList.add("opacity");
                }
            }else{
                for (const elem of sondage){
                    elem.classList.remove("opacity");
                }
            }

            if(note==-1){
                for (const elem of sondage){
                    elem.classList.remove("grayscale");
                }
            }else{
                for (const elem of sondage){
                    elem.classList.add("grayscale");
                }
                sondage[note].classList.remove("grayscale")
            }
        }
    }




    let listSondage = []
    let listNote = []
    let menuLoop=0
    for(const obj of document.getElementById("all_sondages").children){
        let listElem = []
        if(obj.className=="Sondage"){
            const menu = menuLoop
            menuLoop++
            for (let i=0;i<obj.children.length;i++){
                const elem = obj.children[i]
                const index = i
                listElem.push(elem)
                elem.addEventListener("click",async function(){
                    common.writeCookie("sondageMenuVu",true)
                    let btn = document.getElementById("nav_btn_menu")
                    if(btn!=null) btn.classList.remove('notif')
                    if(!listSondage[menu][0].classList.contains("opacity")){
                        if (listNote[menu] == null || listNote[menu] != index){
                            for (const elem of listSondage[menu]){
                                elem.classList.add("grayscale");
                            }
                            elem.classList.remove("grayscale");
                            listNote[menu]=index
                        }else{
                            for (const elem of listSondage[menu]){
                                elem.classList.remove("grayscale");
                            }
                            listNote[menu]=-1
                        }
                        await common.socketAsync("setSondageMenu",{w:week,j:menu,note:listNote[menu]})
                    }
                })
            }
            listSondage.push(listElem)
            listNote.push(-1)
        }
    }

    refreshDatabase();
}



function remplace_img(){			// on ajoute un écouteur sur l'evenement d'erreur des images
    if(this!=undefined)  this.removeEventListener("error",remplace_img);			// /!\ important: on annule l'écouteur sur l'erreur dans le cas ou l'image de remplacement n'existe pas non plus, sinon on aura un boucle infinie, ce qui plantera compltement la page.
    switch (Math.floor(Math.random() * 3)) {
        case 0:
            document.getElementById("menu_self").setAttribute("src", "/assets/banane.gif");
            break;
        case 1:
            document.getElementById("menu_self").setAttribute("src", "/assets/goose.gif");
            break;
        case 2:
            document.getElementById("menu_self").setAttribute("src", "/assets/sheep.gif");
            break;
        default:
            document.getElementById("menu_self").setAttribute("src", "/assets/not_found.png");
            break
    }      
}