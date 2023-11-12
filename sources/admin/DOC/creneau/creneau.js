const nomNiveau = ["secondes","premières","terminales","adultes"]
const listModePerm = ["horaire non planifié","Ouvert","Alumni","Fermé","Vacances"]

export async function init(common){
  document.getElementById("btn_retour").classList.remove("cache")
  document.getElementById("btn_retour").setAttribute("url","/admin/DOC")

  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
  });
  let j = 0
  let h = 0
  let w = 0
  if(params.j!=null){
    j = parseInt(params.j)
  }
  if(params.h!=null){
    h = parseInt(params.h)
  }
  if(params.w!=null){
    w = parseInt(params.w)
  }


  let info = await common.socketAsync('getDOCInfo',{w:w,j:j,h:h})
  info.w=w
  info.j=j
  info.h=h


  let divMode = document.getElementById("mode")
  for(let i in listModePerm){
    let opt = document.createElement("option")
    opt.innerHTML = listModePerm[i]
    divMode.appendChild(opt);
  }

  divMode.selectedIndex = info.ouvert
  divMode.addEventListener("change", async function() {
    info.ouvert = this.selectedIndex
    await common.socketAdminAsync('setDOCInfo',info)
  });

  let msg = document.getElementById("msg")
  msg.value = info.msg
  msg.addEventListener("input", async function() {
    info.msg = this.value
    await common.socketAdminAsync('setDOCInfo',info)
  });

  let title = document.getElementById("titre")
  title.value = info.title
  title.addEventListener("input", async function() {
    info.title = this.value
    await common.socketAdminAsync('setDOCInfo',info)
    console.log(info)
  });

  let texte = document.getElementById("texte")
  texte.value = info.texte
  texte.addEventListener("input", async function() {
    info.texte = this.value
    await common.socketAdminAsync('setDOCInfo',info)
  });
}