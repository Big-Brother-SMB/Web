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


  static async loadpage(url){
    console.log(url)
    window.history.pushState({id:"100"},"", url);
    url=url.split('?')[0]
    document.getElementById("css_page").href=url+'.css'
    await this.readFileHTML(url,'tete','EN-TETE')
    await this.readFileHTML(url,'titre','TITRE')
    await this.readFileHTML(url,'main','main')
    import(url+".js").then(async (module) => {
        await common.reloadCommon(false)
        await module.init(common)
        return
    })
  }

  static async readFileHTML(url,idFile,idHTML){
    let path = url+'/'+url.split('/').pop()+'.'+idFile+'.html'
    const response = await fetch(window.origin+'/auto0'+path);
    const data = await response.blob();
    let file = new File([data], "truc.html", {type: data.type || "text/html",})
    var reader  = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
        if(!response.ok && idHTML!='main'){
            document.getElementById(idHTML).innerHTML=''
        }else{
            document.getElementById(idHTML).innerHTML=reader.result
        }
    };
  }

  

  static async reloadCommon(startup){
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



    if (startup){
      //---------------------------socket---------------------------
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


      let side = document.getElementById("mySidenav")

      if(side!=null){
        //system de navbar

        side.addEventListener("mouseenter",function() {
          if(window.innerWidth>=1000){
              side.style.width = "250px";
              document.body.style.overflow = "unset"; 
          }
        });
  
        side.addEventListener("mouseleave",function() {
          if(window.innerWidth>=1000){
              side.style.width = "80px";
              document.body.style.overflow = "unset"; 
          }
        });
  
        let btn_menu = document.getElementById("btn_menu")
        btn_menu.addEventListener("click",function() {
          if(window.innerWidth<1000){
              if(side.style.height=="0px" || side.style.height==""){
                  side.style.height = "calc(var(--screenH))";
                  side.style.width = "100%";
                  document.body.style.overflow = "hidden";
                  window.scrollTo(0,0);
              }else{
                  side.style.height = "0";
                  side.style.width = "100%";
                  document.body.style.overflow = "unset";  
              }
          }
        });
  
  
        let list_nav_bnt = document.getElementsByClassName('nav_bnt')
  
        for (var i = 0; i < list_nav_bnt.length; i++) {
          const index = i;
          list_nav_bnt[i].addEventListener('click', async ()=>{
              side.style.height = "0";
              document.body.style.overflow = "unset";
              let url = document.getElementsByClassName('nav_bnt')[index].attributes.url.value
              this.loadpage(url)
          });
        }
  
        verification_navbar()
        function verification_navbar(){
          if(window.innerWidth>=1000){
            side.style.height="unset"
          }
          setTimeout(verification_navbar, 1000);
        }
      }
    }
















    

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
    if(this.week==undefined || this.week==null)this.week=actualWeek

    //---------------------------securité page admin + deco---------------------------


    if(this.admin>0 && this.socketAdmin==null){
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


    if (this.readCookie("key")) {
      if(this.admin==2){
        if(!window.location.pathname.includes("admin") && !window.location.pathname.includes("option")){
          window.location.href = window.location.origin + "/admin/menu/menu.html"//%
        }
      } else if(this.admin==0){
        if(window.location.pathname.includes("admin")){
          window.location.href = window.location.origin + "/accueil"
        }
      }
    } else {
      if(!window.location.pathname.includes("index.html")) deco()
    }

    //---------------------------listes---------------------------

    /*const listClasse = ["2A","2B","2C","2D","2E","2F","2G","2H","2I","2J","2K","2L"
    ,"1A","1B","1C","1D","1E","1F","1G","1H","1I","1J","1K"
    ,"TA","TB","TC","TD","TE","TF","TG","TH","TI","TJ","TK"
    ,"PCSI","PC","professeur-personnel"]*/

    //--------------------------banderole--------------------------------

    let banderole = await common.socketAsync("getBanderole",null)
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

  //------------------ socket----------------------------
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

  //----------------------------deco---------------------------
  static deco(){
    let path = window.location.pathname
    if(path!="/index.html"){
      this.delCookie("key");
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
  static autocomplete(textInput,list,action){
    var currentFocus;
    textInput.addEventListener("input", function(e) {
      let val = this.value;
      closeAllLists();
      if (val==""){
        return false;
      }
      currentFocus = -1;

      //création de la divlist 
      let divlist = document.createElement("div");
      divlist.setAttribute("id", this.id + "-autocomplete-list");
      divlist.setAttribute("class", "autocomplete-list");
      textInput.parentNode.appendChild(divlist);

      //ajout des elements dans la divlist correspondant à la valeur(val)
      for (let i = 0; i < list.length; i++) {
        //vérifie si l'élément correspond sans prise en compte des majuscule et minuscule
        if (list[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {    //list[i].toLowerCase().includes(val.toLowerCase())
          //ajout de l'élément
          let divElement = document.createElement("div");
          divElement.innerHTML = "<strong>" + list[i].substr(0, val.length) + "</strong>";
          divElement.innerHTML += list[i].substr(val.length);

          //ajout d'un input avec la valeur de l'élement
          divElement.innerHTML += "<input type='hidden' value=''>";
          divElement.getElementsByTagName("input")[0].value=list[i]
          
          //selection d'un élément
          divElement.addEventListener("click", function(e) {
            textInput.value = this.getElementsByTagName("input")[0].value;
            action();
            closeAllLists();
          });
          divlist.appendChild(divElement);
        }
      }
    });
    
    //selectionner par les touches
    textInput.addEventListener("keydown", function(e) {
      var divlist = document.getElementById(this.id + "-autocomplete-list");
      if (divlist!=null){
        if (e.keyCode == 40) {//DOWN
          currentFocus++;
          addActive(divlist);
        } else if (e.keyCode == 38) {//UP
          currentFocus--;
          addActive(divlist);
        } else if (e.keyCode == 13) {//ENTER
          e.preventDefault();
          if (currentFocus > -1) {
            divlist[currentFocus].click();
          }
        }
      }
    });
    function addActive(divlist) {
      if (!divlist) return false;
      removeActive(divlist);
      if (currentFocus >= divlist.getElementsByTagName("div").length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (divlist.getElementsByTagName("div").length - 1);
      
      //active l'élément selectionner
      divlist.getElementsByTagName("div")[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(divlist) {
      //reset active
      for (var i = 0; i < divlist.getElementsByTagName("div").length; i++) {
        divlist.getElementsByTagName("div")[i].classList.remove("autocomplete-active");
      }
    }


    //ferme la liste
    function closeAllLists(elmnt) {
      var x = document.getElementsByClassName("autocomplete-list");
      for (var i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != textInput) {
          x[i].parentNode.removeChild(x[i]);
        }
      }
    }
    document.addEventListener("click", function (e) {
      closeAllLists(e.target);
    });
  }

  //---------------------------------pop-up-----------------------------------------
  static popUp_Active(titre,body,action){
    document.getElementById("popup-title").innerHTML = '<b>'+titre+'</b>'
    document.getElementById("popup-body").innerHTML = body
    document.getElementById("popup-option").innerHTML="<button id='popup_bnt' style='text-decoration : none; color :black;'>OK</button>"
    document.getElementById("popup").classList.add('active')
    document.getElementById("overlay").classList.add('active')
    action(document.getElementById("popup_bnt"))
  }

  static popUp_Stop(){
    document.getElementById("popup").classList.remove('active')
    document.getElementById("overlay").classList.remove('active')
  }
}

//démarre le script qui correspond à la page
if(document.location.pathname!='/' && document.location.pathname!='/index.html'){
  import(document.location.pathname+".js").then(async (module) => {
    await common.reloadCommon(true)
    await module.init(common)
    return
  })
}