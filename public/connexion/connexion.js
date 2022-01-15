import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import {getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithRedirect, signInWithPopup, signInWithCredential, getRedirectResult} from "https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js";


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

const auth = getAuth()


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
      sessionStorage.setItem("week", 2);
      sessionStorage.setItem("user", user.displayName);

      var database = firebase.database()

        let user = sessionStorage.getItem("user");

        database.ref("users/" + user + "/score").once("value", function(snapshot) {
            if(snapshot.val() == null){
                database.ref("users/" + user + "/score").set(0);
                database.ref("users/" + user + "/score").once("value", function(snapshot) {
                console.log(snapshot.val())
                if(snapshot.val() == 0){
                    setTimeout(function() {
                        window.location.href = "menu/menu.html";
                    },1000);
               
                }
        })
    }else{
        window.location.href = "menu/menu.html";
    }
})
    }else{
      console.log("Merci de prendre une adresse mail beaucamps")
      window.location.href = "../index.html";
    }
  })
  .catch(error => {
    const err = error
  })
