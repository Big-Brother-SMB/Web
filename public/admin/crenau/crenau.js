const menu = "../../menu/menu.html"

let j = sessionStorage.getItem("j");
let h = parseInt(sessionStorage.getItem("h"));
console.log(path(j,h));


let divMode = document.getElementById("mode")
for(let i in listMode){
    let opt = document.createElement("option")
    opt.innerHTML = listMode[i]
    divMode.appendChild(opt);
}

database.ref(path(j,h) + "/ouvert").once('value').then(function(snapshot) {
    
    divMode.selectedIndex = snapshot.val();
    divMode.addEventListener("change", function() {
        database.ref(path(j,h) + "/ouvert").set(this.selectedIndex)
      });
});

let inPlaces = document.getElementById("places")
let places
database.ref(path(j,h) + "/places").once('value').then(function(snapshot) {
    places = snapshot.val();
    inPlaces.value = places
    inPlaces.addEventListener("change", function() {
        places = this.value
        database.ref(path(j,h) + "/places").set(places)
    });
});


let inCout = document.getElementById("cout")
let cout
database.ref(path(j,h) + "/cout").once('value').then(function(snapshot) {
    cout = snapshot.val();
    inCout.value = cout
    inCout.addEventListener("change", function() {
        cout = Math.abs(this.value);
        database.ref(path(j,h) + "/cout").set(cout)
    });
    if(snapshot.val() == null){
        database.ref(path(j,h) + "/cout").set(1)
        inCout.value = 1
    }
});


let inPer = document.getElementById("per")
let perMin
database.ref(path(j,h) + "/perMin").once('value').then(function(snapshot) {
    perMin = snapshot.val();
    inPer.value = perMin
    inPer.addEventListener("change", function() {
        perMin = this.value
        database.ref(path(j,h) + "/perMin").set(perMin)
    });
    if(snapshot.val() == null){
        database.ref(path(j,h) + "/perMin").set(75)
        inPer.value = 75
    }
});


let sOnly = document.getElementById("switch prio only")
let only
database.ref(path(j,h) + "/uniquement prioritaires").once('value').then(function(snapshot) {
    only = snapshot.val();
    sOnly.checked = only
    sOnly.addEventListener("change", function() {
        only = this.checked
        console.log("uniquement prios : " + only)
        database.ref(path(j,h) + "/uniquement prioritaires").set(only)
    });
    if(snapshot.val() == null){
        database.ref(path(j,h) + "/uniquement prioritaires").set(false)
        sOnly.checked = false
    }
});

let sGratuit = document.getElementById("switch gratuit")
let gratuit
database.ref(path(j,h) + "/gratuit prioritaires").once('value').then(function(snapshot) {
    gratuit = snapshot.val();
    sGratuit.checked = gratuit
    sGratuit.addEventListener("change", function() {
        gratuit = this.checked
        console.log("gratuit : " + gratuit)
        database.ref(path(j,h) + "/gratuit prioritaires").set(gratuit)
    });
    if(snapshot.val() == null){
        database.ref(path(j,h) + "/gratuit prioritaires").set(false)
        sGratuit.checked = false
    }
});


function nbPersDemande(nb){
    document.getElementById("demandes").innerHTML = "demandes (" + nb + ")"
}
nbPers(j,h,"demandes",nbPersDemande)

document.getElementById("demandes").addEventListener("click", function() {
    window.location.href = "listes/demandes.html";
});

let inscrits
function nbPersInscrit(nb){
    inscrits = nb
    document.getElementById("inscrits").innerHTML = "inscrits (" + nb + ")"
}
nbPers(j,h,"inscrits",nbPersInscrit)

document.getElementById("inscrits").addEventListener("click", function() {
    window.location.href = "listes/inscrits.html";
});

let divGroupes = document.getElementById("groupes")

