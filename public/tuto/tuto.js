document.getElementById("OK").addEventListener("click", menuFunction)

function menuFunction() {
    database.ref("users/" + user + "/tuto").set(true)
    window.location.href = "/menu/menu.html";
}

database.ref("users/" + user + "/tuto").once('value').then(function(snapshot) {
    if(snapshot.val() != true){
        document.getElementById("retour").style.visibility="hidden"
    }
})


function miseenavant(id,temp)
{
let elem=document.getElementById(id);
elem.style.background="yellow";
setTimeout(function(){elem.style.background="";},temp);
}