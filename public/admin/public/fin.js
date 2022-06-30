
user = sessionStorage.getItem("user");
email = sessionStorage.getItem("email");

database.ref("modo/users/" + user).once("value", function(snapshot) {
    if(snapshot.val() != null){
        console.log("authorised")
        window.location.href = "menu/menu.html";
    }else{
        document.getElementById("article").innerHTML = "<img class=\"pass\" src=\"Images/croix.png\" />"
        document.getElementById("chargement").style = "display:none"
        document.getElementById("info").innerHTML = "NOPE"
    }
})



