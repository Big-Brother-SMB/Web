import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import {getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithRedirect, signInWithPopup, signInWithCredential, getRedirectResult} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js";


document.getElementById("body").style = "display:none"
document.getElementById("chargement").style = "display:block"

if(sessionStorage.getItem("logged") == 1){
  window.location.href ="menu/menu.html";
}

console.log("start")
console.log(document.cookie)



let tablecookie = document.cookie.split(';');
console.log(tablecookie)

if (existCookie("user")){
  sessionStorage.setItem("logged", 1);
  sessionStorage.setItem("user", readCookie("user"));
  window.location.href ="menu/menu.html";
}
        
//window.location.href = "connexion/connexion.html";

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

for(i in listClasse){
  let opt = document.createElement("option")
  opt.innerHTML = listClasse[i]
  document.getElementById("classe").appendChild(opt);
}



document.getElementById("popup").onclick = () => {
    if(document.getElementById("checkbox").checked){
      if(document.getElementById("checkbox2").checked){
        if(document.getElementById("classe").selectedIndex != 0){
          let classe = listClasse[document.getElementById("classe").selectedIndex - 1]
          console.log(classe)
          sessionStorage.setItem("classe", classe);
          signInWithRedirect(auth, provider)
        }else{
          document.getElementById("infos").innerHTML = "Vous devez selectionner votre classe"
        }
      }else{
        document.getElementById("infos").innerHTML = "Vous devez accepter les cookies"
      }
      
    }else{
      document.getElementById("infos").innerHTML = "Vous devez accepter la politique de confidentialité des données"
    }
    

  //window.location.href = "connexion/connexion.html";
  
}

getRedirectResult(auth)
  .then(result => {

    const credential = GoogleAuthProvider.credentialFromResult(result)
    console.log("ok1")
    
    const token = credential.accessToken

    const user = result.user

    if(user.email.split("@")[1] == "stemariebeaucamps.fr"){
      console.log("ok")
       
      signInWithCredential(auth, credential).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });
    
      sessionStorage.setItem("logged", 1);
      sessionStorage.setItem("week", actualWeek);
      sessionStorage.setItem("user", user.displayName);
      let classe = sessionStorage.getItem("classe");
      document.cookie = "user=" + user.displayName + "; expires=Mon, 06 Oct 2100 00:00:00 GMT; path=/";  
      writeCookie("classe",classe)
      writeCookie("week",actualWeek)
      window.location.href = "fin.html";
    }else{
      document.getElementById("body").style = "display:block"
    document.getElementById("chargement").style = "display:none"
      document.getElementById("infos").innerHTML = "Veuillez utiliser une adresse mail Beaucamps."
      
      console.log("Merci de prendre une adresse mail beaucamps")
      
    }
  })
  .catch(error => {
    console.log(error)
    document.getElementById("body").style = "display:block"
    document.getElementById("chargement").style = "display:none"
    const err = error
  })
