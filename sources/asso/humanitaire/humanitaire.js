const group_name = "Lycéens humanitaires"
export async function init(common){
    async function refreshPost(){
        let list_post = await common.socketAsync("getPost","");

        const section = document.getElementById('post')
        section.innerHTML=""
        
        list_post.sort((a, b) => (a.date < b.date) ? 1 : -1)
        for(const post of list_post){
            if(post.group2==group_name){
                common.socketAsync("postLu",{id:post.id})
    
                let div = document.createElement("div")
                div.className="divPost"
    
                if(!post.lu){
                    div.scrollIntoView()
                }
        
                let titre = document.createElement("p")
                titre.className="titre"
                titre.innerHTML=post.title
                div.appendChild(titre)
        
                let texte = document.createElement("p")
                texte.className="text"
                texte.innerHTML=post.text
                div.appendChild(texte)

                div.addEventListener("click",async ()=>{
                    common.popUp_Active('Post:','Que voulez-vous faire?',async (btn)=>{
                        btn.innerHTML="Supprimer"
                        btn.addEventListener("click",async ()=>{
                            await common.socketAsync("delPost",{id:post.id});
                            common.popUp_Stop()
                            await new Promise(r => setTimeout(r, 500));
                            refreshPost()
                        },{once:true})
              
                        let btn2 = document.createElement("button")
                        btn2.innerHTML="Modifier"
                        btn2.addEventListener("click",()=>{
                            popUp_post(post.id,post.title,post.text,post.date)
                        },{once:true})
                        btn.parentNode.appendChild(btn2)
                    })
                })
        
                section.appendChild(div)
            }
        }
    }
    refreshPost()

    if(common.groups.indexOf(group_name)!=-1 || common.admin > 0){
        const btn_write = document.getElementById('iconWritePost')
        btn_write.classList.remove("cache")
        btn_write.addEventListener("click",async ()=>{
            popUp_post()
        })
    }

    function popUp_post(id,titleStr,textStr,date){
        if(id==undefined) id=crypto.randomUUID()
        if(titleStr==undefined) titleStr=""
        if(textStr==undefined) textStr=""
        if(date==undefined) date=new Date()


        common.popUp_Active('Post:','',async (btn)=>{
            const body = document.createElement('div')
            document.getElementById("popup-body").appendChild(body)
            body.style.textAlign="center"

            let title = document.createElement('input')
            title.setAttribute("autocomplete","off")
            title.setAttribute("type","text")
            title.setAttribute("placeholder","Titre")
            title.setAttribute("value",titleStr)
            title.style.marginBottom="20px"
            body.appendChild(title)

            let text = document.createElement('textarea')
            text.setAttribute("placeholder","Texte")
            text.value=textStr
            body.appendChild(text)

            
            btn.innerHTML="Image"
            btn.addEventListener("click",()=>{
                common.popUp_Active("Upload Image",
                    "<form action='/fileupload/image' method='post' enctype='multipart/form-data'>\n"
                    +"  <input type='text' name='title' placeholder='Titre' value='" + title.value + "'><br>\n"
                    +"  <input type='file' name='file' class='btn'><br>\n"
                    +"  <input style='display: none;' type='text' name='token' value='" + common.key + "'>\n"
                    +"  <input style='display: none;' type='text' name='group' value='" + group_name + "'>\n"
                    +"  <input style='display: none;' type='text' name='id' value='" + id + "'>\n"
                    +"  <input style='display: none;' type='text' name='date' value='" + date + "'>\n"
                    +"  <input type='submit' class='btn'>\n"
                    +"</form>",async (btn)=>{
                    btn.innerHTML='Annuler'
                    btn.addEventListener("click",()=>{
                        common.popUp_Stop()
                    },{once:true})
                })
            },{once:true})

            let confirmer = document.createElement("button")
            confirmer.innerHTML='Envoyer'
            confirmer.addEventListener('click',async ()=>{
                await common.socketAsync("setPost",{id:id,group:group_name,title:title.value,text:text.value,date:date});
                common.popUp_Stop()
                await new Promise(r => setTimeout(r, 500));
                refreshPost()
            })
            btn.parentNode.appendChild(confirmer)
        })
    }
}