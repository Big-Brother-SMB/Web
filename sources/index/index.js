//#00341c9e vert
//#ad5558b5 red
//#6883A1  bleu
const {common} = await import("/common.js");
await common.reloadCommon(true)


const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});
if(params.err!=null){
  document.getElementById("infos").innerHTML += params.err + "<br>"
}

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
  document.getElementById("continue").addEventListener("click",function(){
    if(document.getElementById("checkbox").checked == true){
      connect()
    } else {
      document.getElementById("infos").innerHTML = "Vous devez accepter la politique de confidentialité des données et les Cookies<br>"
    }
  })
}

document.getElementById("change").addEventListener("click",function(){
  window.location.href = window.location.origin+"/connexion/apigoogle";
})


//---------------------------connection---------------------------

async function connect(){
  if(common.id_data!='err'){
    common.writeCookie("week",common.actualWeek)
    common.writeCookie("connect",true)
    if(common.id_data.admin==2){
      window.location.href = "/admin/accueil";
    } else {
      window.location.href = "/accueil";
    }
  } else {
    common.writeCookie("connect",false)
  }
}