let cbGroupes = []
let groupes = []
let iG = 0
database.ref("priorites").once("value", function(snapshot) {
    snapshot.forEach(function(child) {
        const index = iG;
        groupes.push(child.key)
        let gr = document.createElement("p")
        cbGroupes[index] = document.createElement("input")
        cbGroupes[index].type = "checkbox"
        cbGroupes[index].addEventListener("click", function() {
            if(cbGroupes[index].checked){
                database.ref(path(j,h) + "/prioritaires/" + groupes[index]).set(0)
            }else{
                database.ref(path(j,h) + "/prioritaires/" + groupes[index]).remove()
            }
           
        })
        //cbClasses[n][i].checked = true
        gr.innerHTML = groupes[index]
        gr.appendChild(cbGroupes[index]);
        divGroupes.appendChild(gr);
        iG++;
    })

})

let divClasses = document.getElementById("classes")
let cbClasses = []
console.log(listNiveau)
for(let n in listNiveau){
    cbClasses[n] = []
    let divNiveau = document.createElement("div")
    divNiveau.style="display: inline-block;*display: inline;width:20%"

    let nSelectAll = document.createElement("button")
    nSelectAll.className = "bTriNiveau"
    nSelectAll.innerHTML ="selectionner tous les " + nomNiveau[n]
    nSelectAll.addEventListener("click", function() {
        console.log("niveau " + n + " select all")
        for(i in cbClasses[n]){
            cbClasses[n][i].checked = true
            database.ref(path(j,h) + "/prioritaires/" + listNiveau[n][i]).set(0)
        }
        
    });
    divNiveau.appendChild(nSelectAll);

    let nSelectNone = document.createElement("button")
    nSelectNone.className = "bTriNiveau"
    nSelectNone.innerHTML ="retirer tous les " + nomNiveau[n]
    nSelectNone.addEventListener("click", function() {
        console.log("niveau " + n + " select none")
        for(i in cbClasses[n]){
            cbClasses[n][i].checked = false
            database.ref(path(j,h) + "/prioritaires/" + listNiveau[n][i]).remove()
        }
        
    });
    divNiveau.appendChild(nSelectNone);

    let nInversed = document.createElement("button")
    nInversed.className = "bTriNiveau"
    nInversed.innerHTML ="Inverser tous les " + nomNiveau[n]
    nInversed.addEventListener("click", function() {
        console.log("niveau " + n + " inversed")
        for(i in cbClasses[n]){
            cbClasses[n][i].checked = !cbClasses[n][i].checked
            if(cbClasses[n][i].checked){
                database.ref(path(j,h) + "/prioritaires/" + listNiveau[n][i]).set(0)
            }else{
                database.ref(path(j,h) + "/prioritaires/" + listNiveau[n][i]).remove()
            }
        }
        
    });
    divNiveau.appendChild(nInversed);



    for(let i in listNiveau[n]){
        let opt = document.createElement("p")
        cbClasses[n][i] = document.createElement("input")
        cbClasses[n][i].type = "checkbox"
        //cbClasses[n][i].checked = true
        opt.innerHTML = listNiveau[n][i]
        opt.appendChild(cbClasses[n][i]);
        cbClasses[n][i].addEventListener("click", function() {
            if(cbClasses[n][i].checked){
                database.ref(path(j,h) + "/prioritaires/" + listNiveau[n][i]).set(0)
            }else{
                database.ref(path(j,h) + "/prioritaires/" + listNiveau[n][i]).remove()
            }
           
        })
        divNiveau.appendChild(opt);
    }
    divClasses.appendChild(divNiveau);
    
}

//let prio = []
database.ref(path(j,h) + "/prioritaires").once("value", function(snapshot) {
    snapshot.forEach(function(child) {
        let c = child.key
        console.log(c)
        //prio.push(c)
        let index = indexOf2dArray(listNiveau,c)
        let index2 = groupes.indexOf(c)
        console.log("index prio : " + index)
        if(index != -1){
            cbClasses[index[0]][index[1]].checked = true
        }else if(index2 != -1){
            cbGroupes[index2].checked = true
        }
    })
})

