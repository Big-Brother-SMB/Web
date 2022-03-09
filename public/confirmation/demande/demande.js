const menu = "../../menu/menu.html"

let j = sessionStorage.getItem("j");
let h = parseInt(sessionStorage.getItem("h"));

let charge = 1

database.ref(path(j,h) + "/ouvert").once('value').then(function(snapshot) {
    if(snapshot.val() != 7){
        window.location.href = menu;
    }
    charged()
});

database.ref(path(j,h) + "/info").once("value", function(snapshot) {
    let msg = snapshot.val()
    if(msg != null){
        document.getElementById("banderole").innerHTML = msg
    } 
    charged()
})

/*let divAmis = document.getElementById("amis")
divAmis.innerHTML = "recherche d'amis en cours"
let amis = []
database.ref("users/" + user + "/amis").once("value", function(snapshot) {
    divAmis.innerHTML = ""
    snapshot.forEach(function(child) {
        let ami = document.createElement("button")
        ami.classList.add("amis")
        let name = child.key
        if(bollAllAmis){
            ami.innerHTML = name + " (ajouté)"
                amis.push(name)
        }else{
            ami.innerHTML = name
        }
        
        ami.addEventListener("click", function() {
            if(amis.indexOf(name) == -1){
                console.log("add")
                ami.innerHTML = name + " (ajouté)"
                amis.push(name)
            }else{
                console.log("remove")
                ami.innerHTML = name
                amis.splice(amis.indexOf(name), 1)
                console.log(amis)
            }
            
        })
        divAmis.appendChild(ami);
    })
    charged()
})*/

let divListeAmis = document.getElementById("liste d'amis")
let divAmisAjoute = document.getElementById("amis ajoutés")
let amis = []
let demandesAmis = []
let amisCookie = []
try{
    amisCookie = readCookie("derniere demande").split("/")
}catch(Exception){
    
}

let boolAmis = []
let butAmis = []
database.ref("users/" + user + "/amis").once("value", function(snapshot) {
    let i = 0
    snapshot.forEach(function(child) {
        const name = child.key
        amis.push(name)
        demandesAmis.push(0)
        boolAmis.push(bollAllAmis || amisCookie.indexOf(name) != -1)
        butAmis[i] = document.createElement("button")
        butAmis[i].classList.add("amis")
        butAmis[i].innerHTML = amis[i]
        if(boolAmis[i]){
            divAmisAjoute.appendChild(butAmis[i]);
        }else{
            divListeAmis.appendChild(butAmis[i]);
        }
        updateConfirmation()
        
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

    charged()
})

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






let places = 0
database.ref(path(j,h) + "/places").once('value').then(function(snapshot) {
    places = snapshot.val()
    charged()
});

let inscrits = 0
database.ref(path(j,h) + "/inscrits").once('value').then(function(snapshot) {
    snapshot.forEach(function(child) {
        const name = child.key
        inscrits++ 
        const index = amis.indexOf(name)  
        if(index != -1){
            demandesAmis[index] = 2
        }
    });
    updateConfirmation()
    charged()
});

let demandes = 0

database.ref(path(j,h) + "/demandes").once('value').then(function(snapshot) {
    snapshot.forEach(function(child) {
        const name = child.key
        demandes++    
        const index = amis.indexOf(name)  
        if(index != -1){
            demandesAmis[index] = 1
        }
    })
    updateConfirmation()
    charged()
});

let score = 0
database.ref("users/" + user + "/score").once('value').then(function(snapshot) {
    snapshot.forEach(function(child) {
        database.ref("users/" + user + "/score/" + child.key + "/value").once('value').then(function(snapshot) {
            score += snapshot.val()
            score = Math.round(score*100)/100
        }) 
    })
    charged()
});

function charged(){
    if(charge < 7){
        charge++
        return
    }
    console.log("charged")

    for(let i in demandesAmis){
        if(demandesAmis[i] == 1){
            butAmis[i].innerHTML += " (a fait une demande)"
        }else if(demandesAmis[i] == 2){
            butAmis[i].innerHTML += " (inscrit)"
        }
    }


    document.getElementById("article").style.display = "inline"
    document.getElementById("chargement").style.display = "none"
    let reste = places - inscrits
    document.getElementById("info").innerHTML = "Demander l'inscription pour le "+ day[j]  +  " à " + (h+11)  + "h<br>Il reste " + reste + " places<br>(" + inscrits + " inscrits pour " + places + " places)<br>Il y déjà " + demandes + " demandes en cours<br>Votre score est de " + score + "pts"

    if(h == 1){
        document.getElementById("opt").style.display = "inline"

    }


    document.getElementById("oui").addEventListener("click", function() {
        database.ref(path(j,h) + "/users/" + user + "/score").set(score);
        database.ref(path(j,h) + "/users/" + user + "/classe").set(classe);
        /*for(let a in amis){
            database.ref(path(j,h) + "/users/" + user + "/amis/" + amis[a]).set(0);
        }*/
        let str = ""
        for(let i in boolAmis){
            if(boolAmis[i]){
                str += amis[i] + "/"
                database.ref(path(j,h) + "/users/" + user + "/amis/" + amis[i]).set(0);
            }
            
        }
        writeCookie("derniere demande",str)
        

        
        if(h == 1){
            let fini = document.getElementById("12h20").checked
            let commence = document.getElementById("12h50").checked
            if(fini || commence){
                database.ref(path(j,h) + "/users/" + user + "/horaire").set((fini?1:0) + (commence?2:0));
            }
        }
        database.ref(path(j,h) + "/demandes/" + user).set(score);
        database.ref(path(j,h) + "/demandes/" + user).once('value').then(function(snapshot) {
            if(snapshot.val() == score){
                setTimeout(function() {
                    window.location.href = menu;
                },1000);
                
            }
        });
        
        
    });
    document.getElementById("non").addEventListener("click", function() {
        window.location.href = menu;
    });

}

