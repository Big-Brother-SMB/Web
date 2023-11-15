const Day = ["Lundi", "Mardi","Mercredi","Jeudi","Vendredi"]
const horaires = ["8h-9h","9h-10h","10h-11h","11h-12h","12h-13h","13h-14h","14h-15h","15h-16h","16h-17h"]

export async function init(common){
    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });
    let lieu = ""
    if(params.lieu!=null){
        lieu = params.lieu
        document.getElementById('title').innerHTML=lieu
    }

    function superSelection(mode2,x2){
        const mode = mode2
        const x = x2
        return async function(){
            common.popUp_Active('Set mode','attente',async (bnt)=>{
                let select = document.createElement('select')
                document.getElementById('popup-body').innerHTML=''
                document.getElementById('popup-body').appendChild(select)
                let listModePerm = []
                switch(info[0][0].lieu){
                    case "CDI":
                        listModePerm = ["Annuler","horaire non planifié","Ouvert","Fermé","Vacances"]
                        break;
                    case "DOC":
                        listModePerm = ["Annuler","horaire non planifié","Ouvert","Alumni","Fermé","Vacances"]
                        break;
                }
                for(const i in listModePerm){
                    let opt = document.createElement("option")
                    opt.innerHTML = listModePerm[i]
                    select.appendChild(opt);
                }
        
                bnt.innerHTML='Confirmer'
                bnt.addEventListener('click',async ()=>{
                    if(mode=="j" && select.selectedIndex!=0){
                        for(let h = 0; h < 9; h++){
                            if(!(x == 2 && h >3)){
                                info[x][h].w = week
                                info[x][h].j = x
                                info[x][h].h = h
                                info[x][h].ouvert = select.selectedIndex-1
                                await common.socketAdminAsync('setLieuInfo',info[x][h])
                            }
                        }
                    }else if(mode=="h" && select.selectedIndex!=0){
                        for (let j = 0; j < 5; j++) {
                            if(!(j == 2 && x >3)){
                                info[j][x].w = week
                                info[j][x].j = j
                                info[j][x].h = x
                                info[j][x].ouvert = select.selectedIndex-1
                                await common.socketAdminAsync('setLieuInfo',info[j][x])
                            }
                        }
                    }else if(mode=="all" && select.selectedIndex!=0){
                        for (let j = 0; j < 5; j++) {
                            for(let h = 0; h < 9; h++){
                                if(!(j == 2 && h >3)){
                                    info[j][h].w = week
                                    info[j][h].j = j
                                    info[j][h].h = h
                                    info[j][h].ouvert = select.selectedIndex-1
                                    await common.socketAdminAsync('setLieuInfo',info[j][h])
                                }
                            }
                        }
                    }
                    common.popUp_Stop()
                    refreshDatabase()
                }, { once: true })
            })
        }
    }


    let bouton = []
    let info = []
    let listEleves = []

    const creneaudiv = document.getElementById("creneaudiv");

    let divHoraires = document.createElement("div")
    divHoraires.classList.add("heure")
    let text = document.createElement("button")
    text.className = "case perm info jour heure";
    text.innerHTML = "Tout"
    text.addEventListener("click",superSelection("all"))
    divHoraires.appendChild(text);
    
    for (let h = 0; h < 9; h++) {
        let horaire = document.createElement("button")
        horaire.innerHTML = horaires[h]
        horaire.addEventListener("click",superSelection("h",h))
        horaire.className = "case perm info heure"
        divHoraires.appendChild(horaire);

    }
    creneaudiv.appendChild(divHoraires);

    for (let j = 0; j < 5; j++) {
        let div = document.createElement("div")
        let text = document.createElement("button")
        text.className = "case perm info jour";
        text.innerHTML = Day[j]
        text.addEventListener("click",superSelection("j",j))
        div.appendChild(text);

        bouton[j] = []
        info[j] = []
        for (let h = 0; h < 9; h++) {
            bouton[j][h] = document.createElement("button")
            if(j == 2 && h >3){
                bouton[j][h].style.visibility = "hidden";
            }
            bouton[j][h].onclick = function () { select(j, h) };
            bouton[j][h].className = "case perm default"
            div.appendChild(bouton[j][h]);

        }
        creneaudiv.appendChild(div);
    }

    let week = common.week

    document.getElementById("semainePrecedente").addEventListener("click", function () {
        week = week - 1
        common.writeCookie("week", week)
        refreshDatabase()
    });

    document.getElementById("semaineActuelle").addEventListener("click", function () {
        week = common.actualWeek
        common.writeCookie("week", week)
        refreshDatabase()
    });


    document.getElementById("semaineSuivante").addEventListener("click", function () {
        week = week + 1
        common.writeCookie("week", week)
        refreshDatabase()
    });


    async function refreshDatabase() {
        if (week == common.actualWeek) {
            document.getElementById("semaine").innerHTML = "Cette semaine (n°" + week + " du " + common.intervalSemaine(week) + ")"
        } else {
            document.getElementById("semaine").innerHTML = "Semaine n°" + week + " du " + common.intervalSemaine(week)
        }

        let allHoraire = await common.socketAsync("allHoraireLieu",{lieu:lieu,w:week})
        info = allHoraire.info
        listEleves = allHoraire.inscriptions

        for (let j = 0; j < 5; j++) {
            for (let h = 0; h < 9; h++) {
                bouton[j][h].className = "case perm blue"
                switch(info[j][h].lieu){
                    case "CDI":
                        switch(info[j][h].ouvert){
                            case 0:
                                bouton[j][h].innerHTML = "horaire non planifié"
                                bouton[j][h].className="case perm default"
                                break;
                            case 1:
                                //let str = ""+listEleves[j][h].length
                                /*allHoraire.listDemandes[j][h].forEach(function (child) {
                                    if(str != ""){
                                        str += ", "
                                    }
                                    str += child.group2
                                });
                                if(str != ""){
                                    bouton[j][h].innerHTML = str
                                    bouton[j][h].className="case perm yellow"
                                }else{
                                    bouton[j][h].innerHTML="ouvert"
                                }*/
                                bouton[j][h].innerHTML="ouvert"
                                break;
                            case 2:
                                bouton[j][h].innerHTML = "fermé"
                                bouton[j][h].className = "case perm red"
                                break;
                            case 3:
                                bouton[j][h].innerHTML = "vacances"
                                bouton[j][h].className = "case perm default"
                                break;
                        }
                        break;
                    case "DOC":
                        switch(info[j][h].ouvert){
                            case 0:
                                bouton[j][h].innerHTML = "horaire non planifié"
                                bouton[j][h].className="case perm default"
                                break;
                            case 1:
                                let str = info[j][h].msg
                                if(str != "" && str != undefined && str != null){
                                    bouton[j][h].innerHTML = str
                                    //bouton[j][h].className="case perm yellow"
                                }else{
                                    bouton[j][h].innerHTML="ouvert aux<br>terminals"
                                }
                                break;
                            case 2:
                                let str2 = info[j][h].msg
                                if(str2 == "" || str2 == undefined || str2 == null){
                                    str2 = ""
                                }
                                bouton[j][h].innerHTML = "Alumni<br>" + str2
                                bouton[j][h].className = "case perm demande"
                                break;
                            case 3:
                                bouton[j][h].innerHTML = "fermé"
                                bouton[j][h].className = "case perm red"
                                break;
                            case 4:
                                bouton[j][h].innerHTML = "vacances"
                                bouton[j][h].className = "case perm default"
                                break;
                        }
                        break;
                }
            }
        }
    }
    refreshDatabase();

    function select(j, h){
        common.loadpage("/admin/lieu/creneau?j="+j+"&h="+h+"&w="+week+"&lieu="+lieu)
    }
}