document.getElementById("select all").addEventListener("click", function() {
    console.log("select all")
    for(let n in cbClasses){
        for(let i in cbClasses[n]){
            cbClasses[n][i].checked = true
            database.ref(path(j,h) + "/prioritaires/" + listNiveau[n][i]).set(0)
        }
    }
});

document.getElementById("select none").addEventListener("click", function() {
    console.log("select none")
    for(let n in cbClasses){
        for(let i in cbClasses[n]){
            cbClasses[n][i].checked = false
            database.ref(path(j,h) + "/prioritaires/" + listNiveau[n][i]).remove()
        }
    }
});

document.getElementById("inversed").addEventListener("click", function() {
    console.log("inversed")
    for(let n in cbClasses){
        for(let i in cbClasses[n]){
            cbClasses[n][i].checked = !cbClasses[n][i].checked
            if(cbClasses[n][i].checked){
                database.ref(path(j,h) + "/prioritaires/" + listNiveau[n][i]).set(0)
            }else{
                database.ref(path(j,h) + "/prioritaires/" + listNiveau[n][i]).remove()
            }
        }
    }
});




/*document.getElementById("start algo").addEventListener("click", function() {
    let classes = []
    console.log("start algo")
    for(let n in cbClasses){
        for(let i in cbClasses[n]){
            if(cbClasses[n][i].checked){
                classes.push(listNiveau[n][i])
            }
             
        }
    }
    tri(classes,places,inscrits)
});

function tri(classes,p,inscrits){
    console.log("authorised class",classes)
    getStat(j,h,"demandes")
    let places = p - inscrits
    let ajout = 0
    while(ajout < places){
        let alea = randint(0, score[scMin].length - 1)
                let i = alea
                do{
                    let ok = classes.indexOf(usersClasse[i]) != -1
                    for(let a in addLinkTag[i]){
                        if(classes.indexOf(usersClasse[i]) == -1){
                            ok = false
                        }
                    }
                    if(ok){
                        ajout = ajout + inscrire(j,h,i)
                    }
                    i++
                    
                }while(!ok && i != alea)
    }

}*/
document.getElementById("start algo").addEventListener("click", function() {
    algo()
})

