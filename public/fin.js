email = sessionStorage.getItem("email");
let userT = email.split("@")[0].replaceAll('.', ' ');
userT[1].toUpperCase();
//userT[0].capitalize();
user = userT[0]+userT[1]

week = actualWeek

writeCookie("user",user)
writeCookie("email",email)
writeCookie("week",week)
writeCookie("RGPD",true)

database.ref("names/" + user).set(0);
database.ref("users/" + user + "/email").set(email);


setTimeout(function() {
  database.ref("users/" + user).once("value", function(snapshot1) {
    classe = snapshot1.child("classe").val()
    if(classe != null){
        writeCookie("classe",classe)
    }
    database.ref("modo/users/"+ user).once('value',function(snapshot2){
      if(snapshot2.val()===1){
        window.location.href = "/admin/menu/menu.html";
      }
      else {
        window.location.href = "/menu/menu.html";
      }
    })
  })
},1000);
