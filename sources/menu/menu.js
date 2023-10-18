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

        if(info_menu.self!="undefined" && info_menu.self!=undefined){
            document.getElementById("menu self").setAttribute("src",info_menu.self)
            document.getElementById("menu self").addEventListener("error", remplace_img);
        }else{
            remplace_img()
        }


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
    switch (Math.floor(Math.random() * 10)) {
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
            document.getElementById("menu self").setAttribute("src", "https://media.discordapp.net/attachments/1030198323455479880/1146418932610256976/image2.gif");
            break;
        case 5:
            document.getElementById("menu self").setAttribute("src", "https://media.discordapp.net/attachments/1030198323455479880/1146418852549378128/image4.gif?width=561&height=561");
            break;
        case 6:
            document.getElementById("menu self").setAttribute("src", "https://media.discordapp.net/attachments/1030198323455479880/1146418768201916416/image0.gif?width=561&height=561");
            break;
        case 7:
            document.getElementById("menu self").setAttribute("src", "https://media.tenor.com/d3BEY2_2-NQAAAAC/patrick-star-spongebob.gif");
            break;
        case 8:
            document.getElementById("menu self").setAttribute("src", "https://www.gifservice.fr/img/gif-vignette-large/e681285368c9753932e7a85a2424b733/364519-les-poules-ete-france-3-chaines-tv-france-multi-media.gif");
            break;
        case 9:
            document.getElementById("menu self").setAttribute("src", "https://i.pinimg.com/originals/b7/1a/05/b71a05b0eda23af5d181baaa4671016a.gif");
            break;
        default:
            document.getElementById("menu self").setAttribute("src", "https://media.tenor.com/_4YgA77ExHEAAAAd/rick-roll.gif"); 
    }      
}