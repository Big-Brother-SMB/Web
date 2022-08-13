user = sessionStorage.getItem("user");
email = sessionStorage.getItem("email");

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
    database.ref("modo/users/"+ user).once('value',function(snapshot){
        if(snapshot.val()===1){
          window.location.href = "/admin/menu/menu.html";
        } else {
          window.location.href = "/menu/menu.html";
        }
    })
},1000);





