//window.location.href = "../index.html";

//(new Date()).getWeek();


document.getElementById("planing").addEventListener("click", function () {
    window.location.href = "../perm/menu/menuPerm.html";
});


document.getElementById("semainePrecedente").addEventListener("click", function() {
    sessionStorage.setItem("week", parseInt(sessionStorage.getItem("week")) - 1);
    week = week - 1
    writeCookie("week",week)
    refreshDatabase()
});

document.getElementById("semaineActuelle").addEventListener("click", function() {
    sessionStorage.setItem("week", actualWeek);
    week = actualWeek
    writeCookie("week",week)
    refreshDatabase()
});


document.getElementById("semaineSuivante").addEventListener("click", function() {
    sessionStorage.setItem("week", parseInt(sessionStorage.getItem("week")) + 1);
    week = week + 1
    writeCookie("week",week)
    refreshDatabase()
});

document.getElementById("add point").addEventListener("click",function(){
	var nbpts=prompt("Nombre de point(s) à ajouter :","1")
    nbpts = parseFloat(nbpts.replaceAll(",","."))
    let nomgain
    if (nbpts!==null && !isNaN(nbpts)){
        nomgain=prompt("Nom du gain :", "gain de la semaine " + actualWeek)
        if (nomgain!==null){
      	    var conf=prompt("Vous etes sur le point d'ajouter " + nbpts + " point(s) à tous les eleves. Taper OUI pour poursuivre.","NON")
            namePoint=[]
            valuePoint=[]
            hashPoint=[]
            database.ref("histPoint").once("value", function(snapshot) {
                snapshot.forEach(function(child){
                    namePoint.push(snapshot.child(child.key+"/name").val())
                    valuePoint.push(snapshot.child(child.key+"/value").val())
                    hashPoint.push(child.key)
                })
            })
            database.ref("users").once("value", function(snapshot) {
                snapshot.forEach(function(child){
                    namePointU=[]
                    snapshot.child(child.key+"/score").forEach(function(child2){
                        namePointU.push(snapshot.child(child.key+"/score/"+child2.key+"/name").val())
                    })
                    for (let loop in namePoint){
                        if(!namePointU.includes(namePoint[loop])){
                            database.ref("users/"+child.key+"/score/"+hashPoint[loop]+"/name").set(namePoint[loop])
                            database.ref("users/"+child.key+"/score/"+hashPoint[loop]+"/value").set(valuePoint[loop])
                        }
                    }
                })
            })
        }
    }
	let hashCode= hash()
    let nb=0
	if (conf==="OUI"){
        database.ref("histPoint/" + hashCode + "/name").set(nomgain)
        database.ref("histPoint/" + hashCode + "/value").set(nbpts)
	    database.ref("users").once("value", function(snapshot) {
            let total = snapshot.numChildren()
            snapshot.forEach(function(child) {
                let name = child.key
                database.ref("users/" + name + "/score/" + hashCode + "/name").set(nomgain)
                database.ref("users/" + name + "/score/" + hashCode + "/value").set(nbpts)
                nb++
                if(nb == total){
                    if(nomgain=="gain de la semaine " + actualWeek) document.getElementById("notif plus").style.visibility = "hidden"
                    alert("Ajout de points effectués")
                }
            })
        })
    }
});



database.ref("histPoint").once("value", function(snapshot) {
    let test=true
    snapshot.forEach(function(child){
        if(snapshot.child(child.key+"/name").val()==="gain de la semaine " + actualWeek){
            test = false
        }
    })
    if(test){
        document.getElementById("notif plus").style.visibility = "visible"
    }
})


const body = document.getElementById("body");
Date.prototype.getWeek = function() {
    console.log(this)
    var onejan = new Date(this.getFullYear(), 0, 1);
    return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 0) / 7);
}





let bouton = [];
let total = [];
let demandes = [];
let places = [];
let inscrits = []
let ouvert = []
let nbAmis = []
let cout = []


for(let j = 0; j < 4; j++){
    let div = document.createElement("div")
    let text = document.createElement("button")
    text.className = "jours tableau";
    text.innerHTML = day[j]
    div.appendChild(text);

    bouton[j] = []
    total[j] = []
    places[j] = []
    demandes[j] = []
    nbAmis[j] = []
    inscrits[j] = []
    ouvert[j] = [0,0]
    cout[j] = []
    for(let h = 0; h < 2; h++){
        bouton[j][h] = document.createElement("button")
        bouton[j][h].id = "" + j + h;
        bouton[j][h].onclick = function(){select(j,h)};
        bouton[j][h].className="places tableau"
        div.appendChild(bouton[j][h]);

    }
    body.appendChild(div);

}


function refreshDatabase() {
    database.ref("foyer_midi/semaine" + week + "/menu").once('value').then(function (snapshotM) {
        let text = "Semaine n°" + week + " du " + semaine(week)
        if (week == actualWeek) {
            text = "Cette semaine (n°" + week + " du " + semaine(week) + ")"
        }
        document.getElementById("semaine").innerHTML = text

        let val = snapshotM.val()
        if (val == null) {
            val = "inconnu pour le moment"
        }
        document.getElementById("menu semaine").innerHTML = "<u>Menu de la semaine n°" + week + " :</u><br>" + val
    

        for (let j = 0; j < 4; j++) {
            for (let h = 0; h < 2; h++) {
                database.ref(path(j, h)).once('value').then(function (snapshotP) {
                    total[j][h] = snapshotP.child("places").val();
                    if(total[j][h]==null || total[j][h]==""){
                        total[j][h]=0
                    }

                    if (snapshotP.child("ouvert").val() == null) {
                        ouvert[j][h] = 0
                    } else {
                        ouvert[j][h] = snapshotP.child("ouvert").val()
                    }

                    if (snapshotP.child("cout").val() != null) {
                        cout[j][h] = Math.abs(parseFloat(snapshotP.child("cout").val()))
                    }
        
                    //demande en cours
        
                    demandes[j][h] = 0

                    snapshotP.child("demandes").forEach(function (child) {
                        demandes[j][h]++
                    });
        
                    //inscrits

                    inscrits[j][h] = 0
        
                    snapshotP.child("inscrits").forEach(function (child) {
                        inscrits[j][h]++
                    });
                    update(j, h);
                })
            }
        }
    });
}


