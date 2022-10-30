const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});
if(params.err!=null){
  document.getElementById("infos").innerHTML += params.err + "<br>"
}

import * as common from "./common.js";

//---------------------------récupération de l'identité---------------------------
if(common.id_data=='err'){
  document.getElementById("infos").innerHTML += "Erreur d'identification<br>"
}

//---------------------------RGPD---------------------------
if (common.readBoolCookie("RGPD")) {
  document.getElementById("checkbox").checked = true
}

document.getElementById("checkbox").addEventListener("change",function(){
  common.writeCookie("RGPD",document.getElementById("checkbox").checked)
})

//---------------------------bouton connection---------------------------
if (common.key != null && common.uuid != undefined) {
  document.getElementById("continue text").innerHTML = common.first_name+" "+common.last_name
  document.getElementById("continue").style.display = "block"
  if (common.readBoolCookie("connect") && document.getElementById("checkbox").checked == true) {
    connect()
  }else{
    document.getElementById("continue").addEventListener("click",function(){
      if(document.getElementById("checkbox").checked == true){
        connect()
      } else {
        document.getElementById("infos").innerHTML += "Vous devez accepter la politique de confidentialité des données et les Cookies<br>"
      }
    })
  }
}


document.getElementById("change").addEventListener("click",function(){
  window.location.href = window.location.origin;
})


//---------------------------connection---------------------------

async function connect(){
  if(common.id_data!='err'){
    common.writeCookie("week",common.actualWeek)
    common.writeCookie("connect",true)
    if(common.id_data.admin>=1){
      window.location.href = "/admin/menu/menu.html";
    } else {
      window.location.href = "/menu/menu.html";
    }
  } else {
    common.writeCookie("connect",false)
  }
}