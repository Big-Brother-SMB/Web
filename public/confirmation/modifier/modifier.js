const menu = "../../menu/menu.html"

let j = sessionStorage.getItem("j");
let h = parseInt(sessionStorage.getItem("h"));


database.ref(path(j,h) + "/demandes/" +user).once('value').then(function(snapshot) {
    if(snapshot.val() == null){
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


let divAmis = document.getElementById("amis")
divAmis.innerHTML = "recherche d'amis en cours"
let amis = []
let boolAmis = []
let initBoolAmis = []
let bAmis = []
database.ref("users/" + user + "/amis").once("value", function(snapshot) {
    divAmis.innerHTML = ""
    let i = 0
    snapshot.forEach(function(child) {
        let name = child.key
        amis.push(name)
        boolAmis.push(false)
        initBoolAmis.push(false)

        let b = document.createElement("button")
        b.classList.add("amis")
        b.innerHTML = name
        
        divAmis.appendChild(b);
        bAmis.push(b)
        i++
    })
    
    database.ref(path(j,h) + "/users/" + user + "/amis").once("value", function(snapshot) {
        snapshot.forEach(function(child) {
            let name = child.key
            let index = amis.indexOf(name)
            boolAmis[index] = true
            initBoolAmis[index] = true
            bAmis[index].innerHTML = name + " (ajouté)"
        })
        for(let i in bAmis){
            bAmis[i].addEventListener("click", function() {
                if(boolAmis[i]){
                    console.log("remove")
                    bAmis[i].innerHTML = amis[i]
                    boolAmis[i] = false         
                }else{
                    console.log("add")
                    bAmis[i].innerHTML = amis[i] + " (ajouté)"
                    boolAmis[i] = true 
                }
                
            })
        }
        charged()
    })
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

let horaire = 0

if(h == 1){
    database.ref(path(j,h) + "/users/" + user + "/horaire").once('value').then(function(snapshot) {
        horaire = snapshot.val()
        charged()
    });
}else{
    charged()
}

let charge = 1
function charged(){
    
    if(charge < 8){
        charge++
        return
    }
    console.log("charged")
    console.log(h)
    console.log(horaire)
    document.getElementById("article").style.display = "inline"
    document.getElementById("chargement").style.display = "none"
    let reste = places - inscrits
    document.getElementById("info").innerHTML = "Votre demande est enrgegistrée<br>Il reste " + reste + " places<br>(" + inscrits + " inscrits pour " + places + " places)<br>Il y déjà " + demandes + " demandes en cours (dont la votre)<br>Votre score est de " + score + "pts"
    document.getElementById("retirer").addEventListener("click", function() {
        database.ref(path(j,h) + "/users/" + user).remove()
        database.ref(path(j,h) + "/demandes/" + user).remove()

        database.ref(path(j,h) + "/demandes/" + user).once('value').then(function(snapshot) {
            if(snapshot.val() == null){
                window.location.href = menu;
            }
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
        for(let a in initBoolAmis){
            if(initBoolAmis[a] != boolAmis[a]){
                if(boolAmis[a]){
                    database.ref(path(j,h) + "/users/" + user + "/amis/" + amis[a]).set(0);
                }else{
                    database.ref(path(j,h) + "/users/" + user + "/amis/" + amis[a]).remove()
                }
            }  
        }
        database.ref(path(j,h) + "/demandes/" + user).once('value').then(function(snapshot) {
            if(snapshot.val() != null){
                window.location.href = menu;
            }
        });
    });

    document.getElementById("non").addEventListener("click", function() {
        window.location.href = menu;
    });



    getDemandesStat(null)

}



