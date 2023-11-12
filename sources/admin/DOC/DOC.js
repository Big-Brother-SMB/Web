const Day = ["Lundi", "Mardi","Mercredi","Jeudi","Vendredi"]
const horaires = ["8h-9h","9h-10h","10h-11h","11h-12h","12h-13h","13h-14h","14h-15h","15h-16h","16h-17h"]

const listModePerm = ["Annuler","horaire non planifié","Ouvert","Alumni","Fermé","Vacances"]


export async function init(common){
    let week = common.week

    function superSelection(mode2,x2){
        const mode = mode2
        const x = x2
        return async function(){
            common.popUp_Active('Set mode','attente',async (bnt)=>{
                let select = document.createElement('select')
                document.getElementById('popup-body').innerHTML=''
                document.getElementById('popup-body').appendChild(select)
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
                                allHorairePerm[x][h].w = week
                                allHorairePerm[x][h].j = x
                                allHorairePerm[x][h].h = h
                                allHorairePerm[x][h].ouvert = select.selectedIndex-1
                                await common.socketAdminAsync('setDOCInfo',allHorairePerm[x][h])
                            }
                        }
                    }else if(mode=="h" && select.selectedIndex!=0){
                        for (let j = 0; j < 5; j++) {
                            if(!(j == 2 && x >3)){
                                allHorairePerm[j][x].w = week
                                allHorairePerm[j][x].j = j
                                allHorairePerm[j][x].h = x
                                allHorairePerm[j][x].ouvert = select.selectedIndex-1
                                await common.socketAdminAsync('setDOCInfo',allHorairePerm[j][x])
                            }
                        }
                    }else if(mode=="all" && select.selectedIndex!=0){
                        for (let j = 0; j < 5; j++) {
                            for(let h = 0; h < 9; h++){
                                if(!(j == 2 && h >3)){
                                    allHorairePerm[j][h].w = week
                                    allHorairePerm[j][h].j = j
                                    allHorairePerm[j][h].h = h
                                    allHorairePerm[j][h].ouvert = select.selectedIndex-1
                                    await common.socketAdminAsync('setDOCInfo',allHorairePerm[j][h])
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
    let allHorairePerm = []

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
        allHorairePerm[j] = []
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


        allHorairePerm = await common.socketAsync("allHoraireDOC",{w:week})

        for (let j = 0; j < 5; j++) {
            for (let h = 0; h < 9; h++) {
                bouton[j][h].className = "case perm blue"
                switch(allHorairePerm[j][h].ouvert){
                    case 0:
                        bouton[j][h].innerHTML = "horaire non planifié"
                        bouton[j][h].className="case perm default"
                        break;
                    case 1:
                        let str = allHorairePerm[j][h].msg
                        if(str != "" && str != undefined && str != null){
                            bouton[j][h].innerHTML = str
                            //bouton[j][h].className="case perm yellow"
                        }else{
                            bouton[j][h].innerHTML="ouvert aux<br>terminals"
                        }
                        break;
                    case 2:
                        let str2 = allHorairePerm[j][h].msg
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
            }
        }
    }
    refreshDatabase();

    function select(j, h){
        common.loadpage("/admin/DOC/creneau?j="+j+"&h="+h+"&w="+week)
    }
}