const firebaseConfig = {
    apiKey: "AIzaSyAPJ-33mJESHMcvEtaPX7JwIajUawblSuY",
    authDomain: "big-brother-ac39c.firebaseapp.com",
    databaseURL: "https://big-brother-ac39c-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "big-brother-ac39c",
    storageBucket: "big-brother-ac39c.appspot.com",
    messagingSenderId: "498546882155",
    appId: "1:498546882155:web:722a18432bf108e0c1632e",
    measurementId: "G-J5N38BGN7R"
};

firebase.initializeApp(firebaseConfig);


var database = firebase.database()
const jour = ["1lundi", "2mardi","3jeudi","4vendredi"];
function path(j,h){
    return "foyer_midi/test" + "/" + jour[j] + "/" + (11 + h) + "h"
}
function randint(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}
function pop(arr, index) {
    return arr.filter(function(value, arrIndex) {
      return index !== arrIndex;
    });
}
function reload(){
    window.location.reload(true)
}

window.location.href = "menu/menu.html";

let bouton = [];
for(let j = 0; j < 4; j++){
    let div = document.createElement("div")
    let text = document.createElement("button")
    text.className = "jours";
    text.innerHTML = jour[j]
    div.appendChild(text);
    
    bouton[j] = []
    for(let h = 0; h < 2; h++){
        bouton[j][h] = document.createElement("button")
        
        div.appendChild(bouton[j][h]);
        bouton[j][h].innerHTML = "X"
        database.ref(path(j,h) + "/ouvert").once('value').then(function(snapshot) {
                
            if(snapshot.val() == 7){
                bouton[j][h].onclick = function(){suite1(j,h);}; 
                bouton[j][h].innerHTML = "lancer la phase 1" 
            }
        });
      
    }
    body.appendChild(div);
   
}



function suite1(j,h){
    database.ref(path(j,h) + "/ouvert").set(8)
    database.ref(path(j,h) + "/places").once('value').then(function(snapshot) {
        suite2(snapshot.val(),j,h);
    });
}

function suite2(placesDisp,j,h){
    /*database.ref(path(j,h)).once('child_added').then(function(snapshot) {
        let nbChild = 0
        if(snapshot.numChildren() >= 0){
            nbChild = snapshot.numChildren()
        }
        robi(nbChild, placesDisp,j,h)
        
    });*/
    let tab = []
    //Array(100).fill([]);
    /*let amis = []
    let i = 0*/
    database.ref(path(j,h)+"/demandes").once("value", function(snapshot) {
        snapshot.forEach(function(child) {
            let user = child.key
            
            console.log("user : " + user)
            tab.push(user)
            
            
            /*let tAmi = []
            database.ref(path(j,h)+"/demandes/" + user +"/amis").once("value", function(snapshot) {
                snapshot.forEach(function(child) {
                    let ami = child.key
                    console.log("   ami : " + ami)
                    tAmi.push(ami)
                })
            })
            amis[i] = tAmi
            i = i + 1*/
        });
        /*setTimeout(function() {
            robi(tab, placesDisp,j,h)
        },1000);*/

        let score = []
        let userSc = []
        for(let u in tab){
            let user = tab[u] 
            database.ref(path(j,h)+"/demandes/" + user + "/score").once("value", function(snapshot) {
                let sc = snapshot.val()
                if(score[sc] == null){
                    score[sc] = []
                }
                score[sc].push(u)
                userSc.push(sc)
                console.log(user + "(" + u + ") -> " + sc)
            })
        }



        let amis = []
        for(let u in tab){
            amis[u] = []
            database.ref(path(j,h)+"/demandes/" + tab[u] +"/amis").once("value", function(snapshot) {
                snapshot.forEach(function(child) {
                    let ami = child.key
                    console.log("   ami : " + ami)
                    let index = tab.indexOf(ami)
                    if(index != -1){
                        amis[index].push(tab[u])
                    }
                   
                })
            })
        }
        setTimeout(function() {
            
            console.log(tab)
            console.log(score)
            console.log(userSc)
            console.log(amis)
            
            robi(tab,score,userSc,amis, placesDisp,j,h)
        },1000);
        
        
    });

}

let tag
let nbTag
let chain
let chainTab
let chainAct
let score
let userSc
function robi(pers,sc,usc,amis, places,j,h){
    console.log("tri")
    tag = Array(pers.length).fill(false);
    nbTag = 0
    chain = 0
    chainTab = Array(150).fill([]);
    chainAct = []
    let scMin = 0
    score = sc
    userSc = usc
    while(pers.length - nbTag > places){
        let boucle
        let del
        do{
            boucle = false
            if(score[scMin] == null){
                scMin++
                boucle = true
                console.log("score suivant : " + scMin)
            }else{
                let alea = randint(0, score[scMin].length - 1)
                let i = alea
                do{
                    del = score[scMin][i]
                    i++
                    if(i >= score[scMin].length){
                        i = 0
                    }
                    if(tag[del]){
                        console.log("déjà tag : " + del)
                    }
                    
                }while(tag[del] && i != alea)
                if(i == alea && tag[del]){
                    scMin++
                    boucle = true
                    console.log("score suivant (boucle): " + scMin)
                }
            }

           

            
            
        }while(boucle)
        
        console.log(score[scMin])
        d(del,pers,amis)
        /*if(chain == 0){
            console.log("err chaine")
        }else{
            console.log("chaine : " + chain)
            chainTab[chain].push(chainAct)
            chainAct = []
            chain = 0
        }*/
        console.log("nbTag : " + nbTag)
    }
    let placesRestantes = places - pers.length + nbTag
    console.log("places rest : " + placesRestantes)

    let correstTab = chainTab[0];
    //for(let n in chainTab){
        for(let g in correstTab){
            console.log(correstTab[g])
        }
    //}
    console.log(correstTab)

    let numPicker = []
    for(let g in correstTab){
        numPicker.push(g)
    }
    /*let ajoutTab = []
    for(let i in correstTab){
        let n = randint(0, numPicker.length - 1)
        let g = numPicker[n]
        numPicker = pop(numPicker,n)
        if(correstTab[g].length <= placesRestantes){
            console.log("ajout : " + correstTab[g].length)
            console.log(correstTab[g])
            placesRestantes = placesRestantes - correstTab[g].length
            ajoutTab.push.apply(ajoutTab, correstTab[g]);
        }else{
            console.log("trop gros : " + correstTab[g].length)
        }
    }
    console.log(ajoutTab)
    /*for(let u in ajoutTab){
        tag[ajoutTab[u]] = false
        console.log("untagged : " + ajoutTab[u])
    }*/


    for(let t in tag){
        if(tag[t]){
            console.log("tagged : " + pers[t] + " (" + t + ")")
            /*database.ref("users/" + pers[t] + "/score").set(userSc[t] + 1)
            console.log("new score : " + (userSc[t] + 1))
            database.ref(path(j,h) + "/demandes/" + pers[t]).remove();*/
        }else{
            //database.ref(path(j,h) + "/inscrits/" + pers[t]).set(0)
        }
    }
    console.log("fini")
}

function d(numero,pers,amis){
    if(!tag[numero]){
        console.log("score user : " + userSc[numero])
        //score[userSc[numero]] = pop(score[userSc[numero]], score[userSc[numero]].indexOf[numero])
        chain++
        chainAct.push(numero)
        console.log("del : " + numero)
        tag[numero] = true
        nbTag++
        for(let a in amis[numero]){
            d(pers.indexOf(amis[numero][a]),pers,amis)
        }
    }
    
}
