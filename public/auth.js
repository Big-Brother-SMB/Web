import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithRedirect, signInWithPopup, signInWithCredential, getRedirectResult } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-auth.js";


document.getElementById("body").style = "display:none"
document.getElementById("chargement").style = "display:block"


console.log("start")
console.log(document.cookie)


let listClasse = ["SA", "SB", "SC", "SD", "SE", "SF", "SG", "SH", "SI", "SJ", "SK", "SL", "1A", "1B", "1C", "1D", "1E", "1F", "1G", "1H", "1I", "1J", "1K", "TA", "TB", "TC", "TD", "TE", "TF", "TG", "TH", "TI", "TJ", "TK", "PCSI", "PC", "professeur-personnel"]

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

if (cookie["user"] != null && cookie["classe"] != null && cookie["email"] != null) {
  sessionStorage.setItem("user", cookie["user"]);
  window.location.href = "menu/menu.html";
}

if (cookie["RGPD"]) {
  document.getElementById("checkbox").checked = true
}

for (let i in listClasse) {
  let opt = document.createElement("option")
  opt.innerHTML = listClasse[i]
  document.getElementById("classe").appendChild(opt);
}

console.log(cookie["classe"])
if (cookie["classe"] != null) {
  console.log("classe remember : " + (listClasse.indexOf(cookie["classe"]) + 1))
  document.getElementById("classe").selectedIndex = listClasse.indexOf(cookie["classe"]) + 1
}

console.log(cookie["code bar"])
if (cookie["code bar"] != null) {
  document.getElementById("code bar").value = cookie["code bar"]
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


let err = sessionStorage.getItem("auth err");
console.log(err)
switch (err) {
  case 1:
    console.log("err code bar")
    document.getElementById("infos").innerHTML = "Ce code barre est déjà attribué (code 1)"
    break;
  case 2:
    console.log("err code bar")
    document.getElementById("infos").innerHTML = "err user null or < 5 (code 2)"
    break;
  case 3:
    console.log("err code bar")
    document.getElementById("infos").innerHTML = "err class null (code 3)"
    break;
  case 4:
    console.log("err code bar")
    document.getElementById("infos").innerHTML = "err no barcode (code 4)"
    break;
  case 5:
    console.log("err code bar")
    document.getElementById("infos").innerHTML = "class -1 (code 5)"
    break;
  default:
    console.log("autre")
    document.getElementById("infos").innerHTML = "err code 0XF"
    break;
}




document.getElementById("popup").onclick = () => {
  if (document.getElementById("checkbox").checked) {

    if (document.getElementById("classe").selectedIndex != 0) {


      let codeBar = document.getElementById("code bar").value
      if (String(codeBar).length == 5) {
        sessionStorage.setItem("auth err", 0);
        let classe = listClasse[document.getElementById("classe").selectedIndex - 1]
        sessionStorage.setItem("classe", classe);
        sessionStorage.setItem("code bar", codeBar);
        signInWithRedirect(auth, provider)
      } else {
        document.getElementById("infos").innerHTML = "Vous devez indiquer votre code barre (5 chiffres)"
      }

    } else {
      document.getElementById("infos").innerHTML = "Vous devez selectionner votre classe"
    }

  } else {
    document.getElementById("infos").innerHTML = "Vous devez accepter la politique de confidentialité des données et les Cookies"
  }


  //window.location.href = "connexion/connexion.html";

}

getRedirectResult(auth)
  .then(result => {

    const credential = GoogleAuthProvider.credentialFromResult(result)
    console.log("ok1")

    const token = credential.accessToken

    const user = result.user

    if (user.email.split("@")[1] == "stemariebeaucamps.fr") {
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


      sessionStorage.setItem("user", user.displayName);
      sessionStorage.setItem("email", user.email)
      window.location.href = "fin.html";
    } else {
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
