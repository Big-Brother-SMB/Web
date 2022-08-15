user = sessionStorage.getItem("user");
email = sessionStorage.getItem("email");

week = actualWeek

writeCookie("user",user)
writeCookie("email",email)
writeCookie("week",week)
writeCookie("RGPD",true)

database.ref("users/" + user + "/email").set(email);
database.ref("users/" + user + "/send mail").set(true)


setTimeout(function() {
  database.ref("users/" + user).once("value", function(snapshot1) {
    classe = snapshot1.child("classe").val()
    if(classe != null){
        writeCookie("classe",classe)
    }
    database.ref("modo/users/"+ user).once('value',function(snapshot2){
      if(snapshot2.val()===1){
        window.location.href = "/admin/menu/menu.html";
      } else if (snapshot1.child("tuto").val()!=true) {
        window.location.href = "/tuto/tuto.html";
      } else {
        window.location.href = "/menu/menu.html";
      }
    })
  })
},1000);





