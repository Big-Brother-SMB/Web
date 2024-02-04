import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";



//-----------------------------date----------------------------------
let mois=["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"];

Date.prototype.getWeek = function() {
  let now = new Date(this.getFullYear(), this.getMonth(), this.getDate());
  let firstSept = new Date(now.getFullYear(), 8, 4);

  if(now.getTime()+7*86400000<firstSept.getTime()){
    firstSept = new Date(now.getFullYear()-1, 8, 4);
  }

  let diff = now - firstSept
  //diff en ms, prenant compte du décalage de jour de la semaine
  diff = diff + firstSept.getDay() * 86400000 - now.getDay() *86400000
  //diff en jour
  diff = diff/86400000
  //diff en semaine
  diff = diff/7
  if(now.getDay()==0) diff-=1
  return parseInt(diff+1)
}

const actualWeek = new Date().getWeek();

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

  static async loadpage(url,notSaveHistory){
    if(url.substring(0,8)=="sidebar:"){
      let typeSideBar = url.substring(8,url.length)
      if(typeSideBar!="admin" && typeSideBar!="asso" && typeSideBar!="user"){
        typeSideBar="user"
      }
      if(this.admin==2 && typeSideBar=="user"){
        typeSideBar="admin"
      }
      document.getElementById("mySidenav").classList.remove("user")
      document.getElementById("mySidenav").classList.remove("admin")
      document.getElementById("mySidenav").classList.remove("asso")
      document.getElementById("mySidenav").classList.add(typeSideBar)
      await this.readFileHTMLPath('mySidenav','/share/'+ typeSideBar +'_sidebar.html')

      if(this.admin > 0){
        let btns = document.getElementsByClassName("obj_admin")
        for (var i=0; i<btns.length; i++) {
          btns[i].classList.remove("cache")
        }
      }
      if(this.admin == 2){
        let btns = document.getElementsByClassName("obj_user")
        for (var i=0; i<btns.length; i++) {
          btns[i].classList.add("cache")
        }
      }

      const list_nav_btn = document.getElementsByClassName('nav_btn')
      //----------------------------notif----------------------------------
      
      if(this.readCookie("key")!=null) this.funcNotifs()

      //-------------------listener-------------------------
      for (var i = 0; i < list_nav_btn.length; i++) {
        const index = i;
        list_nav_btn[i].addEventListener('click', async ()=>{
          let url = list_nav_btn[index].attributes.url.value
          if(url.substring(0,8)!="sidebar:" && window.innerWidth<1000){
            document.getElementById("mySidenav").classList.remove("open");
            document.body.classList.remove("stop");
          }
          
          if(url.substring(0,2)=="f:"){
            if(url=="f:banderole"){
              let banderole = await common.socketAsync("getBanderole",null)
              banderole=window.prompt("Message de la banderole:",banderole);
              console.log("msg:",banderole)
              if (banderole!=null){
                  await new Promise(r => setTimeout(r, 1000));
                  await common.socketAdminAsync("setBanderole",banderole)
                  document.getElementById("banderole").innerHTML = banderole
      
                  if (banderole != null && banderole != '') {
                      document.getElementById("banderole").innerHTML = banderole
                      document.getElementsByClassName("marquee-rtl")[0].classList.remove("cache")
                      document.querySelector(':root').style.setProperty("--screenH","calc(calc(var(--vh, 1vh) * 100) - 8em - 30px - 3px - 3.8em + 1px)")
                  }else{
                      document.getElementsByClassName("marquee-rtl")[0].classList.add("cache")
                      document.querySelector(':root').style.setProperty("--screenH","calc(calc(var(--vh, 1vh) * 100) - 8em - 30px - 3px)")
                  }
              }
            }else if(url=="f:addpoint"){
              var nbpts=prompt("Nombre de point(s) à ajouter :","1")
              nbpts = parseFloat(nbpts.replaceAll(",","."))
              let nomgain
              if (nbpts!==null && !isNaN(nbpts)){
                  nomgain=prompt("Nom du gain :", "gain de la semaine " + common.actualWeek)
                  if (nomgain!==null){
                      await common.socketAdminAsync("addGlobalPoint",[new Date(),nomgain,nbpts])
                      if(nomgain=="gain de la semaine " + common.actualWeek){
                        let btn = document.getElementById("nav_btn_add_point")
                        if(btn!=null) btn.classList.remove('notif')
                      }
                      alert("Ajout de points effectué")
                  }
              }
            }
          }else{
            this.loadpage(url)
          }
        });
      }
    }else{
      document.getElementById("container").classList.add('loading')
      if(!notSaveHistory){
        window.history.pushState({url:url},"", url);
      }
      url=url.split('?')[0]
      document.getElementById("css_page").href = url+'/'+url.split('/').pop()+'.css'
      await this.readFileHTML(url,'tete','EN-TETE')
      await this.readFileHTML(url,'titre','TITRE')
      await this.readFileHTML(url,'main','main')
      import(url+'/'+url.split('/').pop()+".js").then(async (module) => {
        await common.reloadCommon()
        await module.init(common)
        document.getElementById("container").classList.remove('loading')
        return
      }).catch(async (err) => {
        document.getElementById("container").classList.remove('loading')
      })
    }
  }

  static async readFileHTML(url,idFile,idHTML){
    let path = url+'/'+url.split('/').pop()+'.'+idFile+'.html'
    await this.readFileHTMLPath(idHTML,path)
  }

  static async readFileHTMLPath(idHTML,path){
    await new Promise(async (resolve, reject) => {
      const response = await fetch(window.origin+path);
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
          resolve()
      };
    })
  }



  //----------------------------notif + admin_permision display---------------------------------------------

  static async funcNotifs(){
    let list_post = await common.socketAsync("getPost","");
    let posts = {}
    list_post.forEach(element => {
      if(!element.lu){
        if(posts[element.group2]==undefined){
          posts[element.group2]=1
        }else{
          posts[element.group2]++
        }
        if(posts['asso']==undefined){
          posts['asso']=1
        }else{
          posts['asso']++
        }
      }
    });

    let admin_permission = this.admin_permission

    const list_nav_elem = document.getElementById("mySidenav").children
    for (var i = 0; i < list_nav_elem.length; i++) {
      let perm_item = list_nav_elem[i].getAttribute("permission")
      if(admin_permission[perm_item]==0){
        list_nav_elem[i].classList.add('cache')
      }
      if(perm_item!=null && admin_permission[perm_item.substring(0,perm_item.length-1)]<2){
        list_nav_elem[i].classList.add('cache')
      }
    }

    const list_nav_btn = document.getElementsByClassName('nav_btn')
    for (var i = 0; i < list_nav_btn.length; i++) {
      if(posts[list_nav_btn[i].getAttribute('group')]!=undefined){
        list_nav_btn[i].classList.add('notif')
        list_nav_btn[i].getElementsByClassName("badge")[0].innerHTML = posts[list_nav_btn[i].getAttribute('group')]
      }
    }

    if(this.socketAdmin != undefined){
      let global_points = await common.socketAdminAsync("getGlobalPoint",null)
      let test=true
      global_points.forEach(e => {
          if("gain de la semaine " + common.actualWeek==e.name){
              test=false
          }
      })
      if(test){
          let btn = document.getElementById("nav_btn_add_point")
          if(btn!=null) btn.classList.add('notif')
      }
    }

    let d = new Date();
    if(!common.existCookie("sondageMenuVu") && d.getHours()>=12 && (d.getDay()==1 || d.getDay()==2 || d.getDay()==4 || d.getDay()==5)){
      let btn = document.getElementById("nav_btn_menu")
      if(btn!=null) btn.classList.add('notif')
    }
  }








  static async startUp(){
    //-----------------------screen size------------------------------------

    const appHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    window.addEventListener('resize', appHeight)
    appHeight()

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

    //---------------------------theme function---------------------------

    this.themeMode = this.readIntCookie("theme mode")
    this.setThemeMode(this.themeMode)

    //---------------------------pass offline-------------------------------
    try {
      if(document.location.pathname=="/pass" && this.existCookie("key") && this.existCookie("codeBarre")){
        const containerElement = document.getElementById('single');
        const codeBar = this.readCookie("codeBarre")
        const bcid = 'bc'+codeBar;
        const bcimg = document.createElement('img');
        bcimg.className = "barcode";
        bcimg.setAttribute('id', bcid);
        containerElement.innerHTML=""
        containerElement.appendChild(bcimg);
        JsBarcode('#'+bcid, codeBar, {format: 'code39'});
      }
    } catch (error) {}


    //----------------------historique-----------------------

    window.addEventListener("popstate", (event) => {
      this.loadpage(document.location.pathname,true)
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
        if(!side.classList.contains("open")){
          side.classList.add("open");
          document.body.classList.add("stop");
          window.scrollTo(0,0);
        }else{
          side.classList.remove("open");
          document.body.classList.remove("stop");
        }
      });

      
      
      await common.reloadCommon()
      this.loadpage("sidebar:" + document.location.pathname.split("/")[1])

      if(!this.tuto && this.admin!=2){
        this.popUp_Active("(1/5) Bienvenue sur le site du Foyer !"
          ,"<div class='divImgPopup'><img src='/assets/nav_bar/amis.png'><img src='/assets/nav_bar/midi.png'></div><br>"
          +"Ce site permet aux éléves du lycée SMB de <b>manger au Foyer du lycée avec leurs amis</b> en déposant une demande.<br>"
          +"Cette demande sera étudiée par <b>un algorithme qui a pour objectif</b>:<br><br>"
          +"1)De pouvoir manger avec ses amis.<br>"
          +"2)De sélectionner ou avantager les personnes prioritaires (c'est le responsable du Foyer qui active ou non cette fonctionnalité).<br>"
          +"3)De permettre un meilleur remplissage du Foyer.<br>"
          +"4)D'avantager les lycéens qui sont allés le moins souvent manger au foyer. (par le biais des points)<br>"
          +"5)D'avantager les lycéens qui ont déposé une demande à l'avance (la veille ou avant).<br>"
          +"<br><b>Il faut ajouter préalablement vos amis dans votre liste d'amis.</b>"
          ,(btn)=>{
            btn.addEventListener("click",()=>{
              this.popUp_Active("(2/5) Bienvenue sur le site du Foyer !"
                ,"<div class='divImgPopup'><img src='/assets/nav_bar/perm.png'><img src='/assets/nav_bar/emprunt.png'><img src='/assets/nav_bar/arcade.png'></div><br>"
                +"Ce site permet aussi de passer <b>des heures de permanence au Foyer</b>, en déposant une demande <b>pour sa classe</b>."
                ,(btn)=>{
                  btn.addEventListener("click",()=>{
                    this.popUp_Active("(3/5) Bienvenue sur le site du Foyer !"
                      ,"<div class='divImgPopup'><img src='/assets/nav_bar/tuto.png'></div><br>"
                      +'Pour plus d\'informations,  consultez l\'onglet <b>"Aide"</b>'
                      ,(btn)=>{
                        btn.addEventListener("click",()=>{
                          this.popUp_Active("(4/5) Bienvenue sur le site du Foyer !"
                            ,"<div class='divImgPopup'><img src='/assets/nav_bar/association.png'></div><br>"
                            +'Le site permet aux <b>associations et aux projets lycéens</b> de pouvoir avoir une page de présentation.<br>Ces pages sont consultables dans <b>l\'onglet "Projets&Asso"</b>.'
                            ,(btn)=>{
                              btn.addEventListener("click",()=>{
                                this.popUp_Active("(5/5) Bienvenue sur le site du Foyer !"
                                  ,"<div class='divImgPopup'><img src='/assets/nav_bar/messagerie.png'><img src='/assets/nav_bar/admin.png'></div><br>"
                                  +"<b>Si tu as envie de faire partie de l'équipe de développement du site du Foyer, contacte nous!</b><br><br>"
                                  +"Si tu rencontres un problème avec le site, contacte :<br>"
                                  +"Jean-Charles au Foyer ou nathan.denut@stemariebeaucamps.fr"
                                  ,(btn)=>{
                                    btn.addEventListener("click",()=>{
                                      common.socketAsync('setTuto',true)
                                      this.popUp_Stop()
                                    },{once:true})
                                  },false)
                              },{once:true})
                            },false)
                        },{once:true})
                      },false)
                  },{once:true})
                },false)
            },{once:true})
        },false)
      }else{
        //---------------------------------pop-up notif ServiceWorker---------------------------------------------
        
        if(!this.existCookie("pointNotif2") && !this.readBoolCookie("notifAccept")){
          document.cookie = "pointNotif2=true; max-age=1209600; path=/";
          this.delCookie("notifAccept")
        }
        if(!this.existCookie("notifAccept")) this.writeCookie("notifAccept",true)


        common.registerServiceWorker();

        if((this.readBoolCookie("notifAccept") && ("Notification" in window) && ("serviceWorker" in navigator) && !window.location.pathname.includes("/asso"))
        && (Notification.permission != "granted" || !(await common.socketAsync("existNotificationSubscription",null)))){
          this.popUp_Active("Notification site du Foyer!"
          ,"<div class='divImgPopup' style='margin:0 0'><img style='margin: 0 7%;' src='/assets/action/notification.png'>"
          +"<p style='margin-right:7%;padding-top:25px;font-size: 1.5rem;'>Les notifications vous permettront de rester informé·e des <b>demandes de repas déposées</b>, des <b>sondages</b>, ainsi que de <b>l'acceptation</b> ou du <b>refus</b> de votre demande.</p></div>"
          +"<p style='text-align:center;font-size: 2.2rem;'><b>Recevez les notifications du site</b></p>"
          ,(btn)=>{
            let bloquerBoucle = 5
            btn.style.background ="red"
            const bloquerBoucleFunc = function(){
              btn.innerHTML="Bloquer(" + bloquerBoucle + ")"
              if(bloquerBoucle==0){
                btn.innerHTML="Bloquer"
                btn.addEventListener("click",()=>{
                  common.writeCookie("notifAccept",false)
                  common.popUp_Stop()
                },{once:true})
              }else{
                bloquerBoucle--
                setTimeout(bloquerBoucleFunc, 1000);
              }
            }
            bloquerBoucleFunc()

            let btn2 = document.createElement("button")
            btn2.innerHTML="Accepter"
            btn2.style.background ="green"
            btn2.addEventListener("click",()=>{
              common.askNotificationPermission()
              this.popUp_Stop()
            },{once:true})
            btn.parentNode.appendChild(btn2)
          },false)
        }
      }
    }

    //------------------------install PWA-----------------------------

    window.addEventListener('beforeinstallprompt', (e) => {
      let deferredPrompt;
      // Prevents the default mini-infobar or install dialog from appearing on mobile
      e.preventDefault();
      // Save the event because you'll need to trigger it later.
      deferredPrompt = e;
      // Show your customized install prompt for your PWA
      // Your own UI doesn't have to be a single element, you
      // can have buttons in different locations, or wait to prompt
      // as part of a critical journey.
      common.popUp_Active("Installer PWA","Voulez-vous installée l'application foyer?",btn=>{
        btn.innerHTML="Installer"
        btn.addEventListener('click', async () => {
          // deferredPrompt is a global variable we've been using in the sample to capture the `beforeinstallevent`
          deferredPrompt.prompt();
          // Find out whether the user confirmed the installation or not
          const { outcome } = await deferredPrompt.userChoice;
          // The deferredPrompt can only be used once.
          deferredPrompt = null;
          // Act on the user's choice
          if (outcome === 'accepted') {
            console.log('User accepted the install prompt.');
          } else if (outcome === 'dismissed') {
            console.log('User dismissed the install prompt');
          }
          common.popUp_Stop()
        });
      })
    });

    let socketInterruption = io("/interruption",{
      auth: {
        token: common.key
      }
    });
    
    socketInterruption.on("connect", () => {
      socketInterruption.on("achievement",msg => {
        if(msg.event=='anniversaire' && msg.uuid==common.uuid && common.achievement["anniversaire"]!=1){
          common.popUp_Active("Happy Birth!!!",'Voici un """cadeau""" de la part des développeurs, nous espérons que notre esthétique vous conviendra.<br>Penser à mettre le son et n\'oubliez d\'appuyer sur l\'écran noir.<br><br> Joyeux anniversaire!',(btn)=>{
            btn.innerHTML="Récupérer le cadeau"
            btn.addEventListener("click",()=>{
              common.popUp_Stop()
              common.setThemeMode(3)
              common.writeCookie("theme mode", 3)
              common.themeMode = 3
              common.achievement["anniversaire"]=1
            })
          },false)
        }
      });
    });


    //-------------------------------------retour--------------------------------------

    document.getElementById("btn_retour").addEventListener('click', async ()=>{
      let url = document.getElementById("btn_retour").attributes.url.value
      if(url.substring(0,8)!="sidebar:" && window.innerWidth<1000){
        side.classList.remove("open");
        document.body.classList.remove("stop");
      }
      this.loadpage(url)
    });
  }

    
  static async reloadCommon(){
    //-------------------------------------retour--------------------------------------

    document.getElementById("btn_retour").classList.add("cache")

    //---------------------------récupération de l'identité et des cookie/variable---------------------------

    let id_data = await this.socketAsync("id_data","")
    this.id_data = id_data
    console.log(id_data)

    this.tuto=true
    if(id_data!='err'){
      this.admin = id_data.admin
      this.classe = id_data.classe
      this.codeBar = id_data.code_barre
      this.writeCookie("codeBarre",this.codeBar)
      this.email = id_data.email
      this.first_name = id_data.first_name
      this.groups = id_data.groups
      this.last_name = id_data.last_name
      this.tuto = id_data.tuto
      this.uuid = id_data.uuid
      this.achievement = id_data.achievement
      this.admin_permission = id_data.admin_permission
      if(id_data.admin_permission.admin_only && id_data.admin){
        this.admin = 2
      }
    } else {
      if(window.location.pathname.includes("/asso")){
        let btn = document.getElementById("without_account")
        if(btn!=null) btn.setAttribute('href',"/")
      }else if(window.location.pathname=="/credit"){
        document.getElementById("mySidenav").classList.add("cache")
        document.getElementById("btn_menu").classList.add("cache")
      }else{
        this.deco()
      }
    }

    this.week = this.readIntCookie("week")
    if(this.week==undefined || this.week==null)this.week=actualWeek

    //-----------------------------------log------------------------------

    await this.socketAsync("log",document.location.pathname)

    //---------------------------securité page admin + deco + tuto---------------------------


    if(this.admin>0 && this.socketAdmin==undefined){
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

    if(this.admin == 2){
      if(!window.location.pathname.includes("/admin") && !window.location.pathname.includes("/options")){
        window.location.href = window.location.origin + "/options"
      }
    } else if(this.admin==0){
      if(window.location.pathname.includes("/admin")){
        window.location.href = window.location.origin + "/accueil"
      }
    }

    if(window.location.pathname.includes("/admin")) common.delCookie('troll') //troll



    //--------------------------banderole--------------------------------

    let banderole = await common.socketAsync("getBanderole",null)
    if (banderole != null && banderole != '') {
      document.getElementById("banderole").innerHTML = banderole
      let vitesse = 0.1* banderole.length
      if(vitesse<8) vitesse=8
      document.getElementById("banderole").style.animation = "defilement-rtl " + vitesse + "s infinite linear"
      document.getElementsByClassName("marquee-rtl")[0].classList.remove("cache")
      document.querySelector(':root').style.setProperty("--screenH","calc(calc(var(--vh, 1vh) * 100) - 8em - 30px - 3px - 3.8em + 1px)")
    }

    //----------------------cacher les boutons de changement de side bar-----------------------------
    if(this.admin > 0){
      let btns = document.getElementsByClassName("obj_admin")
      for (var i=0; i<btns.length; i++) {
        btns[i].classList.remove("cache")
      }
    }
    if(this.admin == 2){
      let btns = document.getElementsByClassName("obj_user")
      for (var i=0; i<btns.length; i++) {
        btns[i].classList.add("cache")
      }
    }
  }


  //cookie
  static writeCookie(key, value){
    if(key=="week" || key=="sondageMenuVu"){
      document.cookie = key + "=" + value + "; max-age=43200; path=/";
    }else{
      document.cookie = key + "=" + value + "; expires=Mon, 06 Oct 2100 00:00:00 GMT; path=/";
    }
    this.cookie[key]=String(value)
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
          socket.once(channel,result => {
            resolve(result)
          });
          socket.emit(channel,msg);
          if(time==undefined){
            time=20000
          }
          setTimeout(()=>{
            reject({channel:channel,msg:msg,time:time})
          },time)
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
                  time=20000
                }
                setTimeout(()=>{
                  reject({channel:channel,msg:msg,time:time})
                },time)
            })
        } else {
            console.log('error: admin = 0')
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

  //-------------------------notification navigateur---------------------

  static async askNotificationPermission() {
    if (("Notification" in window) && ("serviceWorker" in navigator)) {
      if (Notification.permission != "granted") {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          common.registerServiceWorker();
        }
      }else if(Notification.permission === "granted"){
        common.registerServiceWorker();
      }
    }
  }

  static async registerServiceWorker() {
    if("serviceWorker" in navigator){
      const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" })
      try{
        registration.update().then(() => {
          registration.active.postMessage({notif:common.readBoolCookie("notifAccept"),user:common.uuid});
        })
      }catch(e){
        console.error(e);
      }
      if(Notification.permission === "granted"){
        let subscription = await registration.pushManager.getSubscription();
        // L'utilisateur n'est pas déjà abonné, on l'abonne au notification push
        if (!subscription) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: await common.getPublicKey(),
          });
        }
      
        await common.socketAsync("subscribeNotification",subscription)
      }
    }
  }
  
  static async getPublicKey() {
    const { key } = await fetch("/push/key", {
      headers: {
        Accept: "application/json",
      },
    }).then((r) => r.json());
    return key;
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
    /*//différence de semaine en minisecondes depuis aujourd'hui
    let diff_week_ms = 604800000 * (week - actualWeek)
    //semaine de la date chercher en minisecondes
    let dateWeek_ms = Date.now() + diff_week_ms
    //calcule le nombre de jour à retirer
    let nbJour = new Date().getDay()-1-jour
    //calcule la date en ms puis en Date()
    let date = dateWeek_ms - nbJour * 86400000;
    date=new Date(date);*/
    let date = this.generedDate(week,jour,0,0,0)

    let text = date.getDate() + " " + mois[date.getMonth()]
    return text
  }

  //renvoie sous forme (4 au 11 juin), soit la date du lundi et du vendredi
  static intervalSemaine(semaine){ //semaine = semaine de l'intervalle à afficher
    let jour = new Date().getDay()-1;
    if(jour==-1) jour=6
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
  /*static getDate(){
    let d =  new Date()
    return d.getFullYear()
    + "-" + (String((d.getMonth() + 1)).length == 1?"0":"") + (d.getMonth() + 1)
    + "-" + (String(d.getDate()).length == 1?"0":"") + d.getDate()
  }*/

  //renvoie sous forme de DATE
  static generedDate(week,jour,h,min,s){
    if(h==undefined) h=0
    if(min==undefined) min=0
    if(s==undefined) s=0
    let nowDate = new Date()
    let jourActuel = nowDate.getDay();
    if (jourActuel==0) jourActuel=7
    if (jour==0) jour=7
    let date_in_ms=(Date.now()+604800000*(week - actualWeek))-(jourActuel-jour)*86400000;
    date_in_ms+= (h-nowDate.getHours())*3600000 + (min-nowDate.getMinutes())*60000 + (s-nowDate.getSeconds())*1000
    return new Date(date_in_ms);
  }

  /*static generedDateHour(date){
    let date = new Date();
    let jourActuel =date.getDay();//-1
    let jour = j
    //if(j > 1)jour++
    let dateBeg=(Date.now()+604800000*(week - actualWeek))-(jourActuel-jour)*86400000;
    dateBeg=new Date(dateBeg);
    dateBeg = dateBeg.toLocaleString();
    let mBeg = dateBeg[3]+dateBeg[4]
    let text = ""
    text = dateBeg[6]+dateBeg[7]+dateBeg[8]+dateBeg[9] + "-" + mBeg + "-" + dateBeg[0]+dateBeg[1] + " " + h+":00:00"
    return text
  }*/

  //renvoie sous forme (2000-6-4 07:00:00)
  static getDateHour(date){
    if(date==undefined) date = new Date()
    return date.getFullYear()
    + "-" + (String((date.getMonth() + 1)).length == 1?"0":"") + (date.getMonth() + 1)
    + "-" + (String(date.getDate()).length == 1?"0":"") + date.getDate()
    + " " + (String(date.getHours()).length == 1?"0":"") + date.getHours()
    + ":" + (String(date.getMinutes()).length == 1?"0":"") + date.getMinutes()
    + ":" + (String(date.getSeconds()).length == 1?"0":"") + date.getSeconds()
  }

  //-------------------------fonction theme css---------------------------

  static async setThemeMode(themeMode){
    try{
      let name = ""
      switch(themeMode){
        case 0:
          //light
          name = ""
          break;
        case 1:
          name = "/share/dark.css"
          break;
        case 3:
          const objCacheB = document.createElement("div")
          objCacheB.style.backgroundColor="black"
          objCacheB.style.position="fixed"
          objCacheB.style.height="150vh"
          objCacheB.style.width="150vw"
          objCacheB.style.zIndex="150"
          objCacheB.style.top="0"
          objCacheB.style.transition="1s";
          document.body.appendChild(objCacheB)
          let func = ()=>{
            objCacheB.removeEventListener("click",func)
            const sheikah = new Audio("/css_spe/birthday.mp3");
            sheikah.play();
            objCacheB.style.backgroundColor="#0000";
            setTimeout(() => {
              document.body.removeChild(objCacheB)
            }, 1000);
          }
          objCacheB.addEventListener("click",func)
          name = "/css_spe/birthday.css"
          break;
        case 6:
          const objCacheZ = document.createElement("div")
          objCacheZ.style.backgroundColor="black"
          objCacheZ.style.position="fixed"
          objCacheZ.style.height="150vh"
          objCacheZ.style.width="150vw"
          objCacheZ.style.zIndex="150"
          objCacheZ.style.top="0"
          objCacheZ.style.transition="1s";
          document.body.appendChild(objCacheZ)
          let funcZ = ()=>{
            objCacheZ.removeEventListener("click",funcZ)
            const sheikah = new Audio("/css_spe/sheikah.mp3");
            sheikah.play();
            objCacheZ.style.backgroundColor="#0000";
            setTimeout(() => {
              document.body.removeChild(objCacheZ)
            }, 1000);
          }
          objCacheZ.addEventListener("click",funcZ)
          name = "/css_spe/zelda.css"
          break;
        default:
          //light
          name = ""
          break;
      }
      if(common.readCookie("troll")==null) document.getElementById("css").href = name;//troll
    }catch(Exception){
      console.error(Exception)
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
            divlist.getElementsByTagName("div")[currentFocus].click();
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
  static popUp_Active(titre,body,action,cross){
    document.getElementById("popup-title").innerHTML = '<b>'+titre+'</b>'
    if(cross==true || cross==undefined){
      document.getElementById("popup-title").innerHTML += '<a id="popup-close-button">&#x274C;</a>'
      document.getElementById("popup-close-button").addEventListener("click",() => {
        common.popUp_Stop()
      });
    }
    document.getElementById("popup-body").innerHTML = body
    document.getElementById("popup-option").innerHTML="<button id='popup_btn'>OK</button>"
    document.getElementById("popup").classList.add('active')
    document.getElementById("overlay").classList.add('active')

    action(document.getElementById("popup_btn"))
  }

  static popUp_Stop(){
    document.getElementById("popup").classList.remove('active')
    document.getElementById("overlay").classList.remove('active')
  }

  //-------------------------------------Name-----------------------------------------

  static name(first_name,last_name) {
    if(this.readBoolCookie("name_mode")==true){
      return last_name  + " " + first_name 
    }else{
      return first_name + " " + last_name
    }
  }

  static nameOrder(list) {
    if(this.readBoolCookie("name_mode")==true){
      list.sort(function(a, b) {
        var first_nameA = a.first_name.toUpperCase();
        var first_nameB = b.first_name.toUpperCase();
        var last_nameA = a.last_name.toUpperCase();
        var last_nameB = b.last_name.toUpperCase();
        if(last_nameA<last_nameB){
          return -1
        }else if(last_nameA>last_nameB){
          return 1
        }else{
          if(first_nameA<first_nameB){
            return -1
          }else if(first_nameA>first_nameB){
            return 1
          }
        }
        return 0
      })
    }else{
      list.sort(function(a, b) {
        var first_nameA = a.first_name.toUpperCase();
        var first_nameB = b.first_name.toUpperCase();
        var last_nameA = a.last_name.toUpperCase();
        var last_nameB = b.last_name.toUpperCase();
        if(first_nameA<first_nameB){
          return -1
        }else if(first_nameA>first_nameB){
          return 1
        }else{
          if(last_nameA<last_nameB){
            return -1
          }else if(last_nameA>last_nameB){
            return 1
          }
        }
        return 0
      })
    }
    return list
  }

  //-----------------------------------PDF-----------------------------------------
  /*static displayPDF(divForCanvas,pdf){
    let loadingTask = pdfjsLib.getDocument(pdf);
    loadingTask.promise.then(function(pdf) {
      for(let i = 1;i<=pdf.numPages;i++){
        pdf.getPage(i).then(function(page) {
            let scale = 2;
            let viewport = page.getViewport({ scale: scale, });
            // Support HiDPI-screens.
            let outputScale = window.devicePixelRatio || 1;
            
            let canvas = document.createElement("canvas");
            let context = canvas.getContext('2d');
            
            canvas.width = Math.floor(viewport.width * outputScale);
            canvas.height = Math.floor(viewport.height * outputScale);
            canvas.style.width = "100%";
            canvas.style.height =  "auto";
            
            let transform = outputScale !== 1
              ? [outputScale, 0, 0, outputScale, 0, 0]
              : null;
              
            let renderContext = {
              canvasContext: context,
              transform: transform,
              viewport: viewport
            };
            page.render(renderContext);

            divForCanvas.appendChild(canvas)
        });
      }
    });
  }

  static uploadPDF(group){
    this.popUp_Active("Upload PDF",
      "<form action='/fileupload/pdf' method='post' enctype='multipart/form-data'>\n"
      +"  <input type='text' name='title' placeholder='Titre'><br>\n"
      +"  <input type='file' name='file'><br>\n"
      +"  <input style='display: none;' type='text' name='token' value='" + this.key + "'>\n"
      +"  <input style='display: none;' type='text' name='group' value='" + group + "'>\n"
      +"  <input type='submit'>\n"
      +"</form>",(btn)=>{
        btn.innerHTML='Annuler'
        btn.addEventListener("click",()=>{
          this.popUp_Stop()
        },{once:true})
      })
  }*/
}

//démarre le script qui correspond à la page
import(document.location.pathname+'/'+document.location.pathname.split('/').pop()+".js").then(async (module) => {
  await common.startUp()
  if(common.readCookie("troll")!=null) import('/troll/troll.js') //troll
  await module.init(common)
  return
})

