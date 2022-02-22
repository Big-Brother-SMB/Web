const menu = "../../menu/menu.html"

let j = sessionStorage.getItem("j");
let h = parseInt(sessionStorage.getItem("h"));

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
let amis2 = []
let boolAmis = []
let butAmis = []
database.ref("users/" + user + "/amis").once("value", function(snapshot) {
    let i = 0
    snapshot.forEach(function(child) {
        amis2.push(child.key)
        boolAmis.push(bollAllAmis)
        butAmis[i] = document.createElement("button")
        butAmis[i].classList.add("amis")
        butAmis[i].innerHTML = amis2[i]
        if(boolAmis[i]){
            divAmisAjoute.appendChild(butAmis[i]);
        }else{
            divListeAmis.appendChild(butAmis[i]);
        }
        
        
        const num = i
        butAmis[num].addEventListener("click", function() {
            if(boolAmis[num]){
                divListeAmis.appendChild(butAmis[num]);
            }else{
                divAmisAjoute.appendChild(butAmis[num]);
            }
            boolAmis[num] = !boolAmis[num]
        })

        i++
    })

    charged()
})

document.getElementById("tout ajouter").addEventListener("click", function() {
    for(let i in boolAmis){
        boolAmis[i] = true;
        divAmisAjoute.appendChild(butAmis[i]);
    }
})


document.getElementById("tout retirer").addEventListener("click", function() {
    for(let i in boolAmis){
        boolAmis[i] = false;
        divListeAmis.appendChild(butAmis[i]);
    }
})






let places = 0
database.ref(path(j,h) + "/places").once('value').then(function(snapshot) {
    places = snapshot.val()
    charged()
});

let inscrits = 0
database.ref(path(j,h) + "/inscrits").once('value').then(function(snapshot) {
    snapshot.forEach(function(child) {
        inscrits++
    });
    charged()
});

let demandes = 0
database.ref(path(j,h) + "/demandes").once('value').then(function(snapshot) {
    snapshot.forEach(function(child) {
        demandes++      
    })
    charged()
});

let score = 0
database.ref("users/" + user + "/score").once('value').then(function(snapshot) {
    score = snapshot.val()
    charged()
});

let charge = 1
function charged(){
    if(charge < 7){
        charge++
        return
    }
    console.log("charged")
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
        for(let i in boolAmis){
            if(boolAmis[i]){
                database.ref(path(j,h) + "/users/" + user + "/amis/" + amis2[i]).set(0);
            }
            
        }
        

        
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

