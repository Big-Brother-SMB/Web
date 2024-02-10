export async function init(common){
    document.getElementById("ajouter ban").addEventListener('click',()=>{
        common.loadpage("/admin/ban/edit")
    })


    let listBan = await common.socketAdminAsync('getBan',null)
    
    let listUsers = await common.socketAsync('getListUserName',null)


    const BA = document.getElementById("BA")
    BA.innerHTML=''
    const BO = document.getElementById("BO")
    BO.innerHTML=''
    let i=0
    let j
    while(listBan.length>i){
        j=0
        while(listUsers.length>j){
            if(listBan[i].uuid==listUsers[j].uuid){
                listBan[i].first_name=listUsers[j].first_name
                listBan[i].last_name=listUsers[j].last_name
            }
            j++
        };
        i++
    };
    listBan.reverse()
    listBan.sort(function compareFn(a, b) {
        if(new Date(a.debut).getTime()>new Date(b.debut).getTime()){
            return -1
        }else if(new Date(a.debut).getTime()<new Date(b.debut).getTime()){
            return 1
        }else{
            return 0
        }
    })
    listBan.forEach(child=>{
        let ami = document.createElement("button")
        ami.classList.add("ami")
        ami.innerHTML = common.name(child.first_name,child.last_name) + " (" + new Date(child.debut).getWeek() + "/" + new Date(child.fin).getWeek() + ")"
        ami.addEventListener("click", async function() {
            common.loadpage("/admin/ban/edit?id="+child.id)
        })
        
        if(new Date(child.fin).getTime() < Date.now()){
            BO.appendChild(ami);
        }else{
            BA.appendChild(ami);
        }
    })
}