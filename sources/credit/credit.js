export async function init(common){
    //troll
    document.getElementById("troll").addEventListener("click",()=>{
        let time = Date.now()+(600*1000);
        document.cookie = "troll=" + time + "; max-age=" + (600) + "; path=/";
        window.location.href = "/accueil";
    })
}   