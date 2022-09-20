firebase.auth().onAuthStateChanged(function(userX) {
  if(userX){
    user = userX.email.replaceAll('.','µ')

    email=userX.email

    writeCookie("user",user)
    writeCookie("email",email)
    writeCookie("week",actualWeek)
    writeCookie("RGPD",true)
    database.ref("users/" + user + "/email").set(email);
    
    setTimeout(function() {
      database.ref("names/"+user).once('value',function(snapshot){
        userT = userX.email.split("@")[0].split(".");
        userT[0]=userT[0][0].toUpperCase()+userT[0].slice(1)
        userT[1]=userT[1].toUpperCase();
        userName = userT[0]+" "+userT[1]
        if(snapshot.val()==null){
            database.ref("names/" + user).set(userName);
        }else{
            userName=snapshot.val()
            writeCookie("name",userName)
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
  }else{
    window.location.href = window.location.origin + "/index.html";
  }
})
