let link = document.createElement("link")
link.setAttribute("rel","stylesheet")
link.setAttribute("href","/troll/troll.css")
document.getElementsByTagName("head")[0].appendChild(link)


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
    console.log(prepath)
    if(window.location.pathname.includes("/menu")){
        source.setAttribute("src","/troll/cat.mp4")
    }else if(window.location.pathname.includes("/midi")){
        source.setAttribute("src","/troll/trollolo.mp4")
    }else if(window.location.pathname.includes("/perm")){
        source.setAttribute("src","/troll/chicken.mp4")
    }else if(window.location.pathname.includes("/amis")){
        source.setAttribute("src","/troll/kiwi.mp4")
    }else if(window.location.pathname.includes("/messagerie")){
        source.setAttribute("src","/troll/schnappi.mp4")
    }else if(window.location.pathname.includes("/options")){
        source.setAttribute("src","/troll/pizza.mp4")
    }else if(window.location.pathname.includes("/credit")){
        source.setAttribute("src","/troll/world.mp4")
    }else if(window.location.pathname.includes("/tuto")){
        source.setAttribute("src","/troll/shark.mp4")
    }else if(window.location.pathname.includes("/listeArcade")){
        source.setAttribute("src","/troll/kart.mp4")
    }else{
        source.setAttribute("src","")
    }
    video.load();
    video.play()
})