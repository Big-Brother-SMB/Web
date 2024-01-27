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

    function defaultPlaces(j,h,lieu){
        let defaultPlaces = 0
        switch(lieu){
            case "CDI":
                defaultPlaces = 0
                break;
            case "Aumônerie":
                if(j != 2 && (h == 3 || h == 4)){
                    defaultPlaces = 0
                }else{
                    defaultPlaces = 15
                }
                break;
            case "DOC":
                if(j != 2 && (h == 3 || h == 4)){
                    defaultPlaces = 15
                }else{
                    defaultPlaces = 15
                }
                break;
            case "Audio":
                defaultPlaces = 15
                break;
            case "Tutorat":
                defaultPlaces = 10
                break;
        }
        return defaultPlaces
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
                    case "Aumônerie":
                    case "Tutorat":
                    case "CDI":
                        listModePerm = ["Annuler","horaire non planifié","Ouvert","Réservé","Fermé","Vacances"]
                        break;
                    case "DOC":
                    case "Audio":
                        listModePerm = ["Annuler","horaire non planifié","Ouvert","Occupé","Alumni","Fermé","Vacances"]
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
                                if(info[x][h].places==null) info[x][h].places = defaultPlaces(x,h,lieu)
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
                                if(info[j][x].places==null) info[j][x].places = defaultPlaces(j,x,lieu)
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
                                    if(info[j][h].places==null) info[j][h].places = defaultPlaces(j,h,lieu)
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

        for (let j = 0; j < 5; j++) {
            for (let h = 0; h < 9; h++) {
                bouton[j][h].className = "case perm default"
                bouton[j][h].innerHTML = "...";
            }
        }

        let allHoraire = await common.socketAsync("allHoraireLieu",{lieu:lieu,w:week})
        info = allHoraire.info
        listEleves = allHoraire.inscriptions

        for (let j = 0; j < 5; j++) {
            for (let h = 0; h < 9; h++) {
                bouton[j][h].className = "case perm blue"

                let msg = info[j][h].msg
                if(msg != undefined && msg != null){
                    info[j][h].msg = ""
                }
                bouton[j][h].innerHTML = msg
                switch(info[j][h].lieu){
                    case "Aumônerie":
                    case "Tutorat":
                    case "CDI":
                        switch(info[j][h].ouvert){
                            case 0:
                                bouton[j][h].innerHTML = "horaire non planifié"
                                bouton[j][h].className="case perm default"
                                break;
                            case 1:
                                if(msg == ""){
                                    bouton[j][h].innerHTML = "ouvert"
                                }
                                if(!(info[j][h].places==undefined || info[j][h].places==null || info[j][h].places==0)){
                                    bouton[j][h].innerHTML+="<br>"+listEleves[j][h].length+"/"+info[j][h].places
                                }
                                break;
                            case 2:
                                bouton[j][h].className = "case perm yellow"
                                if(msg == ""){
                                    bouton[j][h].innerHTML = "réservé"
                                }
                                break;
                            case 3:
                                bouton[j][h].className = "case perm red"
                                bouton[j][h].innerHTML = "fermé<br>" + msg
                                break;
                            case 4:
                                bouton[j][h].className = "case perm default"
                                if(msg == ""){
                                    bouton[j][h].innerHTML = "vacances"
                                }
                                break;
                        }
                        break;
                    case "DOC":
                    case "Audio":
                        switch(info[j][h].ouvert){
                            case 0:
                                bouton[j][h].innerHTML = "horaire non planifié"
                                bouton[j][h].className="case perm default"
                                break;
                            case 1:
                                if(msg == ""){
                                    bouton[j][h].innerHTML = "ouvert"
                                }
                                if(!(info[j][h].places==undefined || info[j][h].places==null || info[j][h].places==0)){
                                    bouton[j][h].innerHTML+="<br>"+listEleves[j][h].length+"/"+info[j][h].places
                                }
                                break;
                            case 2:
                                bouton[j][h].className = "case perm yellow"
                                if(msg == ""){
                                    bouton[j][h].innerHTML = "occupé"
                                }
                                break;
                            case 3:
                                bouton[j][h].className = "case perm demande"
                                bouton[j][h].innerHTML = "Alumni<br>" + msg
                                break;
                            case 4:
                                bouton[j][h].className = "case perm red"
                                bouton[j][h].innerHTML = "fermé<br>" + msg
                                break;
                            case 5:
                                bouton[j][h].className = "case perm default"
                                if(msg == ""){
                                    bouton[j][h].innerHTML = "vacances"
                                }
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