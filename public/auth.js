import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import {getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithRedirect, signInWithPopup, signInWithCredential, getRedirectResult} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js";

if(sessionStorage.getItem("logged") == 1){
  window.location.href ="menu/menu.html";
}

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


document.getElementById("popup").onclick = () => {
  signInWithRedirect(auth, provider)
}

getRedirectResult(auth)
  .then(result => {
    const credential = GoogleAuthProvider.credentialFromResult(result)
    const token = credential.accessToken

    const user = result.user

    if(user.email.split("@")[1] == "stemariebeaucamps.fr"){
       
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
      sessionStorage.setItem("user", user.displayName);

      window.location.href = "menu/menu.html";
    }else{
      document.getElementById("infos").innerHTML = "veuillez prendre une adresse mail beaucamps"
      console.log("Merci de prendre une adresse mail beaucamps")
    }
  })
  .catch(error => {
    const err = error
  })
