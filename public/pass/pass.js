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

const d = new Date();

const jour = ["1lundi", "2mardi","err","3jeudi","4vendredi"];
let user = sessionStorage.getItem("user");
let j = jour[d.getDay() - 1];
let h = d.getHours();
console.log("test");
console.log(j);
console.log(h);
document.getElementById("pass").innerHTML = "<img alt=\"\" src=\"croix.png\" />"
database.ref("foyer_midi").child("semaine51").child(j).child(h + "h").child("demandes").once("value", function(snapshot) {
    snapshot.forEach(function(child) {
        if(child.key == user){
            console.log("inscrit");
            document.getElementById("pass").innerHTML = "<img alt=\"\" src=\"pass.gif\" />"
        }else{
            console.log("pas inscrit");    
        }
      
    });
}); 



document.getElementById("retour").addEventListener("click", function() {
    window.location.href = "../menu/menu.html";
});