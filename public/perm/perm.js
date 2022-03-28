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

let horaires = ["8h-9h","9h-10h","10h-11h","13h-14h","14h-15h","15h-16h"]

let divHoraires = document.createElement("div")
let text = document.createElement("button")
    text.className = "jours tableau";
    text.style.height = "50px";
    text.style.visibility = "hidden";
    divHoraires.appendChild(text);
for (let h = 0; h < 6; h++) {
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
    for (let h = 0; h < 6; h++) {
        bouton[j][h] = document.createElement("button")
        bouton[j][h].id = "" + j + h;
        //bouton[j][h].onclick = function () { select(j, h) };
        bouton[j][h].className = "crenau"
        div.appendChild(bouton[j][h]);

    }
    body.appendChild(div);

}

document.getElementById("semainePrecedente").addEventListener("click", function () {
    week = week - 1
    writeCookie("week", week)
    refreshDatabase()
});

document.getElementById("semaineActuelle").addEventListener("click", function () {
    week = actualWeek
    writeCookie("week", week)
    refreshDatabase()
});


document.getElementById("semaineSuivante").addEventListener("click", function () {
    week = week + 1
    writeCookie("week", week)
    refreshDatabase()
});


function refreshDatabase() {

    let sn = ["28 au 1 avril", "4 au 8 avril", "11 au 15 avril"]

    let text = "Semaine n°" + week + " du " + sn[week - actualWeek]
    if (week == actualWeek) {
        text = "Cette semaine"
    }
    document.getElementById("semaine").innerHTML = text

    

    for (let j = 0; j < 4; j++) {
        for (let h = 0; h < 6; h++) {
           let heure = h + 8
           if(h >= 3){
               heure += 2
           }


            database.ref("perm/semaine" + week + "/" + dayNum[j] + "/" + heure + "h/classes").once("value", function (snapshot) {
                let str = ""
                snapshot.forEach(function (child) {
                    const name = child.key
                    if(str != ""){
                        str += ","
                    }
                    str += name

                });
                if(str == ""){
                    str = "aucune classe"
                }
                bouton[j][h].innerHTML = str
            });


        }
    }

}


function loop() {
    console.log("update database")
    refreshDatabase();
    setTimeout(loop, 20000);
}
loop();