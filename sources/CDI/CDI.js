const Day = ["Lundi", "Mardi","Mercredi","Jeudi","Vendredi"]
const horaires = ["8h-9h","9h-10h","10h-11h","11h-12h","12h-13h","13h-14h","14h-15h","15h-16h","16h-17h"]

const listModePerm = ["Annuler","horaire non planifié","Ouvert","Fermé","Vacances"]


export async function init(common){
    const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop),
    });
    let lieu = ""
    if(params.lieu!=null){
        lieu = parseInt(params.lieu)
    }
    
    let bouton = []
    let ouvert = []

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
        ouvert[j] = []
        for (let h = 0; h < 9; h++) {
            bouton[j][h] = document.createElement("button")
            if(j == 2 && h >3){
                bouton[j][h].style.visibility = "hidden";
            }
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


        let allHorairePerm = await common.socketAsync("allHoraireLieu",{lieu:"CDI",w:week})
        ouvert = allHorairePerm.info

        for (let j = 0; j < 5; j++) {
            for (let h = 0; h < 9; h++) {
                bouton[j][h].className = "case perm blue"
                switch(ouvert[j][h].ouvert){
                    case 0:
                        bouton[j][h].innerHTML = "horaire non planifié"
                        bouton[j][h].className="case perm default"
                        break;
                    case 1:
                        let str = ""
                        /*allHorairePerm.listDemandes[j][h].forEach(function (child) {
                            if(child == common.classe || common.groups.indexOf(child)!=-1){
                                bouton[j][h].className = "case perm green"
                            }
                            if(str != ""){
                                str += ", "
                            }
                            str += child.group2
                        });*/
                        if(str != ""){
                            bouton[j][h].innerHTML = str
                            bouton[j][h].className="case perm yellow"
                        }else{
                            bouton[j][h].innerHTML="ouvert"
                        }
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
            }
        }
    }
    refreshDatabase();
}