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
const menu = "../../menu/menu.html"

document.getElementById("envoyer").addEventListener("click", function() {
    let message = document.getElementById("text Area").value
    if(message.length <= 200 && message.length >= 20){
        console.log(message)
        database.ref("probleme/" + user).set(message)
        document.getElementById("info").style.color = "black"
        document.getElementById("info").innerHTML = "envoi de votre message encours, veuillez patientez"
        setTimeout(function() {
            window.location.href = menu;
        },1000);
        
    }else{
        document.getElementById("info").style.color = "red"
        document.getElementById("info").innerHTML = "Taille de message non réglementaire"
    }
    
});


document.getElementById("text Area").onkeydown =  function(){
    let lettres = document.getElementById("text Area").value.length
    document.getElementById("info").innerHTML = lettres + " lettres sur 200 authorisées (20 minimum)"
    if(lettres > 200 || lettres < 20){
        document.getElementById("info").style.color = "red"
    }else{
        document.getElementById("info").style.color = "black"
    }
};