function update(j,h){
    places[j][h] = total[j][h] - inscrits[j][h];
    
    let coutPourcentage = round((cout[j][h] - 1) * 100)
    let textcout = ""
    let text = "horaire non planifié";

    if(coutPourcentage != 0){
        if(coutPourcentage > 0){
            textcout += "<br><rouge>Cout en point : " + "+" + coutPourcentage + "%</rouge>"
        }else{
            textcout = "<br><vert>Cout en point : " + coutPourcentage + "%</vert>"
        }
    }

    switch (ouvert[j][h]){
        case 0:
            text = "horaire non planifié"
            bouton[j][h].className="ferme tableau"
            break;
        case 1:
            text = "ouvert à tous";
            bouton[j][h].className="inscrit tableau"
            break;
        case 2:
            bouton[j][h].className = "places tableau"
            text = inscrits[j][h]+" inscrits/"+total[j][h]  + " places"
            if(inscrits[j][h]>=total[j][h]){
                text+="<rouge></br>PLEIN</rouge>"
            }
            text+="</br>("+demandes[j][h]+" demandes pour " + places[j][h] + " places restantes)"+textcout
            break;
        case 3:
            bouton[j][h].className="bloque tableau"
            text = inscrits[j][h]+" inscrits/"+total[j][h]  + " places"
            if(inscrits[j][h]>=total[j][h]){
                text+="<rouge></br>PLEIN</rouge>"
            }
            text+="</br>("+demandes[j][h]+" demandes pour " + places[j][h] + " places restantes)"+textcout
            break;
        case 4:
            text = "Foyer fermé"
            bouton[j][h].className="zero tableau"
            break;
        case 5:
            text = "Fini"
            bouton[j][h].className="zero tableau"
            break;
        case 6:
            text = "Vacances"
            bouton[j][h].className="ferme tableau"
            break;
    }
    bouton[j][h].innerHTML = text;
}

function select(j,h){

    sessionStorage.setItem("j", j);
    sessionStorage.setItem("h", h);
    window.location.href = "../crenau/crenau.html";
}

function reload(){
    window.location.reload(true)
}


function loop(){
    refreshDatabase();

    setTimeout(loop,30000);
}
loop();

database.ref("banderole").once("value", function (snapshot) {
    let msg = snapshot.val()
    if (msg != null) {
        document.getElementById("banderole").innerHTML = msg
        if (msg.length > 0) {
            document.getElementById("banderole").style.animation = "defilement-rtl 10s infinite linear"

        }
    }


})

function clickBanderole(){
    database.ref("banderole").once("value", function(snapshot) {
        let p=window.prompt("Message de la banderole:",snapshot.val());
        if (p!=null){
            database.ref("banderole").set(p);
            document.getElementById("banderole").innerHTML = p
        }
    })
}

database.ref("foyer_midi/semaine" + week + "/menu").once('value').then(function (snapshot) {
    let val = snapshot.val()
    if (val == null) {
        val = "inconnu pour le moment"
    }
    document.getElementById("menu semaine").innerHTML = "<u>Menu de la semaine n°" + week + " :</u><br>" + val
});

function clickMenu(){
    database.ref("foyer_midi/semaine" + week + "/menu").once("value", function(snapshot) {
        let p=snapshot.val()
        if (p==null || p=="" || p=="null"){
            p = "inconnu pour le moment"
        }
        p=window.prompt("Menu de la semaine "+week+":",p);
        if (p==null){
            p=snapshot.val()
        }
        if (p==null || p=="" || p=="null"){
            p = "inconnu pour le moment"
        }
        database.ref("foyer_midi/semaine" + week + "/menu").set(p);
        document.getElementById("menu semaine").innerHTML = "<u>Menu de la semaine n°" + week + " :</u><br>" + p
    })
}

//-----------sondages--------------------
const notifMsg = document.getElementById("notif msg")

/*let nbMsg = 0
database.ref("messages/").once('value').then(function(snapshot) {
    snapshot.forEach(function(child) {
        let user = child.key
        database.ref("messages/" + user).once('value').then(function(snapshot) {
            snapshot.forEach(function(child) {
                let h = child.key
                database.ref("messages/" + user + "/" + h + "/lu").once('value').then(function(snapshot) {
                    let lu = snapshot.val()
                    if (lu!=true) {
                        nbMsg++
                        notifMsg.style.visibility = "visible"
                        notifMsg.innerHTML = nbMsg
                    }
                })
            })
        })
    })
})*/



let retourImg=document.getElementById("retourImg")
let retour=document.getElementById("retour")
database.ref("modo/users/"+user).once('value').then(function(snapshot) {
    if(snapshot.val()===1){
        retourImg.src="../../Images/option.png"
    } else {
        retourImg.src="../../Images/retour.png"
    }
    retour.addEventListener("click",function(){
        if(snapshot.val()===1){
            window.location.href="../../option/option.html"
        } else {
            window.location.href="../../menu/menu.html"
        }
    })
})