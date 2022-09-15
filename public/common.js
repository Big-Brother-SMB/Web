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

//----------analytics

const analytics = firebase.analytics();

//--------------auth--------------

firebase.auth().onAuthStateChanged(function(userX) {
    if (userX) {
        userT = userX.email.split("@")[0].split(".");
        userT[0]=userT[0][0].toUpperCase()+userT[0].slice(1)
        userT[1]=userT[1].toUpperCase();
        userName = userT[0]+" "+userT[1]
        user = userX.email.replaceAll('.','µ')
        email = userX.email;
        writeCookie("user",user)
        writeCookie("name",userName)
        writeCookie("email",email)
    } else {
        deco()
    }
    console.log(user)
    database.ref("modo/users/"+ user).once('value',function(snapshot){
        if(window.location.pathname.includes("admin")){
            if(snapshot.val()!=0 && snapshot.val()!=1){
                deco()
            }
        }
        if(!window.location.pathname.includes("admin") && !window.location.pathname.includes("option") && snapshot.val()===1){
            window.location.href = window.location.origin + "/admin/menu/menu.html"
        }
    })
});

//--------------------

function round(nb){
    return Math.round(nb*100)/100
}

//--------------------cookies functions--------------------

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

function readIntCookieDefault(key){
    let read = readIntCookie(key)
    if(isNaN(read)){
        read = 0
    }
    return read
}

function readBoolCookie(key){
    return cookie[key] == 'true';
}

function readBoolCookie(key,ifNone){
    if(cookie[key] == 'true'){
        return true
    }else if(cookie[key] == 'false'){
        return false
    }else{
        return ifNone;
    }

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

//--------------------reload--------------------
function reload(){
    window.location.reload(true)
}

function deco(){
    delCookie("user");
    window.location.href = window.location.origin + "/index.html";
}

//--------------------var--------------------
let user = readCookie("user")
let userName = readCookie("name")
let email = readCookie("email")
let classe = readCookie("classe")
let week = readIntCookie("week")
let bollAllAmis = readBoolCookie("allAmis",true)
let bollEmail = readBoolCookie("bEmail",true)
let codeBar = readIntCookie("code bar")


let jour = readIntCookie("jour")
let heure = readIntCookie("heure")

let colorMode = readIntCookie("color mode")
let backgroundColor = readCookie("color background")
let textColor = readCookie("color text")


database.ref("users/" + user + "/classe").once("value", function(snapshot) {
    classe = snapshot.val()
    if(classe != null){
        writeCookie("classe",classe)
    }
})

database.ref("users/" + user + "/code barre").once("value", function(snapshot) {
    codeBar = snapshot.val()
    if(codeBar != null){
        console.log(codeBar)
        writeCookie("code bar",codeBar)
    }else{
        console.log("err code bar")
    }
})





// Returns the ISO week of the date.




//-----------------------dates--------------------------

Date.prototype.getWeek = function() {
    var date = new Date(this.getTime());
    date.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    // January 4 is always in week 1.
    var week1 = new Date(date.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
                          - 3 + (week1.getDay() + 6) % 7) / 7);
  }

  // Returns the four-digit year corresponding to the ISO week of the date.
  Date.prototype.getWeekYear = function() {
    var date = new Date(this.getTime());
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    return date.getFullYear();
  }
let date = new Date();
const actualWeek = date.getWeek();

