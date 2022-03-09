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
let user = sessionStorage.getItem("user");
function path(j,h){
    return "foyer_midi/semaine51/" + (j+1) + jour[j] + "/" + (11 + h) + "h"
}
const menu = "../menu/menu.html"

document.getElementById("retour").addEventListener("click", function() {
    window.location.href = menu;
});

console.log("début");
database.ref("groupes").once("value", function(snapshot) {
    snapshot.forEach(function(child) {
        console.log(child.key);
        database.ref("groupes/"+ child.key + "/members").once("value", function(snapshot) {
            let number = snapshot.numChildren();
            snapshot.forEach(function(child2) {
                if(child2.key == user){
                    database.ref("groupes/"+ child.key + "/members/" + user).once('value').then(function(snapshot) {
                        deja(child.key,snapshot.val(),number);
                    });
                }
            });
        });
    });
    pasEncore();
});

function deja(groupe, value,number){
    let text = "faites parti"
    let text2 = "quitter"
    let chef = false
    if(value == 1){
        chef = true
        text = "êtes le chef"
        text2 = "supprimer"
    }
    document.getElementById("info").innerHTML = "vous " + text + " du groupe : " + groupe + " qui comporte " + number + " personne(s)" + "<br>Voulez vous le "+ text2 + " ?"
   
    document.getElementById("ok").addEventListener("click", function() {
        if(chef){
            database.ref("groupes/" + groupe).remove();
        }else{
            database.ref("groupes/" + groupe + "/members/" + user).remove();
        }
        window.location.reload(true)
    });
}

function pasEncore(){
    document.getElementById("info").innerHTML = "Vous ne faites parti d'aucun groupe."+
    "<br>Vous pouvez soit en creer un soit en rejoindre un."+
    "<br>Pour ce faire (creer ou rejoindre), veuillez indiquer le nom du groupe que vous comptez creer ou rejoindre puis appuyez sur ok"+
    "<br>nom du groupe : <input id =\"name\" type=\"text\"></input>"+
    "<br>mdp : <input id =\"mdp\" type=\"text\"></input>"
    document.getElementById("ok").addEventListener("click", function() {
        let name = document.getElementById("name").value;
        let mdp = document.getElementById("mdp").value;
        console.log(name) 
        database.ref("groupes/" + name).once("value", function(snapshot) {
            if(snapshot.val() == null){
                database.ref("groupes/" + name + "/members/" + user).set(1)
                database.ref("groupes/" + name + "/mdp").set(mdp)
                window.location.reload(true)
            }else{
                database.ref("groupes/" + name + "/mdp").once('value').then(function(snapshot) {
                    if(snapshot.val() == mdp){
                        database.ref("groupes/" + name + "/members/" + user).set(0)
                        window.location.reload(true)
                    }else{
                        document.getElementById("err").innerHTML = "erreur de mdp"
                    }
                    
                });
               
            }
        })
       
        
        
    });
}