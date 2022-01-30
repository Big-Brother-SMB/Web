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

let divAmis = document.getElementById("amis")
divAmis.innerHTML = "recherche d'amis en cours"
let amis = []
database.ref("users/" + user + "/amis").once("value", function(snapshot) {
    divAmis.innerHTML = ""
    snapshot.forEach(function(child) {
        let ami = document.createElement("button")
        ami.classList.add("amis")
        let name = child.key
        ami.innerHTML = name
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
    document.getElementById("info").innerHTML = "il reste " + reste + " places<br>(" + inscrits + " inscrits pour " + places + " places)<br>Il y déjà " + demandes + " demandes en cours<br>Votre score est de " + score + "pts"

    document.getElementById("oui").addEventListener("click", function() {
        database.ref(path(j,h) + "/users/" + user + "/score").set(score);
        database.ref(path(j,h) + "/users/" + user + "/classe").set(classe);
        for(let a in amis){
            database.ref(path(j,h) + "/users/" + user + "/amis/" + amis[a]).set(0);
        }
        database.ref(path(j,h) + "/demandes/" + user).set(score);
        database.ref(path(j,h) + "/demandes/" + user).once('value').then(function(snapshot) {
            if(snapshot.val() == score){
                window.location.href = menu;
            }
        });
        
        
    });
    document.getElementById("non").addEventListener("click", function() {
        window.location.href = menu;
    });

}

