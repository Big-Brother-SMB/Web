import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { getAuth,signInWithPopup ,onAuthStateChanged, GoogleAuthProvider, signInWithRedirect, signInWithCredential, getRedirectResult,setPersistence, signInWithEmailAndPassword, browserSessionPersistence } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js";

document.getElementById("chargement").style = "display:none"



console.log("start")
console.log(document.cookie)



let tablecookie = document.cookie.split('; ');
console.log(tablecookie)
let cookie = {};
for (let i in tablecookie) {
  let row = tablecookie[i].split('=')
  if (row.length > 1) {
    cookie[row[0]] = row[1];
  }
}
console.log("cookie", cookie)

if (cookie["RGPD"]) {
  document.getElementById("checkbox").checked = true
}


console.log("start")
console.log(document.cookie)

const firebaseApp = initializeApp({
  apiKey: "AIzaSyAPJ-33mJESHMcvEtaPX7JwIajUawblSuY",
  authDomain: "big-brother-ac39c.firebaseapp.com",
  databaseURL: "https://big-brother-ac39c-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "big-brother-ac39c",
  storageBucket: "big-brother-ac39c.appspot.com",
  messagingSenderId: "498546882155",
  appId: "1:498546882155:web:722a18432bf108e0c1632e",
  measurementId: "G-J5N38BGN7R"
})

const provider = new GoogleAuthProvider();
const auth = getAuth()

auth.onAuthStateChanged(function(user) {
  if (user && user.email.split("@")[1]=="stemariebeaucamps.fr") {
      console.log(user.displayName)
      document.getElementById("continue text").innerHTML = user.displayName
      document.getElementById("continue").style.display = "block"
      if (cookie["user"] != null) {
        window.location.href = "fin.html";
      }else{
        document.getElementById("continue").addEventListener("click",function(){
          window.location.href = "fin.html";
        })
      }
  } else {
      console.log("log out")
  }
});


document.getElementById("change").onclick = () => {
  if (document.getElementById("checkbox").checked) {
    signInWithPopup(auth, provider).then((result) => {

      const credential = GoogleAuthProvider.credentialFromResult(result)
      console.log("ok1")
  
      const token = credential.accessToken
  
      const user = result.user
  
      if (user.email.split("@")[1] == "stemariebeaucamps.fr") {
        console.log(user)
  
        sessionStorage.setItem("user", user.displayName);
        sessionStorage.setItem("email", user.email)
        window.location.href = "fin.html";
      } else {
        document.getElementById("body").style = "display:block"
        document.getElementById("chargement").style = "display:none"
        document.getElementById("infos").innerHTML = "Veuillez utiliser une adresse mail Beaucamps."
        alert("Veuillez utiliser une adresse mail Beaucamps.")
  
        console.log("Merci de prendre une adresse mail beaucamps")
  
      }
    })
    .catch((error) => {
      console.log(error)
      document.getElementById("body").style = "display:block"
      document.getElementById("chargement").style = "display:none"
      const err = error
    })
  } else {
    document.getElementById("infos").innerHTML = "Vous devez accepter la politique de confidentialité des données et les Cookies"
  }
}
