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

//import * as cookie from "util/cookie.js";

//cookies

let tablecookie = document.cookie.split('; ');
let cookie = {};
for(let i in tablecookie){
    let row = tablecookie[i].split('=')
    if(row.length >1){
        cookie[row[0]] = row[1];
    }
}

function writeCookie(key, value){
    document.cookie = key + "=" + value + "; expires=Mon, 06 Oct 2100 00:00:00 GMT; path=/";  
}

function readCookie(key){
    return cookie[key];
}

function readIntCookie(key){
    return parseInt(cookie[key]);
}

function delCookie(key){
    document.cookie = key + "=; expires=Mon, 02 Oct 2000 01:00:00 GMT; path=/";
}

function existCookie(key){
    if(cookie[key] != null){
        return true
    }else{
        return false
    }
    
}

//reload
function reload(){
    window.location.reload(true)
}

//var

let user = readCookie("user")
let classe = readCookie("classe")
let week = readIntCookie("week")


/*database.ref("users/" + user + "/classe").once("value", function(snapshot) {
    let val = snapshot.val()
    if(classe != val){
        writeCookie("classe",val)
        classe = val
        //reload()
    }
    
});*/
// semaine

let actualWeek = 4;
const day = ["Lundi", "Mardi","Jeudi","Vendredi"];
const dayWithMer = ["1lundi", "2mardi","err","3jeudi","4vendredi"]
const dayNum = ["1lundi", "2mardi","3jeudi","4vendredi"];

//classe
let listClasse = ["S1","S2","S3","S4","S5","S6","S7","S8","S9","S10","S11","1A","1B","1C","1D","1E","1F","1G","1H","1I","1J","1K","TA","TB","TC","TD","TE","TF","TG","TH","TI","TJ","TK"]

//path
function path(j,h){
    return "foyer_midi/semaine"+ week + "/" + dayNum[j] + "/" + (11 + h) + "h"
}
