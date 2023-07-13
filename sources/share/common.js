import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";



//-----------------------------date----------------------------------
let mois=["janvier","fevrier","mars","avril","mai","juin","juillet","aout","septembre","octobre","novembre","decembre"];

Date.prototype.getWeek = function() {
  let now = new Date(this.getFullYear(), this.getMonth(), this.getDate());
  let firstSept = new Date(now.getFullYear(), 8, 1);

  if(now.getTime()+7*86400000<firstSept.getTime()){
    firstSept = new Date(now.getFullYear()-1, 8, 1);
  }


  let diff = now - firstSept
  //diff en jour
  diff = diff/86400000
  //diff en jour, prenant compte du décalage de jour de la semaine
  diff = diff + firstSept.getDay() - now.getDay()
  //diff en semaine
  diff = diff/7
  return diff+1
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
  }
  static get nomNiveau(){
    return ["secondes","premières","terminales","adultes"]
  }*/

  //---------------------charge corps de la page------------------

  static async loadpage(url){
    console.log(url)
    let typeSideBar = url.split("/")[1]
    if(typeSideBar!="admin" && typeSideBar!="asso"){
      typeSideBar="user"
    }
    document.getElementById("mySidenav").className=typeSideBar
    await this.readFileHTMLPath('mySidenav','/share/'+ typeSideBar +'_sidebar.html')

    window.history.pushState({url:url},"", url);
    url=url.split('?')[0]
    document.getElementById("css_page").href=url+'.css'
    await this.readFileHTML(url,'tete','EN-TETE')
    await this.readFileHTML(url,'titre','TITRE')
    await this.readFileHTML(url,'main','main')
    import(url+".js").then(async (module) => {
        await common.reloadCommon()
        await module.init(common)
        return
    })
  }

  static async readFileHTML(url,idFile,idHTML){
    let path = url+'/'+url.split('/').pop()+'.'+idFile+'.html'
    await this.readFileHTMLPath(idHTML,path)
  }

  static async readFileHTMLPath(idHTML,path){
    await new Promise(async (resolve, reject) => {
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
          if(idHTML=='mySidenav'){
            let list_nav_bnt = document.getElementsByClassName('nav_bnt')
            for (var i = 0; i < list_nav_bnt.length; i++) {
              const index = i;
              list_nav_bnt[i].addEventListener('click', async ()=>{
                document.getElementById('mySidenav').classList.remove("open");
                document.body.classList.remove("stop");
                let url = document.getElementsByClassName('nav_bnt')[index].attributes.url.value
                this.loadpage(url)
              });
            }
          }
          resolve()
      };
    })
  }








  static async startUp(){
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

    //----------------------historique-----------------------

    window.addEventListener("popstate", (event) => {
      this.loadpage(event.state.url)
    });



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

    //-------------------system de navbar-----------------------
    
    let side = document.getElementById("mySidenav")

    if(side!=null){
      side.addEventListener("mouseenter",function() {
        if(window.innerWidth>=1000){
            side.classList.add("open");
            document.body.classList.remove("stop");
        }
      });

      side.addEventListener("mouseleave",function() {
        if(window.innerWidth>=1000){
          side.classList.remove("open");
          document.body.classList.remove("stop");
        }
      });

      let btn_menu = document.getElementById("btn_menu")
      btn_menu.addEventListener("click",function() {
        if(!side.classList.contains("open")){//
          side.classList.add("open");
          document.body.classList.add("stop");
          window.scrollTo(0,0);
        }else{
          side.classList.remove("open");
          document.body.classList.remove("stop");
        }
      });


      let list_nav_bnt = document.getElementsByClassName('nav_bnt')

      for (var i = 0; i < list_nav_bnt.length; i++) {
        const index = i;
        list_nav_bnt[i].addEventListener('click', async ()=>{
          side.classList.remove("open");
          document.body.classList.remove("stop");
          let url = document.getElementsByClassName('nav_bnt')[index].attributes.url.value
          this.loadpage(url)
        });
      }
    }
  }

    
  static async reloadCommon(){
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

    this.week = this.readIntCookie("week")
    if(this.week==undefined || this.week==null)this.week=actualWeek

    //---------------------------securité page admin + deco + tuto---------------------------


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
    }else{
      if(this.socketAdmin!=undefined){
        this.socketAdmin.disconnected
        this.socketAdmin=undefined
      }
    }


    if(this.admin==2){
      if(!window.location.pathname.includes("admin") && !window.location.pathname.includes("options")){
        window.location.href = window.location.origin + "/admin"
      }
    } else if(this.admin==0){
      if(window.location.pathname.includes("admin")){
        window.location.href = window.location.origin + "/accueil"
      }
    }

    if(!this.tuto && window.location.pathname!="/tuto"){
      this.popUp_Active("Bienvenue sur le site du Foyer !"
        ,"Ce site permet aux éléves du lycée SMB de manger au Foyer du lycée et d'y passer leurs heures de permanence.Avant de naviguer dessus vous devez comprendre comment il fonctionne pour cela vous devez :"
        ,(bnt)=>{
          bnt.addEventListener("click",()=>{
            this.loadpage("/tuto")
            this.popUp_Stop()
          },{once:true})
        })
    }

    //---------------------------listes---------------------------

    /*const listClasse = ["2A","2B","2C","2D","2E","2F","2G","2H","2I","2J","2K","2L"
    ,"1A","1B","1C","1D","1E","1F","1G","1H","1I","1J","1K"
    ,"TA","TB","TC","TD","TE","TF","TG","TH","TI","TJ","TK"
    ,"PCSI","PC","professeur-personnel"]*/

    //--------------------------banderole--------------------------------

    let banderole = await common.socketAsync("getBanderole",null)
    if (banderole != null && banderole != '') {
      document.getElementById("banderole").innerHTML = banderole
      document.getElementsByClassName("marquee-rtl")[0].style.display = "block"
      document.querySelector(':root').style.setProperty("--screenH","calc(100vh - 11.8em - 32px)")
    }

    //---------------------------theme function---------------------------

    this.themeMode = this.readIntCookie("theme mode")
    if(this.themeMode<0 || this.themeMode>1){
      this.writeCookie("theme mode",0)
      this.themeMode = 0
    }
    if(window.location.pathname!= "/pass"){
      this.setThemeMode(this.themeMode)
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

  //prend en entrer le jour de la semaine (0-4) et le numéro de la semaine
  //renvoie sous forme (4 juin)
  static getDayText(jour,week){
    //différence de semaine en minisecondes depuis aujourd'hui
    let diff_week_ms = 604800000 * (week - actualWeek)
    //semaine de la date chercher en minisecondes
    let dateWeek_ms = Date.now() + diff_week_ms
    //calcule le nombre de jour à retirer
    let nbJour = new Date().getDay()-1-jour
    //calcule la date en ms puis en Date()
    let date = dateWeek_ms - nbJour * 86400000;
    date=new Date(date);

    let text = date.getDate() + " " + mois[date.getMonth()]
    return text
  }

  //renvoie sous forme (2000-07-4 7:00:00)
  /*static getDayHash(j,week,h){
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
  }*/

  //renvoie sous forme (4 au 11 juin)
  static intervalSemaine(semaine){ //nombreSemaineSup = nombre de semaine ce trouve l'intervalle à creer
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

  //renvoie sous forme (07:00:00)
  static getHour(){
    let d = new Date()
    return d.getHours() + ":" + (String(d.getMinutes()).length == 1?"0":"") + d.getMinutes() + ":" + (String(d.getSeconds()).length == 1?"0":"") + d.getSeconds()
  }
  
  
  /*static hashControl(){
    let d = new Date()
    return (d.getHours() + d.getMinutes() +Math.floor(d.getSeconds()/10))**3 %1000
  }*/
  
  //renvoie sous forme (2000-6-4)
  static getDate(){
    let d =  new Date()
    return d.getFullYear()
    + "-" + (String((d.getMonth() + 1)).length == 1?"0":"") + (d.getMonth() + 1)
    + "-" + (String(d.getDate()).length == 1?"0":"") + d.getDate()
  }

  //renvoie sous forme (2000-6-4 07:00:00)
  static getDateHour(){
    let d =  new Date()
    return d.getFullYear()
    + "-" + (String((d.getMonth() + 1)).length == 1?"0":"") + (d.getMonth() + 1)
    + "-" + (String(d.getDate()).length == 1?"0":"") + d.getDate()
    + " " + (String(d.getHours()).length == 1?"0":"") + d.getHours()
    + ":" + (String(d.getMinutes()).length == 1?"0":"") + d.getMinutes()
    + ":" + (String(d.getSeconds()).length == 1?"0":"") + d.getSeconds()
  }

  //-------------------------fonction theme css---------------------------

  static setThemeMode(themeMode){
    try{
      let name = ""
      switch(themeMode){
        case 0:
          //light
          name = ""
          break;
        case 1:
          name = "/dark.css"
          break;
        default:
          break;
      }
      document.getElementById("css").href = name;
    }catch(Exception){
      console.log("error with color mode")
    }
  }
  
  //---------------------------autocomplete---------------------------
  static autocomplete(textInput,list,action,debut){
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
        if ((list[i].substr(0, val.length).toUpperCase() == val.toUpperCase() && debut)
            || (list[i].toLowerCase().includes(val.toLowerCase()) && !debut)) {
          //ajout de l'élément
          let divElement = document.createElement("div");
          if(debut){
            divElement.innerHTML = "<strong>" + list[i].substr(0, val.length) + "</strong>";
            divElement.innerHTML += list[i].substr(val.length);
          }else{
            divElement.innerHTML += list[i];
          }

          //ajout d'un input avec la valeur de l'élement
          divElement.innerHTML += "<input type='hidden' value=''>";
          divElement.getElementsByTagName("input")[0].value=list[i]
          
          //selection d'un élément
          divElement.addEventListener("click", function(e) {
            textInput.value = this.getElementsByTagName("input")[0].value;
            action(this.getElementsByTagName("input")[0].value);
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
    document.getElementById("popup-option").innerHTML="<button id='popup_bnt'>OK</button>"
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
let typeSideBar = document.location.pathname.split("/")[1]
if(typeSideBar!="admin" && typeSideBar!="asso"){
  typeSideBar="user"
}
document.getElementById("mySidenav").className=typeSideBar
import(document.location.pathname+".js").then(async (module) => {
  await common.startUp()
  await common.reloadCommon()
  await module.init(common)
  return
})