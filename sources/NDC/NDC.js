export async function init(common){
    var dervaleur; 
    document.getElementById("jeuSelect").addEventListener("change", function(a) {
        if(typeof dervaleur == "undefined"){ 
            document.getElementById(document.getElementById("jeuSelect").value).classList.remove("cache");
            dervaleur = document.getElementById("jeuSelect").value; 
        }
        else{
            document.getElementById(dervaleur).classList.add("cache");
            document.getElementById(document.getElementById("jeuSelect").value).classList.remove("cache");
            dervaleur = document.getElementById("jeuSelect").value; 
        }
        document.getElementById("jeu").href="NDC/launcher.html?jeu="+document.getElementById("jeuSelect").value+".pyxapp"
    });
}