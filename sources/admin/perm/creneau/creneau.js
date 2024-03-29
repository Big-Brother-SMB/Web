const nomNiveau = ["secondes","premières","terminales","adultes"]

export async function init(common){
  if(common.admin_permission["foyer_perm"]!=2) common.loadpage("/options")

  document.getElementById("btn_retour").classList.remove("cache")
  document.getElementById("btn_retour").setAttribute("url","/admin/perm")

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

  const listModePerm = ["horaire non planifié","Sélection","Fermé","Ouvert à tous","Réservation","Vacances"]


  let divSpecial = document.getElementById("divSpecial")
  let bAddSpecial = document.getElementById("add special")
  let inputSpecial = document.getElementById("input special")


  let divMode = document.getElementById("mode")
  for(let i in listModePerm){
    let opt = document.createElement("option")
    opt.innerHTML = listModePerm[i]
    divMode.appendChild(opt);
  }

  divMode.selectedIndex = await common.socketAsync("getOuvertPerm",{w:w,j:j,h:h})
  divMode.addEventListener("change", async function() {
    await common.socketAdminAsync('setPermOuvert',[w,j,h,this.selectedIndex])
  });


  let divDemandes = document.getElementById("demandes")


  let listDemandes = await common.socketAsync("listDemandesPerm",{w:w,j:j,h:h})
  let listUsers = await common.socketAdminAsync('getListUserComplete',null)

  let listInscrit = []

  if(listDemandes.lenght!=0){
    divDemandes.innerHTML = ""
  }
  listDemandes.forEach(function(child) {
  if(child.DorI!=true){
    let name
    listUsers.forEach(child2=>{
        if(child.uuid==child2.uuid){
            name=common.name(child2.first_name,child2.last_name)
        }
    })
    let but = document.createElement("button")
    but.classList.add("ami")
    but.innerHTML = child.group2 +  " : " + child.nb +" (" + name + ")"

    but.addEventListener("click", async function(){
        but.remove()
        await common.socketAdminAsync('delPermDemande',[w,j,h,child.uuid])
    })
    divDemandes.appendChild(but);
  }else{
    listInscrit.push(child.group2)
  }
  })

  let g_c = await common.socketAdminAsync('getGroupAndClasse',null)
  listUsers.forEach(e=>{
    if(e.ban!=null){
        for(const i in g_c[0]){
            for(const j in e.groups){
                if(g_c[0][i].group2==e.groups[j]){
                    g_c[0][i].ban=true
                }
            }
        }
        for(const i in g_c[1]){
            if(g_c[1][i].classe==e.classe){
                g_c[1][i].ban=true
            }
        }
    }
  })

  let divGroupes = document.getElementById("groupes")

  let cbGroupes = []
  let groupes = []
  let iG = 0

  let divG1 = document.createElement("div")
  divG1.style="display: inline-block;*display: inline;width:30%;vertical-align: top;"
  let divG2 = document.createElement("div")
  divG2.style="display: inline-block;*display: inline;width:30%;vertical-align: top;"
  let divG3 = document.createElement("div")
  divG3.style="display: inline-block;*display: inline;width:30%;vertical-align: top;"
  let loop2 = 0
  g_c[0].forEach(function(child) {
    const index = iG;
    groupes.push(child.group2)
    let gr = document.createElement("p")
    cbGroupes[index] = document.createElement("input")
    cbGroupes[index].type = "checkbox"
    cbGroupes[index].addEventListener("click", async function() {
        if(cbGroupes[index].checked){
            if(!listInscrit.includes(groupes[index])){
                listInscrit.push(groupes[index])
            }
            await common.socketAdminAsync('setPermInscrit',[w,j,h,listInscrit])
        }else{
            if(listInscrit.includes(groupes[index])){
                listInscrit = listInscrit.filter(o => o != groupes[index]);
            }
            await common.socketAdminAsync('setPermInscrit',[w,j,h,listInscrit])
        }
    })
    //cbClasses[n][i].checked = true
    gr.innerHTML = groupes[index]
    if(child.ban!=undefined) gr.style.color="red"
    gr.appendChild(cbGroupes[index]);
    if (loop2==0){
        loop2=1
        divG1.appendChild(gr);
    } else if (loop2==1){
        loop2=2
        divG2.appendChild(gr);
    } else {
        loop2=0
        divG3.appendChild(gr);
    }
    if(listInscrit.includes(groupes[index])){
        cbGroupes[index].checked = true
    }
    iG++;
  })
  divGroupes.appendChild(divG1);
  divGroupes.appendChild(divG2);
  divGroupes.appendChild(divG3);



  let divClasses = document.getElementById("classes")
  let listNiveau = [[],[],[],[]]
  let listNiveauBan = [[],[],[],[]]
  g_c[1].forEach(function(child) {
    listNiveau[child.niveau].push(child.classe)
    listNiveauBan[child.niveau].push(child.ban)
  })
  let cbClasses = []
  for(let n in listNiveau){
    cbClasses[n] = []
    let divNiveau = document.createElement("div")
    divNiveau.style="display: inline-block;*display: inline;width:23%;vertical-align: top;"

    let nSelectAll = document.createElement("button")
    nSelectAll.className = "btn cent"
    nSelectAll.innerHTML ="selectionner tous les " + nomNiveau[n]
    nSelectAll.addEventListener("click", async function() {
        console.log("niveau " + n + " select all")
        for(let i in cbClasses[n]){
            cbClasses[n][i].checked = true
            if(!listInscrit.includes(listNiveau[n][i])){
                listInscrit.push(listNiveau[n][i])
            }
        }
        await common.socketAdminAsync('setPermInscrit',[w,j,h,listInscrit])
    });
    divNiveau.appendChild(nSelectAll);

    let nSelectNone = document.createElement("button")
    nSelectNone.className = "btn cent"
    nSelectNone.innerHTML ="retirer tous les " + nomNiveau[n]
    nSelectNone.addEventListener("click", async function() {
        console.log("niveau " + n + " select none")
        for(let i in cbClasses[n]){
            cbClasses[n][i].checked = false
            if(listInscrit.includes(listNiveau[n][i])){
                listInscrit = listInscrit.filter(o => o != listNiveau[n][i]);
            }
        }
        await common.socketAdminAsync('setPermInscrit',[w,j,h,listInscrit])
    });
    divNiveau.appendChild(nSelectNone);

    let nInversed = document.createElement("button")
    nInversed.className = "btn cent"
    nInversed.innerHTML ="Inverser tous les " + nomNiveau[n]
    nInversed.addEventListener("click", async function() {
        console.log("niveau " + n + " inversed")
        for(let i in cbClasses[n]){
            cbClasses[n][i].checked = !cbClasses[n][i].checked
            if(cbClasses[n][i].checked){
                if(!listInscrit.includes(listNiveau[n][i])){
                    listInscrit.push(listNiveau[n][i])
                }
            }else{
                if(listInscrit.includes(listNiveau[n][i])){
                    listInscrit = listInscrit.filter(o => o != listNiveau[n][i]);
                }
            }
        }
        await common.socketAdminAsync('setPermInscrit',[w,j,h,listInscrit])
    });
    divNiveau.appendChild(nInversed);

    for(let i in listNiveau[n]){
        let opt = document.createElement("p")
        cbClasses[n][i] = document.createElement("input")
        cbClasses[n][i].type = "checkbox"
        //cbClasses[n][i].checked = true
        opt.innerHTML = listNiveau[n][i]
        if(listNiveauBan[n][i]!=undefined) opt.style.color="red"
        opt.appendChild(cbClasses[n][i]);
        cbClasses[n][i].addEventListener("click", async function() {
            if(cbClasses[n][i].checked){
                if(!listInscrit.includes(listNiveau[n][i])){
                    listInscrit.push(listNiveau[n][i])
                }
            }else{
                if(listInscrit.includes(listNiveau[n][i])){
                    listInscrit = listInscrit.filter(o => o != listNiveau[n][i]);
                }
            }
            await common.socketAdminAsync('setPermInscrit',[w,j,h,listInscrit])
        })
        divNiveau.appendChild(opt);
        if(listInscrit.includes(listNiveau[n][i])){
            cbClasses[n][i].checked = true
        }
    }
    divClasses.appendChild(divNiveau);
  }

  document.getElementById("select all").addEventListener("click", async function() {
    console.log("select all")
    for(let n in cbClasses){
        for(let i in cbClasses[n]){
            cbClasses[n][i].checked = true
            if(!listInscrit.includes(listNiveau[n][i])){
                listInscrit.push(listNiveau[n][i])
            }
        }
    }
    await common.socketAdminAsync('setPermInscrit',[w,j,h,listInscrit])
  });

  document.getElementById("select none").addEventListener("click", async function() {
    console.log("select none")
    for(let n in cbClasses){
        for(let i in cbClasses[n]){
            cbClasses[n][i].checked = false
            if(listInscrit.includes(listNiveau[n][i])){
                listInscrit = listInscrit.filter(o => o != listNiveau[n][i]);
            }
        }
    }
    await common.socketAdminAsync('setPermInscrit',[w,j,h,listInscrit])
  });

  document.getElementById("inversed").addEventListener("click", async function() {
    console.log("inversed")
    for(let n in cbClasses){
        for(let i in cbClasses[n]){
            cbClasses[n][i].checked = !cbClasses[n][i].checked
            if(cbClasses[n][i].checked){
                if(!listInscrit.includes(listNiveau[n][i])){
                    listInscrit.push(listNiveau[n][i])
                }
            }else{
                if(listInscrit.includes(listNiveau[n][i])){
                    listInscrit = listInscrit.filter(o => o != listNiveau[n][i]);
                }
            }
        }
    }
    await common.socketAdminAsync('setPermInscrit',[w,j,h,listInscrit])
  });

  let groupeNonSpeciaux = groupes + listNiveau[0] + listNiveau[1] + listNiveau[2] + listNiveau[3]


  listInscrit.forEach(e=>{
    if(!groupeNonSpeciaux.includes(e)){
        addSpecial(e)
    }
  })

  function addSpecial(name){
    let event = document.createElement("button")
    event.classList.add("ami")
    divSpecial.appendChild(event);
    event.innerHTML = name 
    
    event.addEventListener("click", async function() {
        listInscrit = listInscrit.filter(o => o != name);
        divSpecial.removeChild(event);
        await common.socketAdminAsync('setPermInscrit',[w,j,h,listInscrit])
    })     
  }

  bAddSpecial.addEventListener("click", async function() {
    let name = inputSpecial.value
    if(name != ""){
        listInscrit.push(name)
        addSpecial(name)
        inputSpecial.value = ""
        await common.socketAdminAsync('setPermInscrit',[w,j,h,listInscrit])
    }
  });
}