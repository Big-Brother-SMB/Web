export async function init(common){
    document.getElementById("zelda").addEventListener("click",async ()=>{
        await common.socketAsync("setAchievement",{event:"zelda",value:1})
        common.writeCookie("theme mode",6)
        setTimeout(() => {
          window.location.href = "/accueil";
        }, 1000);
    })

    document.getElementById("troll").addEventListener("click",async ()=>{
        let time = 3600*1;
        document.cookie = "troll=" + (Date.now()+(time*1000)) + "; max-age=" + time + "; path=/";
        window.location.href = "/accueil";
    })
}   