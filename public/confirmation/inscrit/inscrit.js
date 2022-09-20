let j = parseInt(readIntCookie("j"));
let h = parseInt(readIntCookie("h"));

let divListeAmis = document.getElementById("liste d'amis")
let divAmisAjoute = document.getElementById("amis ajoutés")
let demandesAmis = []
let boolAmis = []
let initBoolAmis = []
let butAmis = []
let places = 0
let demandes = 0
let inscrits = 0
let score = 0
let textScore = ""
let horaire = 0

database.ref(path(j,h)).once('value').then(function(snapshot) {
    database.ref("users/" + user).once('value').then(function(snapshot1) {
        database.ref("names/").once('value').then(function(snapshotNames) {
            let i = 0
            places = snapshot.child("places").val()
            snapshot1.child("amis").forEach(function(child) {
                const amiID = child.key
                const name = snapshotNames.child(child.key).val()
                amis.push(amiID)
                demandesAmis.push(0)
                boolAmis.push(false)
                initBoolAmis.push(false)
                butAmis[i] = document.createElement("button")
                butAmis[i].classList.add("amis")
                butAmis[i].innerHTML = name
                i++
            })
            snapshot1.child("score").forEach(function(child) {
                score += parseFloat(snapshot1.child("score/"+child.key + "/value").val())
                score = round(score)
            })
            if (score <2) {
                textScore = score + " pt"
            }else{
                textScore = score + " pts"
            }
    
    
    
    
            if(snapshot.child("inscrits/" +user).val() == null){
                window.location.href = menu;
            }
        
            
            snapshot.child("inscrits/" + user + "/amis").forEach(function(child) {
                let name = child.key
                let index = amis.indexOf(name)
                boolAmis[index] = true
                initBoolAmis[index] = true
                if(index!=-1){
                    divAmisAjoute.appendChild(butAmis[index]);
                }
            })

            if(divAmisAjoute.innerHTML==""){
                console.log("tttt")
                divAmisAjoute.innerHTML="Personne"
            }
        
            snapshot.child("inscrits").forEach(function(child) {
                const name = child.key
                inscrits++
                const index = amis.indexOf(name)
                if(index != -1){
                    demandesAmis[index] = 2
                }
            });
        
            snapshot.child("demandes").forEach(function(child) {
                const name = child.key
                demandes++
                const index = amis.indexOf(name)
                if(index != -1){
                    demandesAmis[index] = 1
                }
            })
    
    
            if(h == 1){
                horaire = snapshot.child("inscrits/" + user + "/horaire").val()
                if(horaire==null)horaire=0
            }
    
    
    
    
            for(let i in demandesAmis){
                if(demandesAmis[i] == 1){
                    butAmis[i].innerHTML += " (a fait une demande)"
                }else if(demandesAmis[i] == 2){
                    butAmis[i].innerHTML += " (est inscrit)"
                }
            }
            console.log(h)
            console.log(horaire)
            document.getElementById("article").style.display = "inline"
            document.getElementById("chargement").style.display = "none"
            let reste = places - inscrits
        
            let info = "Inscrit pour le "+ day[j]  +  " à " + (h+11)+"h<br>"
            + reste + " places restantes<br>("
            + inscrits + " acceptées pour " + places + " places)<br>" + demandes
            + " demandes en cours"
        
            if(h == 1){
                if(horaire == 1 || horaire == 3){
                    info+="<br>Je termine à 12h20"
                }
                if(horaire == 2 || horaire == 3){
                    info+="<br>Je reprends à 12h50"
                }
            }

            document.getElementById("info").innerHTML = info
        
            document.getElementById("pass").addEventListener("click", function() {
                window.location.href = window.location.origin + "/pass/pass.html";
            });
        })
    })
})