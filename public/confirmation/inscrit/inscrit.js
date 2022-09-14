let j = sessionStorage.getItem("j");
let h = parseInt(sessionStorage.getItem("h"));

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


function updateConfirmation(){
    let pb = 0
    for(let i in boolAmis){
        if(boolAmis[i] && demandesAmis[i] == 0){
            pb++
        }
    }
    let p = document.getElementById("attention amis")
    if(pb == 0){
        p.innerHTML = ""
    }else if(pb == 1){
        p.innerHTML = "Attention, un ami n'a pas encore fait de demande"
    }else{
        p.innerHTML = "Attention, " + pb + " amis n'ont pas encore fait de demande"
    }

}

document.getElementById("tout ajouter").addEventListener("click", function() {
    for(let i in boolAmis){
        boolAmis[i] = true;
        divAmisAjoute.appendChild(butAmis[i]);
    }
    updateConfirmation()
})


document.getElementById("tout retirer").addEventListener("click", function() {
    for(let i in boolAmis){
        boolAmis[i] = false;
        divListeAmis.appendChild(butAmis[i]);
    }
    updateConfirmation()
})




database.ref(path(j,h)).once('value').then(function(snapshot) {
    database.ref("users/" + user).once('value').then(function(snapshot1) {
        database.ref("names/").once('value').then(function(snapshotNames) {
            let i = 0
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
                divListeAmis.appendChild(butAmis[i]);
        
                const num = i
                butAmis[num].addEventListener("click", function() {
                    if(boolAmis[num]){
                        divListeAmis.appendChild(butAmis[num]);
                    }else{
                        divAmisAjoute.appendChild(butAmis[num]);
                    }
                    boolAmis[num] = !boolAmis[num]
                    updateConfirmation()
                })
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
    
    
    
    
            if(snapshot.child("demandes/" +user).val() == null){
                window.location.href = menu;
            }
        
            
            snapshot.child("demandes/" + user + "/amis").forEach(function(child) {
                let name = child.key
                let index = amis.indexOf(name)
                boolAmis[index] = true
                initBoolAmis[index] = true
                if(index!=-1){
                    divAmisAjoute.appendChild(butAmis[index]);
                } else {
                    database.ref(path(j,h) + "/demandes/" + user + "/amis/" + name).remove()
                }
            })
        
            places = snapshot.child("places").val()
        
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
                horaire = snapshot.child("demandes/" + user + "/horaire").val()
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
        
            document.getElementById("info").innerHTML = "Demande enregistrée<br>" + reste + " places restantes<br>("
            + inscrits + " acceptées pour " + places + " places)<br>" + demandes
            + " demandes en cours<br>Votre score: " + textScore
        
            document.getElementById("retirer").addEventListener("click", function() {
                database.ref(path(j,h) + "/demandes/" + user).remove()
    
                console.log(path(j,h) + "/demandes/" + user)
        
                database.ref(path(j,h) + "/demandes/" + user).once('value').then(function(snapshot) {
                    database.ref(path(j,h) + "/ouvert").once('value').then(function(snapshotO) {
                        if(snapshot.val() == null && snapshotO.val() != null){
                            window.location.href = menu;
                        }
                    })
                });
            });
        
        
        
            if(h == 1){
                document.getElementById("opt").style.display = "inline"
                if(horaire == 1 || horaire == 3){
                    document.getElementById("12h20").checked = true
                }
                if(horaire == 2 || horaire == 3){
                    document.getElementById("12h50").checked = true
                }
        
            }
        
        
            document.getElementById("modif").addEventListener("click", function() {
                let str = ""
                for(let a in initBoolAmis){
                    if(initBoolAmis[a] != boolAmis[a]){
                        if(boolAmis[a]){
                            database.ref(path(j,h) + "/demandes/" + user + "/amis/" + amis[a]).set(0);
                        }else{
                            database.ref(path(j,h) + "/demandes/" + user + "/amis/" + amis[a]).remove()
                        }
                    }
                    if(boolAmis[a]){
                        str += amis[a] + "/"
                    }
                }
                writeCookie("derniere demande",str)
                database.ref(path(j,h) + "/demandes/" + user).once('value').then(function(snapshot) {
                    if(snapshot.val() != null){
                        setTimeout(function() {
                            window.location.href = menu;
                        },1000);
                    }
                });
            });
        
            document.getElementById("non").addEventListener("click", function() {
                window.location.href = menu;
            });
            updateConfirmation()
        })
    })
})