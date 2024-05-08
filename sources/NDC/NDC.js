export async function init(common){
    document.getElementById("jeuSelect").addEventListener("change",function(e){
        document.getElementById("jeu").href="NDC/launcher.html?jeu="+document.getElementById("jeuSelect").value


    })



}
