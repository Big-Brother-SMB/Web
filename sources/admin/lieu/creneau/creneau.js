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
    document.getElementById('title').innerHTML=lieu
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
        case "Aumônerie":
          if(j != 2 && (h == 3 || h == 4)){
            defaultPlaces = 0
          }else{
            defaultPlaces = 15
          }
          break;
        case "DOC":
          if(j != 2 && (h == 3 || h == 4)){
            info.places = 15
          }else{
            info.places = 15
          }
          break;
        case "Audio":
          info.places = 15
          break;
        case "Tutorat":
          info.places = 10
          break;
    }
    await common.socketAdminAsync('setLieuInfo',info)
  }


  let divMode = document.getElementById("mode")
  let listModePerm = []
  switch(info.lieu){
      case "Aumônerie":
      case "Tutorat":
      case "CDI":
          listModePerm = ["horaire non planifié","Ouvert","Réservé","Fermé","Vacances"]
          break;
      case "DOC":
      case "Audio":
          listModePerm = ["horaire non planifié","Ouvert","Occupé","Alumni","Fermé","Vacances"]
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





  let table = document.getElementById("tbody")

  let usersList = common.nameOrder(await common.socketAdminAsync('getListPass',null))

  let listScan = await common.socketAsync('getAllLieuList',{w:w,j:j,h:h});

  for(let i in usersList){
      usersList[i].name = common.name(usersList[i].first_name,usersList[i].last_name)
  }

  let affList=[]

  for(let i in usersList){
      listScan.forEach(scan=>{
          if(scan.uuid==usersList[i].uuid && scan.lieu==lieu){
              console.log(usersList[i])
              affList.push(usersList[i])
              const index = affList.length - 1
              let ligne = document.createElement("tr")
              if(scan.scan){
                  ligne.classList.add("greenLine")
              }
              affList[index].ligne=ligne
              table.appendChild(ligne)
              affList[index].scan = scan
          }
      })
  }

  for(let i in affList){
      reloadLigne(affList[i])
  }

  function reloadLigne(user){
      user.ligne.innerHTML=""

      let col= document.createElement("td")
      col.innerHTML=user.name
      user.ligne.appendChild(col)

      col= document.createElement("td")
      col.innerHTML=user.classe
      user.ligne.appendChild(col)

      col= document.createElement("td")
      col.innerHTML=new String(user.code_barre)
      user.ligne.appendChild(col)

      let colS= document.createElement("td")
      colS.innerHTML="suppr"
      colS.addEventListener("click",async ()=>{
          await common.socketAdminAsync('delUserLieu',{w:w,j:j,h:h,uuid:user.uuid});
          user.demande=null

          affList.splice([...table.children].indexOf(user.ligne),1)
          table.removeChild(user.ligne)
          user.ligne=null
      })
      user.ligne.appendChild(colS)
  }
}