function semaine(semaine){ //nombreSemaineSup = nombre de semaine ce trouve l'intervalle à creer
	let jour=date.getDay()-1;
	let dateBeg=(Date.now()+604800000*(semaine - actualWeek))-jour*86400000; //86400000ms=1 jour et 604800000ms= 1semaine
	let dateEnd=dateBeg+4*86400000;
	dateBeg=new Date(dateBeg);
	dateEnd=new Date(dateEnd);
	dateBeg = dateBeg.toLocaleString();
	dateEnd = dateEnd.toLocaleString();
	let mois=["janvier","fevrier","mars","avril","mai","juin","juillet","aout","septembre","octobre","novembre","decembre"];
    let mBeg = parseInt(dateBeg[3]+dateBeg[4] - 1)
    let mEnd = parseInt(dateEnd[3]+dateEnd[4] - 1)
    let text = ""
    if(dateBeg[0] != "0"){
        text += dateBeg[0]
    }
    text += dateBeg[1] + " "
    if(mBeg != mEnd){
        text += mois[mBeg] + " "
    }
    text += "au "
    if(dateEnd[0] != "0"){
        text += dateEnd[0]
    }
    text += dateEnd[1]+" " + mois[mEnd]
    return text
}

const day = ["Lundi", "Mardi","Jeudi","Vendredi"];

const dayWithMer = ["1lundi", "2mardi","err","3jeudi","4vendredi"]
const dayNum = ["1lundi", "2mardi","3jeudi","4vendredi"];

const dayMer = ["Lundi", "Mardi","Mercredi","Jeudi","Vendredi"];
const dayNumMer = ["1lundi", "2mardi","3mercredi","4jeudi","5vendredi"];

const allDay = ["Dimanche","Lundi", "Mardi","Mercredi","Jeudi","Vendredi","Samedi"];

//modes
let listMode = ["horaire non planifié","ouvert à tous","ouvert aux inscrits","ouvert aux inscrits (demandes fermé)","fermé","fini","vacances"]
let listModePerm = ["Selection","Fermé","Ouvert à tous","Reservation","Vacances"]

//--------------------classe--------------------
const listClasse = ["2A","2B","2C","2D","2E","2F","2G","2H","2I","2J","2K","2L","1A","1B","1C","1D","1E","1F","1G","1H","1I","1J","1K","TA","TB","TC","TD","TE","TF","TG","TH","TI","TJ","TK","PCSI","PC","professeur-personnel"]

//--------------------path--------------------

const menu = window.location.origin + "/menu/menu.html"

function path(j,h){
    return "foyer_midi/semaine"+ week + "/" + dayNum[j] + "/" + (11 + h) + "h"
}

function pathPerm(j,h){
    if(h >= 4){
        h++
    }
    return "perm/semaine"+week+"/" + dayNumMer[j] + "/" + (h+8) + "h"
}

let slotPath = path(jour,heure)

//--------------------hour--------------------
function getHour(){
    let d = new Date()
    return d.getHours() + ":" + (String(d.getMinutes()).length == 1?"0":"") + d.getMinutes() + ":" + (String(d.getSeconds()).length == 1?"0":"") + d.getSeconds()
}

function hashDate(){
    let d = new Date()
    return (d.getHours() + d.getMinutes() +Math.floor(d.getSeconds()/10))**3 %1000
}

function hashDay(){
    let d =  new Date()
    return d.getFullYear()
    + "-" + (String((d.getMonth() + 1)).length == 1?"0":"") + (d.getMonth() + 1)
    + "-" + (String(d.getDate()).length == 1?"0":"") + d.getDate()
}

function hash(){
    let d =  new Date()
    return d.getFullYear()
    + "-" + (String((d.getMonth() + 1)).length == 1?"0":"") + (d.getMonth() + 1)
    + "-" + (String(d.getDate()).length == 1?"0":"") + d.getDate()
    + " " + (String(d.getHours()).length == 1?"0":"") + d.getHours()
    + ":" + (String(d.getMinutes()).length == 1?"0":"") + d.getMinutes()
    + ":" + (String(d.getSeconds()).length == 1?"0":"") + d.getSeconds()
}


