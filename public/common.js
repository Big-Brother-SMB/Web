//---------------------------cookie---------------------------
let tablecookie = document.cookie.split('; ');
let cookie = {};
for (let i in tablecookie) {
    let row = tablecookie[i].split('=')
    if (row.length == 2) {
        cookie[row[0]] = row[1];
    }
}
console.log("cookie", cookie)

export function writeCookie(key, value){
    document.cookie = key + "=" + value + "; expires=Mon, 06 Oct 2100 00:00:00 GMT; path=/";
    cookie[key]=value
}

export function readCookie(key){
    return cookie[key];
}

export function delCookie(key){
    document.cookie = key + "=; expires=Mon, 02 Oct 2000 01:00:00 GMT; path=/";
    cookie[key]=null
}

export function readIntCookie(key){
    let read = parseInt(cookie[key]);
    if(isNaN(read)){
        read = null
    }
    return read
}

export function readBoolCookie(key){
    return cookie[key] == 'true';
}

export function existCookie(key){
    if(cookie[key] != null){
        return true
    }else{
        return false
    }
}


//---------------------------socket---------------------------
import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";

const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});
if(params.token!=null){
  writeCookie("key",params.token)
}

export let key=readCookie("key")

let socket = io({
    auth: {
        token: key
    }
});

export async function socketAsync(channel,msg){
    return new Promise(function(resolve, reject) {
        socket.emit(channel,msg);
        socket.once(channel,result => {
            resolve(result)
        });
        setTimeout(reject,5000)
    })
}

//---------------------------récupération de l'identité et des cookie/variable---------------------------

export let id_data = await socketAsync("id_data","")
console.log(id_data)

export let admin
export let classe
export let codeBar
export let email
export let first_name
export let groups
export let last_name
export let tuto
export let uuid
if(id_data!='err'){
    admin = id_data.admin
    classe = id_data.classe
    codeBar = id_data.code_barre
    email = id_data.email
    first_name = id_data.first_name
    groups = id_data.groups
    last_name = id_data.last_name
    tuto = id_data.tuto
    uuid = id_data.uuid
} else {
    deco()
}

export let colorMode = readIntCookie("color mode")
export let backgroundColor = readCookie("color background")
export let textColor = readCookie("color text")
export let week = readIntCookie("week")

//---------------------------securité page admin + deco---------------------------


let socketAdmin
if(admin>0){
  socketAdmin = io("/admin",{
    auth: {
      token: key
    }
  });
}

export async function socketAdminAsync(channel,msg){
  if(admin>0){
    return new Promise(function(resolve, reject) {
      socketAdmin.emit(channel,msg);
      socketAdmin.once(channel,result => {
          resolve(result)
      });
      setTimeout(reject,5000)
    })
  } else {
    return null
  }
}

if (readBoolCookie("connect")) {
    if(admin==2){
        if(!window.location.pathname.includes("admin") && !window.location.pathname.includes("option")){
            window.location.href = window.location.origin + "/admin/menu/menu.html"
        }
    } else if(admin==0){
        if(window.location.pathname.includes("admin")){
            window.location.href = window.location.origin + "/menu/menu.html"
        }
    }
} else {
    if(!window.location.pathname.includes("index.html"))
      deco()
}

export function deco(){
  let path = window.location.pathname
  if(path!="/index.html"){
    delCookie("connect");
    window.location.href = window.location.origin + "/index.html";
  }
}

//---------------------------fonctions diver---------------------------

export function round(nb){
  return Math.round(nb*100)/100
}

export function reload(){
  window.location.reload(true)
}

//---------------------------les fonctions dates---------------------------

export function getDayText(j,week){
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

export function getDayHash(j,week,h){
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
  text = dateBeg[6]+dateBeg[7]+dateBeg[8]+dateBeg[9] + "-" + mBeg + "-" + dateBeg[0]+dateBeg[1] + " " + h+":00:00"
  return text
}

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
export const actualWeek = date.getWeek();

export function semaine(semaine){ //nombreSemaineSup = nombre de semaine ce trouve l'intervalle à creer
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

//---------------------------les fonctions de hash---------------------------

export function getHour(){
    let d = new Date()
    return d.getHours() + ":" + (String(d.getMinutes()).length == 1?"0":"") + d.getMinutes() + ":" + (String(d.getSeconds()).length == 1?"0":"") + d.getSeconds()
}
  
export function hashControl(){
    let d = new Date()
    return (d.getHours() + d.getMinutes() +Math.floor(d.getSeconds()/10))**3 %1000
}
  
export function hashDay(){
    let d =  new Date()
    return d.getFullYear()
    + "-" + (String((d.getMonth() + 1)).length == 1?"0":"") + (d.getMonth() + 1)
    + "-" + (String(d.getDate()).length == 1?"0":"") + d.getDate()
}
  
export function hashHour(){
    let d =  new Date()
    return d.getFullYear()
    + "-" + (String((d.getMonth() + 1)).length == 1?"0":"") + (d.getMonth() + 1)
    + "-" + (String(d.getDate()).length == 1?"0":"") + d.getDate()
    + " " + (String(d.getHours()).length == 1?"0":"") + d.getHours()
    + ":" + (String(d.getMinutes()).length == 1?"0":"") + d.getMinutes()
    + ":" + (String(d.getSeconds()).length == 1?"0":"") + d.getSeconds()
}

//---------------------------listes---------------------------

export const day = ["Lundi", "Mardi","Jeudi","Vendredi"];
export const dayMer = ["Lundi", "Mardi","Mercredi","Jeudi","Vendredi"];
export const allDay = ["Dimanche","Lundi", "Mardi","Mercredi","Jeudi","Vendredi","Samedi"];

export const dayWithMer = [0,1,"err",2,3]
export const dayNum = [0,1,2,3];
export const dayNumMer = [0,1,2,3,5];

export const dayLowerCase = ["lundi", "mardi","jeudi","vendredi"];
export let month=["janvier","fevrier","mars","avril","mai","juin","juillet","aout","septembre","octobre","novembre","decembre"];

export const listMode = ["horaire non planifié","ouvert à tous","ouvert aux inscrits","ouvert aux inscrits (demandes fermé)","fermé","fini","vacances"]
export const listModePerm = ["Selection","Fermé","Ouvert à tous","Reservation","Vacances"]

export const listClasse = ["2A","2B","2C","2D","2E","2F","2G","2H","2I","2J","2K","2L"
,"1A","1B","1C","1D","1E","1F","1G","1H","1I","1J","1K"
,"TA","TB","TC","TD","TE","TF","TG","TH","TI","TJ","TK"
,"PCSI","PC","professeur-personnel"]

//---------------------------color function---------------------------

if(window.location.pathname.split("/").pop()!= "pass.html"){
  setColorMode(colorMode,backgroundColor,textColor)
}
export function setColorMode(colorMode,backgroundColor,textColor){
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
      if(name!="") document.getElementById("css").href = window.location.origin + "/css/" + name + ".css";
    }
  }catch(Exception){
    console.log("error with color mode")
  }
}


//---------------------------autocomplete---------------------------

export function autocomplete(inp, arr, func) {
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
      if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {        // arr[i].toLowerCase().includes(val.toLowerCase())
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
        func(inp.value);
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

try{
  document.getElementById("version").innerHTML = "Crédit"
}catch(e){}


/*
//--------------------database functions--------------------



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








let users = []*/
