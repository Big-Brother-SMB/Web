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


    let bouton = []
    let info = []
    let listEleves = []

    const creneaudiv = document.getElementById("creneaudiv");

    let divHoraires = document.createElement("div")
    divHoraires.classList.add("heure")
    let text = document.createElement("button")
    text.className = "case perm info jour heure";
    divHoraires.appendChild(text);
    
    for (let h = 0; h < 9; h++) {
        let horaire = document.createElement("button")
        horaire.innerHTML = horaires[h]
        horaire.className = "case perm info heure"
        divHoraires.appendChild(horaire);

    }
    creneaudiv.appendChild(divHoraires);

    for (let j = 0; j < 5; j++) {
        let div = document.createElement("div")
        let text = document.createElement("button")
        text.className = "case perm info jour";
        text.innerHTML = Day[j]
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
        let myIncriptions = []
        for (let j = 0; j < 5; j++) {
            myIncriptions.push([])
            for (let h = 0; h < 9; h++) {
                myIncriptions[j].push(false)
                for(const i in listEleves[j][h]){
                    if(listEleves[j][h][i].uuid==common.uuid){
                        myIncriptions[j][h]=true
                    }
                }
            }
        }
        for (let j = 0; j < 5; j++) {
            for (let h = 0; h < 9; h++) {
                bouton[j][h].className = "case perm blue"
                switch(info[j][h].lieu){
                    case "Aumonerie":
                    case "Tutorat":
                    case "CDI":
                        switch(info[j][h].ouvert){
                            case 0:
                                bouton[j][h].innerHTML = "horaire non planifié"
                                bouton[j][h].className="case perm default"
                                break;
                            case 1:
                                let str = info[j][h].msg
                                if(str != "" && str != undefined && str != null){
                                    bouton[j][h].innerHTML = str
                                }else{
                                    bouton[j][h].innerHTML = "ouvert"
                                }
                                if(myIncriptions[j][h]){
                                    bouton[j][h].className="case perm green"
                                }
                                bouton[j][h].innerHTML+="<br>"+listEleves[j][h].length+"/"+info[j][h].places
                                break;
                            case 2:
                                bouton[j][h].className = "case perm yellow"
                                let str2 = info[j][h].msg
                                if(str2 != "" && str2 != undefined && str2 != null){
                                    bouton[j][h].innerHTML = str2
                                }else{
                                    bouton[j][h].innerHTML = "réservé"
                                }
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
                    case "DOC":
                    case "Audio":
                        switch(info[j][h].ouvert){
                            case 0:
                                bouton[j][h].innerHTML = "horaire non planifié"
                                bouton[j][h].className="case perm default"
                                break;
                            case 1:
                                let str = info[j][h].msg
                                if(str != "" && str != undefined && str != null){
                                    bouton[j][h].innerHTML = str
                                }else{
                                    bouton[j][h].innerHTML = "ouvert"
                                }
                                if(myIncriptions[j][h]){
                                    bouton[j][h].className="case perm green"
                                }
                                bouton[j][h].innerHTML+="<br>"+listEleves[j][h].length+"/"+info[j][h].places
                                break;
                            case 2:
                                bouton[j][h].className = "case perm yellow"
                                let str2 = info[j][h].msg
                                if(str2 != "" && str2 != undefined && str2 != null){
                                    bouton[j][h].innerHTML = str2
                                }else{
                                    bouton[j][h].innerHTML = "occupé"
                                }
                                break;
                            case 3:
                                let str3 = info[j][h].msg
                                if(str3 == "" || str3 == undefined || str3 == null){
                                    str3 = ""
                                }
                                bouton[j][h].innerHTML = "Alumni<br>" + str3
                                bouton[j][h].className = "case perm demande"
                                break;
                            case 4:
                                bouton[j][h].innerHTML = "fermé"
                                bouton[j][h].className = "case perm red"
                                break;
                            case 5:
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
        let title = info[j][h].title
        if(title == undefined || title == null){
            title=""
        }
        let texte = info[j][h].texte
        if(texte == undefined || texte == null){
            texte=""
        }
        if (title != "" || texte != "") {
            common.popUp_Active(title,texte.replaceAll("\n","<br>"),(btn)=>{
                if(info[j][h].ouvert == 1) btn.innerHTML="S'inscrire"
                btn.addEventListener("click",()=>{
                    if(info[j][h].ouvert == 1) common.loadpage("/lieu/demande?j="+j+"&h="+h+"&w="+week+"&lieu="+lieu)
                    common.popUp_Stop()
                })
            })
        }else{
            if(info[j][h].ouvert == 1) common.loadpage("/lieu/demande?j="+j+"&h="+h+"&w="+week+"&lieu="+lieu)
        }
    }
}