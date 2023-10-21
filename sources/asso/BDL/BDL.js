const group_name = "BDL"
export async function init(common){
    let list_post = await common.socketAsync("getPost","");

    console.log("post:",await common.socketAsync("getPost",""))

    const section = document.getElementById('post')
    
    list_post.sort((a, b) => (a.date < b.date) ? 1 : -1)
    for(const post of list_post){
        if(post.group2==group_name){
            common.socketAsync("postLu",{id:post.id})

            let div = document.createElement("div")
            div.className="divPost"

            if(!post.lu){
                //div.classList.add('notif')
            }
    
            let titre = document.createElement("p")
            titre.className="titre"
            titre.innerHTML=post.title
            div.appendChild(titre)
    
            let date = document.createElement("p")
            date.className="text"
            date.innerHTML=post.text
            div.appendChild(date)
    
            section.appendChild(div)
        }
    }

    if(common.groups.indexOf(group_name)!=-1 || common.admin > 0){
        const btn_write = document.getElementById('iconWritePost')
        btn_write.classList.remove("cache")
        btn_write.addEventListener("click",async ()=>{
            common.popUp_Active('Post:','',async (confirmer)=>{
                const body = document.createElement('div')
                document.getElementById("popup-body").appendChild(body)
                body.style.textAlign="center"

                let title = document.createElement('input')
                title.setAttribute("autocomplete","off")
                title.setAttribute("type","text")
                title.setAttribute("placeholder","Titre")
                title.style.marginBottom="20px"
                body.appendChild(title)

                let text = document.createElement('textarea')
                text.setAttribute("placeholder","Texte")
                body.appendChild(text)

                confirmer.innerHTML='Envoyer'
                confirmer.addEventListener('click',async ()=>{
                    await common.socketAsync("setPost",{id:crypto.randomUUID(),group:group_name,title:title.value,text:text.value,date:new Date()});
                    common.popUp_Stop()

                    let div = document.createElement("div")
                    div.className="divPost"
            
                    let titre = document.createElement("p")
                    titre.className="titre"
                    titre.innerHTML=title.value
                    div.appendChild(titre)
            
                    let date = document.createElement("p")
                    date.className="text"
                    date.innerHTML=text.value
                    div.appendChild(date)
            
                    section.insertBefore(div,section.children[0])
                })
            })
        })
    }
}