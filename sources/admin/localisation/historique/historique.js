const Day = ["Lundi", "Mardi","Mercredi","Jeudi","Vendredi"]
const horaires = ["8h-9h","9h-10h","10h-11h","11h-12h","12h-13h","13h-14h","14h-15h","15h-16h","16h-17h"]

const listModePerm = ["Annuler","Sélection","Fermé","Ouvert à tous","Réservation","Vacances"]


export async function init(common){
    if(common.admin_permission["localisation"]==0) common.loadpage("/options")

    document.getElementById("btn_retour").classList.remove("cache")
    document.getElementById("btn_retour").setAttribute("url","/admin/localisation")

    let bouton = [];
    let demande = []
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
        demande[j] = []
        ouvert[j] = []
        for (let h = 0; h < 9; h++) {
            bouton[j][h] = document.createElement("button")
            if(j == 2 && h > 3){
                bouton[j][h].style.visibility = "hidden";
            }
            bouton[j][h].onclick = function () { select(j, h) };
            bouton[j][h].className = "case perm blue"
            bouton[j][h].innerHTML = horaires[h]
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
    }
    refreshDatabase();

    function select(j, h){
        common.loadpage("/admin/localisation/historique/creneau?j="+j+"&h="+h+"&w="+week)
    }
}