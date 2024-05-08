export async function init(common){
    document.getElementById("send").addEventListener("click",async function(){
        await common.socketAdminAsync('sendMusic',document.getElementById("link_yt").value)
    })
}