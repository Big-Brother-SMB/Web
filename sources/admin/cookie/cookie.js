export async function init(common){
    if(common.admin_permission["cookie"]==0) common.loadpage("/options")
    
    document.getElementById("ajouter abonnement").addEventListener('click',()=>{
        common.loadpage("/admin/cookie/edit?modeAbo=true")
    })
    if(common.admin_permission["cookie"]<2) document.getElementById("ajouter abonnement").classList.add('cache')
    document.getElementById("ajouter ticket").addEventListener('click',()=>{
        common.loadpage("/admin/cookie/edit")
    })
    if(common.admin_permission["cookie"]<2) document.getElementById("ajouter ticket").classList.add('cache')


    let listAbo = await common.socketAdminAsync('getCookieSubscription',null)
    let listBon = await common.socketAdminAsync('getCookieTicket',null)
    
    let listUsers = await common.socketAsync('getListUserName',null)


    

    const SA = document.getElementById("SA")
    SA.innerHTML=''
    const SO = document.getElementById("SO")
    SO.innerHTML=''
    let i=0
    let j
    while(listAbo.length>i){
        j=0
        while(listUsers.length>j){
            if(listAbo[i].uuid==listUsers[j].uuid){
                listAbo[i].first_name=listUsers[j].first_name
                listAbo[i].last_name=listUsers[j].last_name
            }
            j++
        };
        i++
    };
    listAbo.reverse()
    listAbo.sort(function compareFn(a, b) {
        if(new Date(a.debut).getTime()>new Date(b.debut).getTime()){
            return -1
        }else if(new Date(a.debut).getTime()<new Date(b.debut).getTime()){
            return 1
        }else{
            return 0
        }
    })
    listAbo.forEach(child=>{
        let ami = document.createElement("button")
        ami.classList.add("ami")
        ami.innerHTML = common.name(child.first_name,child.last_name) + " (" + new Date(child.debut).getWeek() + "/" + new Date(child.fin).getWeek() + ")"
        ami.addEventListener("click", async function() {
            common.loadpage("/admin/cookie/edit?modeAbo=true&id="+child.id)
        })
        
        if(new Date(child.fin).getTime() < Date.now() && child.quantity==0){
            SO.appendChild(ami);
        }else{
            SA.appendChild(ami);
        }
    })

    const TA = document.getElementById("TA")
    TA.innerHTML=''
    const TO = document.getElementById("TO")
    TO.innerHTML=''
    i=0
    while(listBon.length>i){
        j=0
        while(listUsers.length>j){
            if(listBon[i].uuid==listUsers[j].uuid){
                listBon[i].first_name=listUsers[j].first_name
                listBon[i].last_name=listUsers[j].last_name
            }
            j++
        };
        i++
    };
    listBon.reverse()
    listBon.sort(function compareFn(a, b) {
        if(new Date(a.date).getTime()>new Date(b.date).getTime()){
            return -1
        }else if(new Date(a.date).getTime()<new Date(b.date).getTime()){
            return 1
        }else{
            return 0
        }
    })
    listBon.forEach(child=>{
        let ami = document.createElement("button")
        ami.classList.add("ami")
        ami.innerHTML = common.name(child.first_name,child.last_name)
        ami.addEventListener("click", async function() {
            common.loadpage("/admin/cookie/edit?id="+child.id)
        })
        if(child.date){
            ami.innerHTML+=" ("+ common.getDateHour(new Date(child.date)) +")"
            TO.appendChild(ami);
        } else{
            TA.appendChild(ami);
        }
    })
}