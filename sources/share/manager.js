//export
class exportClass{
    static loadpage(url){
        loadpage(url)
    }
}

//démarre le script qui correspond à la page
import(document.location.pathname+".js").then((module) => {
    module.init(exportClass)
    return
})

//system de navbar
let side = document.getElementById("mySidenav")

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
        loadpage(url)
    });
}

async function loadpage(url){
    console.log(url)
    window.history.pushState({id:"100"},"", url);
    url=url.split('?')[0]
    document.getElementById("css_page").href=url+'.css'
    await readFileHTML(url,'tete','EN-TETE')
    await readFileHTML(url,'titre','TITRE')
    await readFileHTML(url,'main','main')
    import(url+".js").then((module) => {
        module.init(exportClass)
        return
    })
}

async function readFileHTML(url,idFile,idHTML){
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

verification_navbar()
function verification_navbar(){
    if(window.innerWidth>=1000){
      side.style.height="unset"
    }
    setTimeout(verification_navbar, 1000);
}


/*
    //-------------------------------Pop-Up------------messagerie---------------------------------

    const overlay = document.getElementById('overlay')

    function openModal(modal) {
    if (modal == null) return
    modal.classList.add('active')
    overlay.classList.add('active')
    }

    function closeModal(modal) {
    if (modal == null) return
    modal.classList.remove('active')
    overlay.classList.remove('active')
    }

    if(common.tuto != true){
        openModal(modal)
    } else {
        database.ref("sondages").once('value').then(function(snapshotS) {
            database.ref("news").once('value').then(function(snapshotN) {
                database.ref("users/" + user + "/messages").once('value').then(function(snapshotM) {
                    snapshotS.forEach(function(child) {
                        if(snapshotS.child(child.key + "/users/" + user).val() == null){
                            nbMsg++
                        }
                    })
                    snapshotN.forEach(function(child) {
                        if(snapshotN.child(child.key + "/users/" + user).val() == null){
                            nbMsg++
                        }
                    })
                    snapshotM.forEach(function(child) {
                        if(snapshotM.child(child.key + "/lu").val() == null){
                            nbMsg++
                        }
                    })
                    if(nbMsg!=0){
                        updateMsg()
                    }
                })
            })
        })
    }



    const notifMsg = document.getElementById("notif msg")

    let nbMsg = 0
    function updateMsg(){
        notifMsg.style.visibility = "visible"
        notifMsg.innerHTML = nbMsg
        let msg=readCookie("msg")
        let hD=hashDay()
        if(msg!=hD){
            const modal = document.getElementById('modal')
            document.getElementById("modal-title").innerHTML="<b>Messagerie</b>"
            document.getElementById("modal-body").innerHTML="Vous avez des messages non lu."
            document.getElementById("modal-option").innerHTML="<button id=\"option-droite\" onclick=\"bntMsgOnclick()\" style=\"text-decoration : none; color :black;\">Messagerie</button>"
            openModal(modal)
        }
    }
    */