//--------------------color functions-----------------------
if(window.location.pathname.split("/").pop()!= "pass.html"){
    setColorMode(window.location.origin)
}
function setColorMode(rootPath){
    try{
        document.getElementById("css").href = ""
        let name = ""
        switch(colorMode){
            case 1:
                name = "light"
                break;
            case 2:
                name = "dark"
                break;
        }
        if(colorMode == 0){
            document.body.style.backgroundColor = backgroundColor
            document.body.style.color = textColor
        }else{
            document.body.style.backgroundColor = "";
            document.body.style.color = "";
            if(name!="") document.getElementById("css").href = rootPath + "/css/" + name + ".css";
        }


    }catch(Exception){
        console.log("error with color mode")
    }

}
//    mix-blend-mode: difference;


//--------------------Big Data functions--------------------
/*try{
    let page = window.location.pathname.split("/").pop().split(".")[0];
    console.log("analytics : " + page)
    analytics.logEvent(page);
}catch(Exception){
    console.log(Exception)
}

const pages = ["menu","amis","score","perm","pass","option","fin","dev","demande","modifier"]
try{
    let lastDay = readIntCookieDefault("last day")
    let lastMonth = readIntCookieDefault("last month")
    let actualDay = date.getDate()
    let actualMonth = date.getMonth() + 1;

    console.log("date : " + actualDay + "/" + actualMonth)
    console.log("old date : " + lastDay + "/" + lastMonth)
    let time = readIntCookieDefault("time")

    console.log("time : "+ time);



    var page = window.location.pathname.split("/").pop().split(".");
    page.pop()
    let pageName = "page-" + page[0]
    let pageNameTime = "time-" + page[0]
    console.log("page : "+ pageName);
    let nbPageRead =  readIntCookieDefault(pageName) + 1
    console.log("page read : " + nbPageRead)
    let pageTime = readIntCookieDefault(pageNameTime)
    console.log("page time : " + pageTime)

    if(lastDay != actualDay){
        if(lastDay != 0){
            console.log("new day")
            let hashCode = hash() + " -> " + user
            let date = lastMonth + "-" + lastDay
            database.ref("data/" + date + "/" + hashCode +  "/time").set(time)
            for(let i in pages){
                let val = readIntCookieDefault("page-" + pages[i])
                writeCookie("page-" + pages[i],0)
                let t = readIntCookieDefault("time-" + pages[i])
                writeCookie("time-" + pages[i],0)
                if(val != 0){
                    database.ref("data/" + date + "/" + hashCode +  "/pages/" + pages[i] + "/vues").set(val)
                    database.ref("data/" + date + "/" + hashCode +  "/pages/" + pages[i] + "/time").set(t)
                }

            }
        }

        lastDay = actualDay
        lastMonth = actualMonth
        writeCookie("last day",lastDay)
        writeCookie("last month",lastMonth)
        time = 0
        pageTime = 0
        nbPageRead = 1
        console.log("finnish sendding")
    }

    writeCookie(pageName,nbPageRead)






    function loopTime() {
        time++
        writeCookie("time", time)
        pageTime++
        writeCookie(pageNameTime, pageTime)

        setTimeout(loopTime, 1000);
    }
    loopTime();



}catch(Exception){
    console.log("error data",Exception)
}*/


//--------------------database functions--------------------

function getUserData(path,onValue){
    readDatabase(path,onValue)
    database.ref("users/" + user + "/" + path).once("value", function(snapshot) {
        onValue(snapshot.val())

    });
}

function setUserData(path,value){
    writeDatabase("users/" + user + "/" + path,value)
}

/**
 * @param {String} path - The path to the value
 * @param {Object} value - The value to write
 */
function writeDatabase(path,value){
    database.ref(path).set(value);

}

/**
 * @param {String} path - The path to the value
 * @param {Object} value - The value to write
 * @param {function} onEnd - The function that start when the value is writed. No parameters
 */
function writeDatabase(path,value,onEnd){
    database.ref(path).set(value);
    function done(){
        readDatabase(path,function(val){
            if(val == value){
                onEnd()
            }else{
                console.log("error while getting the response to writeDatabase")
                done()
            }
        } )
    }
    done();

}