function algo(){
    document.getElementById("start algo").innerHTML = "veuillez patienter"
    let places
    database.ref(path(j,h) + "/places").once('value', function(snapshot) {
        places = snapshot.val();
    });
    let inscrits = 0
    let dejaInscrit
    database.ref(path(j,h) + "/inscrits").once('value').then(function(snapshot) {
        snapshot.forEach(function(child) {
            inscrits++
        })
        dejaInscrit = inscrits
    });

    let cout
    database.ref(path(j,h) + "/cout").once('value').then(function(snapshot) {
        cout = snapshot.val();
    });


    let prio = []
    database.ref(path(j,h) + "/prioritaires").once("value", function(snapshot) {
        snapshot.forEach(function(child) {
            prio.push(child.key)
        })
    })
    
    getStat(j,h,"demandes")
    setTimeout(function() {
        let tag = []
        for(let u in users){
            tag[u] = false
        }

        function sendEmail(prenom,email){
            Email.send({
                Host: "smtp.gmail.com",
                Username: "foyer.beaucamps@gmail.com",
                Password: "beaucamps",
                To: email,
                From: "foyer.beaucamps@gmail.com",
                Subject: "Inscription validée",
                Body: "Bonjour " + prenom + ", ton inscription au foyer le " + day[j] + " à " + (h+11) + "h a été validée",
            })
            .then(function (message) {
                console.log(message)
                if(message != "OK"){
                    sendEmail(prenom,email)
                }else{
                    console.log("mail sent successfully to " + email)
                    
                    nbEmail++
                    if(fini){
                        document.getElementById("start algo").innerHTML = "fini, " + (inscrits - dejaInscrit) + " inscriptions<br>il reste " + (places - inscrits) + " places<br>appuyer pour reload<br>Email : " + nbEmail + "/" + (inscrits - dejaInscrit)
                        if(nbEmail == (inscrits - dejaInscrit)){
                            document.getElementById("start algo").innerHTML = "fini, " + (inscrits - dejaInscrit) + " inscriptions<br>il reste " + (places - inscrits) + " places<br>appuyer pour reload<br>Email : fini"
                        }
                    }
                }
                
            });
        }
        
        let alea = randint(0, users.length - 1)
        let base = alea
        let nbEmail = 0
        let fini = false
        var maxScore = Math.max(...gScore);
        let bPrio = true;
        let hashCode = hash()
        console.log("max score : " + maxScore)
        while(places > inscrits && maxScore >= 0){
            console.log("inscrit",inscrits)
            let nbPrio = 0
            for(let a in addLinkTag[alea]){
                const tag = addLinkTag[alea][a]
                if(prio.indexOf(usersClasse[tag]) != -1 || commonElement(prio, usersPriorites[tag]) != 0){
                    nbPrio++
                }
                
            }
            let perPrio = Math.round(nbPrio / addLinkTag[alea].length * 100)
            if(!tag[alea] && gScore[alea] >= maxScore && addLinkTag[alea].length <= places - inscrits && (!bPrio || perPrio >= perMin) ){ 
                console.log(users[alea] + " -> per prio : " + perPrio + "% (" + usersClasse[alea] + ")")
                for(let pers in addLinkTag[alea]){
                    let p = addLinkTag[alea][pers]
                    if(!tag[p]){
                        let name = users[p]
                        console.log("inscrit : " + name)
                        let score = usersScore[p]
                        if(score == null){
                            score = 0
                        }
                        database.ref(path(j,h) + "/inscrits/" + name).set(score)
                        if(gratuit && (commonElement(prio, usersPriorites[p]) != 0 || prio.indexOf(usersClasse[p]) != -1) ){
                            console.log("gratis")
                        }else{
                            
                            
                            database.ref("users/" + name + "/score/" + hashCode + "/name").set("Repas du " + dayLowerCase[j] + " " + getDayText(j) +  " à " + (11 + h) + "h")
                            database.ref("users/" + name + "/score/" + hashCode + "/value").set(-cout)
                        }
                       
                        
                        database.ref(path(j,h) + "/demandes/" + name).remove()
                        try{
                            database.ref("users/" + users[p] + "/email").once("value",function(snapshot){
                                let email = snapshot.val()
                                let prenom = users[p].split(" ")[0]
                                console.log(email)
                                sendEmail(prenom,email)
                            })
                            
                        }catch(exception){
                            console.log(exception)
                        }
                        
                        tag[p] = true
                        inscrits++
                    }
                    
                }
                alea = randint(0, users.length - 1)
                base = alea
            }else{
                alea++  
                if(alea > users.length - 1){
                    alea = 0
                }
                if(alea == base){
                    maxScore--
                    console.log("plus de possibilité pour ce score, nouveau : " + maxScore)
                }
                if(maxScore < 0 && bPrio && !only){
                    console.log("passage au non prioritaires")
                    maxScore = Math.max(...gScore);
                    bPrio = false
                }
                
            }
        }
        console.log("plus de places")
        database.ref("version").once("value", function(snapshot) {
            fini = true
            if(snapshot.val() != null){
                document.getElementById("start algo").innerHTML = "fini, " + (inscrits - dejaInscrit) + " inscriptions<br>il reste " + (places - inscrits) + " places<br>appuyer pour reload<br>Email envoyés : " + nbEmail
            }else{
                document.getElementById("start algo").innerHTML = "Une erreur a eu lieu,<br>appuyer pour reload<br>(" + (inscrits - dejaInscrit) + " inscrits, reste " + (places - inscrits) + " places)"
                
            }
            document.getElementById("start algo").addEventListener("click", function() {
                reload()
            })
        });
        
        
    },1000);
}


