email = sessionStorage.getItem("email");

userT = email.split("@")[0].split(".");
userT[0]=userT[0][0].toUpperCase()+userT[0].slice(1)
userT[1]=userT[1].toUpperCase();
userName = userT[0]+" "+userT[1]
user = email.replaceAll('.','µ')

week = actualWeek

writeCookie("name",userName)
writeCookie("user",user)
writeCookie("email",email)
writeCookie("week",week)
writeCookie("RGPD",true)

database.ref("names/" + user).once("value", function(snapshot) {
  if(snapshot.val()==null){
    database.ref("names/" + user).set(userName);
  }
})
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