/**
 * @param {String} path - The path to the value
 * @param {function} onValue - The function that start when the value is returned. One parameter : the value read on the database
 */
function readDatabase(path,onValue){
    database.ref(path).once("value", function(snapshot) {
        onValue(snapshot.val())
    });
}


function readSlot(path,onValue){
    readDatabase(slotPath + "/demandes/" + path, onValue)
}

function readSlotUserData(u,path,onValue){
    readDatabase(slotPath + "/users/" + u + "/" + path, onValue)
}

function getChilds(path,forEach){
    database.ref(path).once("value", function(snapshot) {
        snapshot.forEach(function(child) {
            forEach(child.key)
        })
    });
}

function getChildsList(path,onEnd){
    database.ref(path).once("value", function(snapshot) {
        let list = []
        snapshot.forEach(function(child) {
            list.push(child.key)
        })
        onEnd(list)
    });
}

function getDemandesUsers(forEach){
    getChilds(slotPath + "/demandes",forEach)
}

function getDemandesUsersList(onEnd){
    getChildsList(slotPath + "/demandes",onEnd)
}

function getInscritsUsers(forEach){
    getChilds(slotPath + "/inscrits",forEach)
}

function getSlotFriendsList(user,onEnd){
    getChildsList(slotPath + "/users/" + user + "/amis",onEnd)
}

database.ref("banderole").once("value", function (snapshot) {
    let msg = snapshot.val()
    if (msg != null && document.getElementById("banderole")!=null) {
        document.getElementById("banderole").innerHTML = msg
        if (msg.length > 0) {
            document.getElementById("banderole").style.animation = "defilement-rtl 10s infinite linear"

        }
    }
})

//-----------------------------------Stats--------------------------

function getDemandesStat(onEnd){

    getDemandesUsersList(function(users){
        let usersFriends = []
        let usersScore = []
        let from = []
        for(let u in users){
            usersFriends.push("err")
            usersScore.push(0)
            from.push("err")
            readSlotUserData(users[u],"score",function(score){
                usersScore[u] = score
                getSlotFriendsList(users[u],function(friends){
                    usersFriends[u] = friends
                    suite()
                })
            })

        }
        let progress = 0
        function suite(){
            console.log("suite" + progress)

            progress++
            if(progress < users.length){
                return
            }
            console.log("users",users)
            console.log("users score",usersScore)
            console.log("users friends",usersFriends)

            let usersFriendsTag = []
            for(let u in users){
                usersFriendsTag[u] = []
                for(let a in usersFriends[u]){
                    let index = users.indexOf(usersFriends[u][a])
                    if(index != -1){
                        usersFriendsTag[u].push(index)
                    }

                }
            }

            let to = []

            let actUser
            function searchFriends(u){
                if(from[actUser].indexOf(u) == -1){
                    from[actUser].push(u)
                    for(a in usersFriendsTag[u]){
                        searchFriends(usersFriendsTag[u][a])
                    }
                }

            }

            for(let u in users){
                actUser = parseInt(u)
                from[actUser] = []
                searchFriends(actUser)
            }

            let userGroupScore = []
            for(let u in users){
                let somme = 0
                for(let a in from[u]){
                    somme += usersScore[from[u][a]]
                }
                userGroupScore.push(somme / from[u].length)
            }

            console.log("from",from)
            console.log("group score",userGroupScore)


            //onEnd(users,from)

        }
    })

}


//---------------------------------other functions-----------------------

function charged(bool){
    if(bool){
        document.getElementById("article").style.display = "inline"
        document.getElementById("chargement").style.display = "none"
    }else{
        document.getElementById("article").style.display = "none"
        document.getElementById("chargement").style.display = "inline"
    }
}

try{
    database.ref("version").once("value", function (snapshot) {
        let msg = snapshot.val()
        if (msg != null) {
            document.getElementById("version").innerHTML = "Version " + msg
        } else {
            document.getElementById("version").innerHTML = "Crédit"
        }
    })
}catch{}


