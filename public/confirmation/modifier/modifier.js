let j = sessionStorage.getItem("j");
let h = parseInt(sessionStorage.getItem("h"));

let charge = 1
const nbCharge = 8;

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


/*let divAmis = document.getElementById("amis")
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
})*/


let divListeAmis = document.getElementById("liste d'amis")
let divAmisAjoute = document.getElementById("amis ajoutés")
let demandesAmis = []
let boolAmis = []
let initBoolAmis = []
let butAmis = []
database.ref("users/" + user + "/amis").once("value", function(snapshot) {
    let i = 0
    snapshot.forEach(function(child) {
        amis.push(child.key)
        demandesAmis.push(0)
        boolAmis.push(false)
        initBoolAmis.push(false)
        butAmis[i] = document.createElement("button")
        butAmis[i].classList.add("amis")
        butAmis[i].innerHTML = amis[i]
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

    database.ref(path(j,h) + "/demandes/" + user + "/amis").once("value", function(snapshot) {
        snapshot.forEach(function(child) {
            let name = child.key
            let index = amis.indexOf(name)
            boolAmis[index] = true
            initBoolAmis[index] = true
            divAmisAjoute.appendChild(butAmis[index]);
        })
        updateConfirmation()
        charged()
    })

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
    charged()
});

let score = 0
let textScore = ""
database.ref("users/" + user + "/score").once('value').then(function(snapshot) {
    let nb = 0
    let charge2 = 1
    snapshot.forEach(function(child) {
        nb++
        database.ref("users/" + user + "/score/" + child.key + "/value").once('value').then(function(snapshot) {
            console.log(round(parseFloat(snapshot.val())))
            score += parseFloat(snapshot.val())
            score = round(score)
            charged2()
        })
    })

    function charged2(){
        console.log(charge2)
        if(charge2 < nb){
            charge2++
            return
        }
        console.log(score)
        if (score <2) {
            textScore = score + " pt"
        }else{
            textScore = score + " pts"
        }
        charged()
    }

});

let horaire = 0


if(h == 1){
    database.ref(path(j,h) + "/demandes/" + user + "/horaire").once('value').then(function(snapshot) {
        horaire = snapshot.val()
        charged()
    });
}else{
    charged()
}


function charged(){

    if(charge < nbCharge){
        charge++
        return
    }
    for(let i in demandesAmis){
        if(demandesAmis[i] == 1){
            butAmis[i].innerHTML += " (demande enregistrée)"
        }else if(demandesAmis[i] == 2){
            butAmis[i].innerHTML += " (accepté)"
        }
    }

    console.log("charged")
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



    getDemandesStat(null)

}



setTimeout(function(){
    while(charge < nbCharge - 1){
        charge++
    }
    charged()
}, 5000);
