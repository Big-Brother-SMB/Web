const body = document.getElementById("body");

let bouton = [];
let placesTotal = [];
let nbDemandes = [];
let demandes = []
let demande = []
let places = [];

let ouvert = []
let cout = []
let nbAmis = []
let nbAmisDemande = []

let inscrits = [];
let inscrit = []

let horaires = ["de 8h à 9h","9h - 10h","10h - 11h",""]

let divHoraires = document.createElement("div")
for (let h = 0; h < 7; h++) {
    let horaire = document.createElement("button")
    horaire.innerHTML = horaires[h]
    horaire.className = "horaire"
    divHoraires.appendChild(horaire);

}
body.appendChild(divHoraires);

for (let j = 0; j < 4; j++) {
    let div = document.createElement("div")
    let text = document.createElement("button")
    text.className = "jours tableau";
    text.innerHTML = day[j]
    div.appendChild(text);

    bouton[j] = []
    placesTotal[j] = []
    places[j] = []

    nbAmis[j] = []
    nbAmisDemande[j] = []
    nbDemandes[j] = []
    demandes[j] = []
    demande[j] = [false, false]

    inscrits[j] = []
    inscrit[j] = [false, false]
    ouvert[j] = [0, 0]
    cout[j] = [1, 1]
    for (let h = 0; h < 7; h++) {
        bouton[j][h] = document.createElement("button")
        bouton[j][h].id = "" + j + h;
        bouton[j][h].onclick = function () { select(j, h) };
        bouton[j][h].className = "crenau"
        div.appendChild(bouton[j][h]);

    }
    body.appendChild(div);

}



function refreshDatabase() {

    let sn = ["21 au 25 mars", "28 au 1 avril", "4 au 8 avril", "11 au 15 avril"]

    let text = "Semaine n°" + week + " du " + sn[week - actualWeek]
    if (week == actualWeek) {
        text = "Cette semaine"
    }
    document.getElementById("semaine").innerHTML = text

    

    nbFois = 0;
    for (let j = 0; j < 4; j++) {
        for (let h = 0; h < 2; h++) {
           


            database.ref("perm/semaine12/" + dayWithNum[j] + "/" + (h+11) + "h/inscrits").once("value", function (snapshot) {
                snapshot.forEach(function (child) {
                    const name = child.key
                    nbDemandes[j][h] = nbDemandes[j][h] + 1
                    if (name == user) {
                        nbFois++;
                        demande[j][h] = true;
                    } else {
                        demandes[j][h].push(name)
                    }

                });
                update(j, h);
            });


        }
    }

}