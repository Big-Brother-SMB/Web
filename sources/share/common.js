import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";



//-----------------------------date----------------------------------
let mois=["janvier","fevrier","mars","avril","mai","juin","juillet","aout","septembre","octobre","novembre","decembre"];

Date.prototype.getWeekYear = function() {
    var date = new Date(this.getTime());
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    return date.getFullYear();
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
const actualWeek = new Date().getWeek();
let date = new Date();

export class common{
  static get actualWeek(){
    return actualWeek
  }
  /*static get day(){
    return ["Lundi", "Mardi","Jeudi","Vendredi"];
  }
  static get dayMer(){
    return ["Lundi", "Mardi","Mercredi","Jeudi","Vendredi"];
  }
  static get allDay(){
    return ["Dimanche","Lundi", "Mardi","Mercredi","Jeudi","Vendredi","Samedi"];
  }
  
  static get dayWithMer(){
    return [0,1,"err",2,3]
  }
  static get dayNum(){
    return [0,1,2,3]
  }
  static get dayNumMer(){
    return [0,1,2,3,5];
  }

  static get dayLowerCase(){
    return ["lundi", "mardi","jeudi","vendredi"];
  }
  static get month(){
    return ["janvier","fevrier","mars","avril","mai","juin","juillet","aout","septembre","octobre","novembre","decembre"];
  }*/
  static get nomNiveau(){
    return ["secondes","premières","terminales","adultes"]
  }


  static async init(exportClass){
    //---------------------------cookie---------------------------
    let tablecookie = document.cookie.split('; ');
    this.cookie = {};
    for (let i in tablecookie) {
      let row = tablecookie[i].split('=')
      if (row.length == 2) {
        this.cookie[row[0]] = row[1];
      }
    }
    console.log("cookie", this.cookie)

    //---------------------------socket---------------------------

    const params = new Proxy(new URLSearchParams(window.location.search), {
      get: (searchParams, prop) => searchParams.get(prop),
    });
    if(params.token!=null){
      this.writeCookie("key",params.token)
    }

    this.key=this.readCookie("key")

    this.socket = io({
      auth: {
        token: this.key
      }
    });
    let socket = this.socket
    await new Promise(function(resolve, reject) {
      socket.once("connect", () => {
        resolve(null)
      });
    })

    //---------------------------récupération de l'identité et des cookie/variable---------------------------

    let id_data = await this.socketAsync("id_data","")
    this.id_data = id_data
    console.log(id_data)

    this.admin
    this.classe
    this.codeBar
    this.email
    this.first_name
    this.groups
    this.last_name
    this.tuto
    this.uuid
    if(id_data!='err'){
      this.admin = id_data.admin
      this.classe = id_data.classe
      this.codeBar = id_data.code_barre
      this.email = id_data.email
      this.first_name = id_data.first_name
      this.groups = id_data.groups
      this.last_name = id_data.last_name
      this.tuto = id_data.tuto
      this.uuid = id_data.uuid
    } else {
      this.deco()
    }

    this.colorMode = this.readIntCookie("color mode")
    this.backgroundColor = this.readCookie("color background")
    this.textColor = this.readCookie("color text")
    this.week = this.readIntCookie("week")

    //---------------------------securité page admin + deco---------------------------


    this.socketAdmin
    if(this.admin>0){
      this.socketAdmin = io("/admin",{
        auth: {
          token: this.key
        }
      });
      let socketAdmin = this.socketAdmin
      await new Promise(function(resolve, reject) {
        socketAdmin.once("connect", () => {
          resolve(null)
        });
      })
    }



    if (this.readBoolCookie("connect")) {
      if(this.admin==2){
        if(!window.location.pathname.includes("admin") && !window.location.pathname.includes("option")){
          window.location.href = window.location.origin + "/admin/menu/menu.html"
        }
      } else if(this.admin==0){
        if(window.location.pathname.includes("admin")){
          window.location.href = window.location.origin + "/menu/menu.html"
        }
      }
    } else {
      //if(!window.location.pathname.includes("index.html")) deco()
    }

    //---------------------------listes---------------------------

    /*const listClasse = ["2A","2B","2C","2D","2E","2F","2G","2H","2I","2J","2K","2L"
    ,"1A","1B","1C","1D","1E","1F","1G","1H","1I","1J","1K"
    ,"TA","TB","TC","TD","TE","TF","TG","TH","TI","TJ","TK"
    ,"PCSI","PC","professeur-personnel"]*/

    //--------------------------banderole--------------------------------

    let banderole = await common.socketAsync("banderole",null)
    banderole=''
    if (banderole != null && banderole != '') {
      document.getElementById("banderole").innerHTML = banderole
      document.getElementsByClassName("marquee-rtl")[0].style.display = "block"
      document.querySelector(':root').style.setProperty("--screenH","calc(100vh - 11.8em - 32px)")
    }

    //---------------------------color function---------------------------

    if(window.location.pathname.split("/").pop()!= "pass.html"){
      this.setColorMode(this.colorMode,this.backgroundColor,this.textColor)
    }
  }


  //cookie
  static writeCookie(key, value){
    document.cookie = key + "=" + value + "; expires=Mon, 06 Oct 2100 00:00:00 GMT; path=/";
    this.cookie[key]=value
  }

  static readCookie(key){
    return this.cookie[key];
  }

  static delCookie(key){
    document.cookie = key + "=; expires=Mon, 02 Oct 2000 01:00:00 GMT; path=/";
    this.cookie[key]=null
  }

  static readIntCookie(key){
    let read = parseInt(this.cookie[key]);
    if(isNaN(read)){
      read = null
    }
    return read
  }

  static readBoolCookie(key){
    return this.cookie[key] == 'true';
  }

  static existCookie(key){
    if(this.cookie[key] != null){
      return true
    }else{
      return false
    }
  }

//socket
  static async socketAsync(channel,msg,time){
    let socket = this.socket
    return new Promise(function(resolve, reject) {
      socket.emit(channel,msg);
      socket.once(channel,result => {
        resolve(result)
      });
      if(time==undefined){
        time=5000
      }
      setTimeout(reject,time)
    })
  }

  static async socketAdminAsync(channel,msg,time){
    let socketAdmin = this.socketAdmin
    if(this.admin>0){
      return new Promise(function(resolve, reject) {
        socketAdmin.emit(channel,msg);
        socketAdmin.once(channel,result => {
          resolve(result)
        });
        if(time==undefined){
          time=5000
        }
        setTimeout(reject,time)
      })
    } else {
      console.log('err')
      return null
    }
  }

//deco
  static deco(){
    return//%
    let path = window.location.pathname
    if(path!="/index.html"){
      this.delCookie("connect");
      window.location.href = window.location.origin + "/index.html";
    }
  }



  //---------------------------fonctions diver---------------------------

  static round(nb){
    return Math.round(nb*100)/100
  }

  static reload(){
    window.location.reload(true)
  }

  //---------------------------les fonctions dates---------------------------
  static getDayText(j,week){
    this.getDayText(j,week,false)
  }

  static getDayText(j,week,withMer){
    let date = new Date();
    let ajd=date.getDay()-1;
    let jour = j
    if(j > 1 && !withMer){
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
    text += dateBeg[1] + " " + mois[mBeg]
    return text
  }

  static getDayHash(j,week,h){
    let date = new Date();
    let ajd=date.getDay()-1;
    let jour = j
    if(j > 1){
      jour++
    }
    let dateBeg=(Date.now()+604800000*(week - actualWeek))-(ajd-jour)*86400000;
    dateBeg=new Date(dateBeg);
    dateBeg = dateBeg.toLocaleString();
    let mBeg = dateBeg[3]+dateBeg[4]
    let text = ""
    text = dateBeg[6]+dateBeg[7]+dateBeg[8]+dateBeg[9] + "-" + mBeg + "-" + dateBeg[0]+dateBeg[1] + " " + h+":00:00"
    return text
  }

  static semaine(semaine){ //nombreSemaineSup = nombre de semaine ce trouve l'intervalle à creer
    let jour = date.getDay()-1;
    let dateBeg=(Date.now()+604800000*(semaine - actualWeek))-jour*86400000; //86400000ms=1 jour et 604800000ms= 1semaine
    let dateEnd=dateBeg+4*86400000;
    dateBeg=new Date(dateBeg);
    dateEnd=new Date(dateEnd);
    dateBeg = dateBeg.toLocaleString();
    dateEnd = dateEnd.toLocaleString();
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

  static getHour(){
    let d = new Date()
    return d.getHours() + ":" + (String(d.getMinutes()).length == 1?"0":"") + d.getMinutes() + ":" + (String(d.getSeconds()).length == 1?"0":"") + d.getSeconds()
  }
  
  
  static hashControl(){
    let d = new Date()
    return (d.getHours() + d.getMinutes() +Math.floor(d.getSeconds()/10))**3 %1000
  }
  
  static hashDay(){
    let d =  new Date()
    return d.getFullYear()
    + "-" + (String((d.getMonth() + 1)).length == 1?"0":"") + (d.getMonth() + 1)
    + "-" + (String(d.getDate()).length == 1?"0":"") + d.getDate()
  }
  
  static hashHour(){
    let d =  new Date()
    return d.getFullYear()
    + "-" + (String((d.getMonth() + 1)).length == 1?"0":"") + (d.getMonth() + 1)
    + "-" + (String(d.getDate()).length == 1?"0":"") + d.getDate()
    + " " + (String(d.getHours()).length == 1?"0":"") + d.getHours()
    + ":" + (String(d.getMinutes()).length == 1?"0":"") + d.getMinutes()
    + ":" + (String(d.getSeconds()).length == 1?"0":"") + d.getSeconds()
  }

  static setColorMode(colorMode,backgroundColor,textColor){
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
        if(name!="")
          document.getElementById("css").href = window.location.origin + "/css/" + name + ".css";
      }
    }catch(Exception){
      console.log("error with color mode")
    }
  }
  
  //---------------------------autocomplete---------------------------

  static autocomplete(inp, arr, func) {
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
        if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {    // arr[i].toLowerCase().includes(val.toLowerCase())
          /*create a DIV element for each matching element:*/
          b = document.createElement("DIV");
          /*make the matching letters bold:*/
          b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
          b.innerHTML += arr[i].substr(val.length);
          /*insert a input field that will hold the current array item's value:*/
          b.innerHTML += "<input type='hidden' value=''>";
          b.getElementsByTagName("input")[0].value=arr[i]
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
}