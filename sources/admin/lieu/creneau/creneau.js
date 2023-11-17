const nomNiveau = ["secondes","premières","terminales","adultes"]

export async function init(common){
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });
  let j = 0
  let h = 0
  let w = 0
  let lieu = ""
  if(params.j!=null){
    j = parseInt(params.j)
  }
  if(params.h!=null){
    h = parseInt(params.h)
  }
  if(params.w!=null){
    w = parseInt(params.w)
  }
  if(params.lieu!=null){
    lieu = params.lieu
    document.getElementById('title').innerHTML="Selection " + lieu
  }
  document.getElementById("btn_retour").classList.remove("cache")
  document.getElementById("btn_retour").setAttribute("url","/admin/lieu?lieu="+lieu)


  let info = await common.socketAsync("getLieuInfo",{lieu:lieu,w:w,j:j,h:h})
  info.w = w
  info.j = j
  info.h = h
  if(info.places==null || info.places==undefined){
    switch(lieu){
        case "CDI":
          info.places = 0
          break;
        case "Aumonerie":
          info.places = 15
          break;
        case "DOC":
            if(j != 2 && (h == 5 || h == 4)){
              info.places = 10
            }else{
              info.places = 18
            }
            break;
        case "Audio":
          info.places = 15
          break;
        case "Tutorat":
          info.places = 15
          break;
    }
    await common.socketAdminAsync('setLieuInfo',info)
  }


  let divMode = document.getElementById("mode")
  let listModePerm = []
  switch(info.lieu){
      case "Aumonerie":
      case "Tutorat":
      case "CDI":
          listModePerm = ["horaire non planifié","Ouvert","Réservé","Fermé","Vacances"]
          break;
      case "DOC":
      case "Audio":
          listModePerm = ["horaire non planifié","Ouvert","Réservé","Alumni","Fermé","Vacances"]
          break;
  }
  for(let i in listModePerm){
    let opt = document.createElement("option")
    opt.innerHTML = listModePerm[i]
    divMode.appendChild(opt);
  }

  divMode.selectedIndex = info.ouvert
  divMode.addEventListener("change", async function() {
    info.ouvert = this.selectedIndex
    await common.socketAdminAsync('setLieuInfo',info)
  });

  let msg = document.getElementById("msg")
  msg.value = info.msg
  msg.addEventListener("input", async function() {
    info.msg = this.value
    await common.socketAdminAsync('setLieuInfo',info)
  });

  let title = document.getElementById("titre")
  title.value = info.title
  title.addEventListener("input", async function() {
    info.title = this.value
    await common.socketAdminAsync('setLieuInfo',info)
    console.log(info)
  });

  let texte = document.getElementById("texte")
  texte.value = info.texte
  texte.addEventListener("input", async function() {
    info.texte = this.value
    await common.socketAdminAsync('setLieuInfo',info)
  });

  let places = document.getElementById("places")
  places.value = info.places
  places.addEventListener("input", async function() {
    info.places = this.value
    await common.socketAdminAsync('setLieuInfo',info)
  });
}