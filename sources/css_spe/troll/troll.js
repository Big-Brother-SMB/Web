export async function init(common){
    const audio = new Audio()
    audio.controls = false
    let video = document.createElement('video')
    let source = document.createElement('source')
    video.setAttribute("id","background-video")
    video.setAttribute("loop","")
    source.setAttribute("id","background-video-src")
    source.setAttribute("src","")
    source.setAttribute("type","video/mp4")
    video.appendChild(source)
    document.body.appendChild(video)
    let prepath = "/accueil"

    document.addEventListener("click",async ()=>{
        if(window.location.pathname.includes(prepath)) return
        prepath = "/" + window.location.pathname.split("/")[1]

        document.body.style.backgroundImage=""
        source.setAttribute("src","")
        audio.src = ""
        document.body.style.backgroundSize=""
        document.body.style.backgroundPosition="center"
        document.body.style.backgroundAttachment="fixed"
        document.body.style.backgroundColor=""

        
        if(common.themeMode==4 && !document.location.pathname.includes("admin")){
            if(window.location.pathname.includes("/menu")){
                audio.src = "/css_spe/troll/NyanCat.mp3"
                document.body.style.backgroundImage=""
                document.body.style.backgroundSize="cover"
                document.body.style.backgroundColor="black"
                setTimeout(() => {
                    if(window.location.pathname.includes("/menu")) document.body.style.backgroundImage="url('/css_spe/troll/cat-space.gif')"
                }, 4000);

            }else if(window.location.pathname.includes("/perm")){
                audio.src = "/css_spe/troll/trollolo.mp3"
                document.body.style.backgroundImage="url('/css_spe/troll/troll-face.gif')"
                document.body.style.backgroundSize="cover"
                loopDragon()
            }else if(window.location.pathname.includes("/listeArcade")){
                source.setAttribute("src","/css_spe/troll/chicken.mp4")
            }else if(window.location.pathname.includes("/amis")){
                source.setAttribute("src","/css_spe/troll/kiwi.mp4")
            }else if(window.location.pathname.includes("/lieu")){
                
            }else if(window.location.pathname.includes("/messagerie")){
                source.setAttribute("src","/css_spe/troll/schnappi.mp4")
            }else if(window.location.pathname.includes("/credit")){
                audio.src = "/css_spe/troll/world.mp3"
            }else if(window.location.pathname.includes("/tuto")){
                audio.src = "/css_spe/troll/shark.mp3"
            }else if(window.location.pathname.includes("/midi")){
                audio.src = "/css_spe/troll/dragon.mp3"
                document.body.style.backgroundImage="url('/css_spe/troll/toothless-dragon.gif')"
                document.body.style.backgroundSize="cover"
                loopDragon()
            }
        }
        try{
            await audio.load()
            audio.play()
            await video.load()
            video.play()
        }catch(e){}
    })

    function loopDragon(){
        if(window.location.pathname.includes("/midi") || window.location.pathname.includes("/perm")){
            if(document.body.style.backgroundSize=="cover"){
                document.body.style.backgroundSize=""
            }else{
                document.body.style.backgroundSize="cover"
            }
            setTimeout(loopDragon,2000)
        }
    }
}