const Day = ["Lundi", "Mardi","Mercredi","Jeudi","Vendredi"]
const horaires = ["8h-9h","9h-10h","10h-11h","11h-12h","13h-14h","14h-15h","15h-16h","16h-17h"]

export async function init(common){
    let bouton = [];
    let demande = []
    let ouvert = []

    const creneaudiv = document.getElementById("creneaudiv");

    let divHoraires = document.createElement("div")
    divHoraires.classList.add("heure")
    let text = document.createElement("button")
    text.className = "case perm info jour heure";
    divHoraires.appendChild(text);
    
    for (let h = 0; h < 8; h++) {
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
        demande[j] = []
        ouvert[j] = []
        for (let h = 0; h < 8; h++) {
            bouton[j][h] = document.createElement("button")
            if((j == 2 && h >3) || (h == 3 && j != 2)){
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
            for (let h = 0; h < 8; h++) {
                bouton[j][h].className = "case perm default"
                bouton[j][h].innerHTML = "...";
            }
        }

        let allHorairePerm = await common.socketAsync("allHorairePerm",{w:week})
        ouvert = allHorairePerm.ouvert

        for (let j = 0; j < 5; j++) {
            for (let h = 0; h < 8; h++) {
                let nbDemandesPerm = 0
                let groupsInscrits = []

                bouton[j][h].className = "case perm blue"
                allHorairePerm.listDemandes[j][h].forEach(function(child){
                    if(child.DorI){
                        groupsInscrits.push(child.group2)
                    }else{
                        nbDemandesPerm++
                        if(common.uuid==child.uuid){
                            bouton[j][h].className = "case perm demande"
                        }
                    }
                })

                if (nbDemandesPerm==1){
                    bouton[j][h].innerHTML = nbDemandesPerm.toString()+" demande en cours"
                }else if (nbDemandesPerm>1){
                    bouton[j][h].innerHTML = nbDemandesPerm.toString()+" demandes en cours"
                }else {
                    bouton[j][h].innerHTML="aucune info"
                }
                switch(ouvert[j][h]){
                    case 0:
                        bouton[j][h].innerHTML = "horaire non planifié"
                        bouton[j][h].className = "case perm default"
                        break;
                    case 1:
                        let str = ""
                        groupsInscrits.forEach(function (child) {
                            if(child == common.classe || common.groups.indexOf(child)!=-1){
                                bouton[j][h].className = "case perm green"
                            }
                            if(str != ""){
                                str += ", "
                            }
                            str += child
                        });
                        if(str != ""){
                            bouton[j][h].innerHTML = str
                        }
                        break;
                    case 2:
                        bouton[j][h].innerHTML = "fermé"
                        bouton[j][h].className = "case perm red"
                        break;
                    case 3:
                        bouton[j][h].innerHTML = "ouvert à tous"
                        bouton[j][h].className = "case perm green"
                        break;
                    case 4:
                        bouton[j][h].innerHTML = "réservé"
                        bouton[j][h].className = "case perm yellow"
                        
                        let str2 = ""
                        groupsInscrits.forEach(function (child) {
                            if(child == common.classe || common.groups.indexOf(child)!=-1){
                                bouton[j][h].className = "case perm green"
                            }
                            if(str2 != ""){
                                str2 += ", "
                            }
                            str2 += child
                        });
                        if(str2!="") bouton[j][h].innerHTML = str2
                        break;
                    case 5:
                        bouton[j][h].innerHTML = "vacances"
                        bouton[j][h].className = "case perm default"
                        break;
                }
            }
        }
    }
    refreshDatabase();

    function select(j, h){
        if (ouvert[j][h] == 1) {
            common.loadpage("/perm/demande?j="+j+"&h="+h+"&w="+week)
        }
    }
}