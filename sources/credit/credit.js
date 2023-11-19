export async function init(common){
    //troll
    document.getElementById("troll").addEventListener("click",()=>{
        let time = Date.now()+(3600*24*1000);
        document.cookie = "troll=" + time + "; max-age=" + (3600*24) + "; path=/";
        window.location.href = "/accueil";
    })
}   