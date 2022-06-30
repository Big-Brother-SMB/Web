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

let horaires = ["8h-9h","9h-10h","10h-11h","11h-12h","13h-14h","14h-15h","15h-16h"]

let divHoraires = document.createElement("div")
let text = document.createElement("button")
    text.className = "jours tableau";
    text.style.height = "50px";
    text.style.visibility = "hidden";
    divHoraires.appendChild(text);
for (let h = 0; h < 7; h++) {
    let horaire = document.createElement("button")
    horaire.innerHTML = horaires[h]
    horaire.className = "horaire"
    divHoraires.appendChild(horaire);

}
body.appendChild(divHoraires);

for (let j = 0; j < 5; j++) {
    let div = document.createElement("div")
    let text = document.createElement("button")
    text.className = "jours tableau";
    text.innerHTML = dayMer[j]
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
        if((j == 2 && h >3) || (h == 3 && j != 2)){
            bouton[j][h].style.visibility = "hidden";
        }

        //bouton[j][h].id = "" + j + h;
        bouton[j][h].onclick = function () { select(j, h) };
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

    

    for (let j = 0; j < 5; j++) {
        for (let h = 0; h < 7; h++) {
            let heure = h + 8
            if(h >= 4){
                heure += 1
            }


            bouton[j][h].innerHTML = "aucune info"
            database.ref(pathPerm(j,h) + "/ouvert").once("value", function (snapshot) {

                let ouvert = snapshot.val()
                if (ouvert == null){
                    ouvert = 0
                }
                if(ouvert == 0){
                    database.ref(pathPerm(j,h) + "/classes").once("value", function (snapshot2) {
                        let str = ""
                        snapshot2.forEach(function (child) {
                            const name = child.key
                            if(str != ""){
                                str += ", "
                            }
                            str += name

                        });
                        if(str != ""){
                            bouton[j][h].innerHTML = str
                        }
                        
                    });
                }else{
                    switch(ouvert){
                        case 1:
                            bouton[j][h].innerHTML = "fermé"
                            break;
                        case 2:
                            bouton[j][h].innerHTML = "ouvert à tous"
                            break;
                        case 3:
                            bouton[j][h].innerHTML = "réservé"
                            break;
                        case 4:
                            bouton[j][h].innerHTML = "vacances"
                            break;
                    }
                    
                }

               

           })


        }
    }

}


function select(j,h){
    sessionStorage.setItem("j", j);
    sessionStorage.setItem("h", h);
    window.location.href = "../crenau/crenauPerm.html";
}


function loop() {
    console.log("update database")
    refreshDatabase();
    setTimeout(loop, 20000);
}
loop();