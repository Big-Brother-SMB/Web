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


  let divMode = document.getElementById("mode")
  let listModePerm = []
  switch(info.lieu){
      case "CDI":
          listModePerm = ["horaire non planifié","Ouvert","Fermé","Vacances"]
          break;
      case "DOC":
          listModePerm = ["horaire non planifié","Ouvert","Alumni","Fermé","Vacances"]
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
}