//nb pers
function nbPers(j,h,type,func){
    console.log(path(j,h)+"/" + type)
    database.ref(path(j,h)+"/" + type).once("value", function(snapshot) {
        let total = 0
        snapshot.forEach(function(child) {
            total++;
        });
        func(total)
    })
}


let listNiveau = [listClasse.slice(0, 12),listClasse.slice(12,23),listClasse.slice(23,34),listClasse.slice(34,37)]
nomNiveau = ["secondes","premières","terminales","adultes"]


//randint
function randint(min, max) { // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min)
}



function indexOf2dArray(array2d, itemtofind) {
    let found = false
    let col
    let row
    for(row in array2d){
        col = array2d[row].indexOf(itemtofind)
        if(col != -1){
            found = true
            break;
        }
    }
    if(!found){
        return -1
    }else{
        return [row, col];
    }

}

function commonElement(l1,l2){
    let nb = 0
    for(let e in l1){
        if(l2.indexOf(l1[e]) != -1){
            nb++
        }
    }
    return nb;
}
const dayLowerCase = ["lundi", "mardi","jeudi","vendredi"];
let month=["janvier","fevrier","mars","avril","mai","juin","juillet","aout","septembre","octobre","novembre","decembre"];


function getDayText(j){
    let date = new Date();
    let ajd=date.getDay()-1;
    let jour = j
    if(j > 1){
        jour++
    }
    let dateBeg=(Date.now()+604800000*(week - actualWeek))-(ajd-jour)*86400000;
    dateBeg=new Date(dateBeg);
    dateBeg = dateBeg.toLocaleString();
    let mBeg = parseInt(dateBeg[3]+dateBeg[4] - 1)
    let text = ""
    if(dateBeg[0] != "0"){
        text += dateBeg[0]
    }
    text += dateBeg[1] + " " + month[mBeg]
    return text
}

function autocomplete(inp, arr, func) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false;}
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
          /*check if the item starts with the same letters as the text field value:*/
          if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {                // arr[i].toLowerCase().includes(val.toLowerCase())
            /*create a DIV element for each matching element:*/
            b = document.createElement("DIV");
            /*make the matching letters bold:*/
            b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
            b.innerHTML += arr[i].substr(val.length);
            /*insert a input field that will hold the current array item's value:*/
            b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
            /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function(e) {
                /*insert the value for the autocomplete text field:*/
                inp.value = this.getElementsByTagName("input")[0].value;
                func(this.getElementsByTagName("input")[0].value);
                /*close the list of autocompleted values,
                (or any other open lists of autocompleted values:*/
                closeAllLists();
            });
            a.appendChild(b);
          }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          /*If the arrow DOWN key is pressed,
          increase the currentFocus variable:*/
          currentFocus++;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 38) { //up
          /*If the arrow UP key is pressed,
          decrease the currentFocus variable:*/
          currentFocus--;
          /*and and make the current item more visible:*/
          addActive(x);
        } else if (e.keyCode == 13) {
          /*If the ENTER key is pressed, prevent the form from being submitted,*/
          e.preventDefault();
          if (currentFocus > -1) {
            /*and simulate a click on the "active" item:*/
            if (x) x[currentFocus].click();
          }
        }
    });
    function addActive(x) {
      /*a function to classify an item as "active":*/
      if (!x) return false;
      /*start by removing the "active" class on all items:*/
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      /*add class "autocomplete-active":*/
      x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
      /*a function to remove the "active" class from all autocomplete items:*/
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }
    function closeAllLists(elmnt) {
      /*close all autocomplete lists in the document,
      except the one passed as an argument:*/
      var x = document.getElementsByClassName("autocomplete-items");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inp) {
        x[i].parentNode.removeChild(x[i]);
      }
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
      closeAllLists(e.target);
  });
}


let users = []
let amis=[]
