
user = sessionStorage.getItem("user");
email = sessionStorage.getItem("email");



function suite(){
    week = actualWeek

    writeCookie("user",user)
    writeCookie("email",email)
    writeCookie("week",week)
    writeCookie("RGPD",true)
    
    database.ref("users/" + user + "/email").set(email);
    database.ref("users/" + user + "/send mail").set(true)
    
    
    database.ref("users/" + user + "/classe").once("value", function(snapshot) {
        classe = snapshot.val()
        if(classe != null){
            
            writeCookie("classe",classe)
        }
    })

    setTimeout(function() {
        window.location.href = "menu/menu.html";
    },2000);
}




