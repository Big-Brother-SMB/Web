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



/*database.ref("users/" + user + "/classe").once("value", function(snapshot) {
    let val = snapshot.val()
    if(classe != val){
        writeCookie("classe",val)
        classe = val
        //reload()
    }
    
});*/
// semaine

const actualWeek = 9;
const day = ["Lundi", "Mardi","Jeudi","Vendredi"];
const dayWithMer = ["1lundi", "2mardi","err","3jeudi","4vendredi"]
const dayNum = ["1lundi", "2mardi","3jeudi","4vendredi"];

//--------------------classe--------------------
const listClasse = ["SA","SB","SC","SD","SE","SF","SG","SH","SI","SJ","SK","SL","1A","1B","1C","1D","1E","1F","1G","1H","1I","1J","1K","TA","TB","TC","TD","TE","TF","TG","TH","TI","TJ","TK","PCSI","PC","professeur/personnel"]

//--------------------path--------------------
function path(j,h){
    return "foyer_midi/semaine"+ week + "/" + dayNum[j] + "/" + (11 + h) + "h"
}

let slotPath = path(jour,heure)

//--------------------hour--------------------
function getHour(){
    let d = new Date()
    return d.getHours() + ":" + (String(d.getMinutes()).length == 1?"0":"") + d.getMinutes() + ":" + (String(d.getSeconds()).length == 1?"0":"") + d.getSeconds()
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


//Stats

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



/*function getStat(j,h,type,onEnd){
    let users = []
    let amis = []
    let amisTag = []

    let nbScores = []
    let usersScore = []

    let classes = []
    let usersClasse = []

    let addLinkTag = []
    let linkedTag = []
    let delLinkTag = []
    
    
    database.ref(path(j,h)+"/" + type).once("value", function(snapshot) {
        let i = 0
        snapshot.forEach(function(child) {
            let user = child.key
            
            users.push(user)
            amis[i] = []
            amisTag[i] = []
            addLinkTag[i] = []
            linkedTag[i] = []
            delLinkTag[i] = []
            
            let num = i
            database.ref(path(j,h)+"/users/" + user +"/amis").once("value", function(snapshot) {
                snapshot.forEach(function(child) {
                    let ami = child.key
                    amis[num].push(ami)
                })
            })
            i++
            
            
        });
        
        
        for(let u in users){
            let user = users[u] 
            database.ref(path(j,h)+"/users/" + user + "/score").once("value", function(snapshot) {
                let sc = snapshot.val()
                if(nbScores[sc] == null){
                    nbScores[sc] = []
                }
                nbScores[sc].push(u)
                usersScore.push(sc)
            })
            
        }

        for(let u in users){
            let user = users[u] 
            database.ref(path(j,h)+"/users/" + user + "/classe").once("value", function(snapshot) {
                let c = snapshot.val()
                if(c == null){
                    usersClasse.push("none")
                }else{
                    if(classes[c] == null){
                        classes[c] = []
                    }
                    classes[c].push(u)
                    usersClasse.push(c)
                }
            })
            
        }

 
    })


    setTimeout(function() {
        console.log("start")
        console.log(amis)
        for(let u in users){
            amisTag[u] = []
            for(let a in amis[u]){
                let index = users.indexOf(amis[u][a])
                if(index != -1){
                    amisTag[u].push(index)
                }
                
            }
        }

        
        for(let u in users){
            linkedTag[u] = []
        }
        for(let u in users){
            for(let a in amisTag[u]){
                linkedTag[amisTag[u][a]].push(parseInt(u))
                
            }
            
        }
        
        //adding link -> users needed to add if you add this user

        
        let actUser
        function searchAmis(u){
            if(addLinkTag[actUser].indexOf(u) == -1){
                addLinkTag[actUser].push(u)
                for(a in amisTag[u]){
                    searchAmis(amisTag[u][a])
                }
            }
            
        }

        for(let u in users){
            actUser = parseInt(u)
            addLinkTag[actUser] = []
            searchAmis(actUser)
        }

        //del link -> users needed to delete if you delete this user

        
        function searchLink(u){
            if(delLinkTag[actUser].indexOf(u) == -1){
                delLinkTag[actUser].push(u)
                for(l in linkedTag[u]){
                    searchLink(linkedTag[u][l])
                }
            }
            
        }

        for(let u in users){
            actUser = parseInt(u)
            delLinkTag[actUser] = []
            searchLink(actUser)
        }



        console.log("users",users)
        console.log("amis",amis)
        console.log(amisTag)
        console.log("addLinkTag",addLinkTag)
        console.log(linkedTag)
        console.log("delLinkTag",delLinkTag)
        console.log("classes",classes)
        console.log(usersClasse)
        console.log(nbScores)
        console.log("users score",usersScore)
        onEnd()

    },1000);


}*/