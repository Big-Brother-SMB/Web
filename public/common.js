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
    window.location.href = "../index.html";
}

//--------------------var--------------------
let user = readCookie("user")
let email = readCookie("email")
let classe = readCookie("classe")
let week = readIntCookie("week")
let bollAllAmis = readBoolCookie("allAmis",true)
let bollEmail = readBoolCookie("bEmail",true)
let codeBar = readIntCookie("code bar")
let hasCodeBar = String(codeBar).length == 5
let jour = readIntCookie("jour")
let heure = readIntCookie("heure")

let colorMode = readIntCookie("color mode")
let backgroundColor = readCookie("color background")
let textColor = readCookie("color text")


/*database.ref("users/" + user + "/classe").once("value", function(snapshot) {
    let val = snapshot.val()
    if(classe != val){
        writeCookie("classe",val)
        classe = val
        //reload()
    }
    
});*/





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

//--------------------classe--------------------
const listClasse = ["SA","SB","SC","SD","SE","SF","SG","SH","SI","SJ","SK","SL","1A","1B","1C","1D","1E","1F","1G","1H","1I","1J","1K","TA","TB","TC","TD","TE","TF","TG","TH","TI","TJ","TK","PCSI","PC","professeur-personnel"]

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
            document.getElementById("css").href = rootPath + "/css/" + name + ".css"
        }
        
        
    }catch(Exception){
        console.log("error with color mode")
    }
    
}
//    mix-blend-mode: difference;


//--------------------Big Data functions--------------------
try{
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
}


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
        }
    
    
    })
}catch{}
