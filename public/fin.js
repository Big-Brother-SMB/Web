
user = sessionStorage.getItem("user");
email = sessionStorage.getItem("email");
classe = sessionStorage.getItem("classe");
codeBar = sessionStorage.getItem("code bar");
console.log("classe : " + classe)


database.ref("codes barres/" + codeBar).once('value',function(snapshot) {
    if(snapshot.val() == null || snapshot.val() == user){
        console.log(snapshot.val())
        database.ref("codes barres/" + codeBar).set(user)
        database.ref("users/" + user + "/codes barres").set(codeBar)
        suite();
    }else{
        sessionStorage.setItem("auth err", 1);
        window.location.href = "index.html";
        
    }
})

function suite(){
    week = actualWeek

    writeCookie("user",user)
    writeCookie("email",email)
    writeCookie("classe",classe)
    writeCookie("week",week)
    writeCookie("RGPD",true)
    writeCookie("code bar", codeBar);
    
    database.ref("users/" + user + "/email").set(email);
    database.ref("users/" + user + "/send mail").set(true)
    
    /*database.ref("users/" + user + "/score").once("value", function(snapshot) {
        console.log("score : " + snapshot.val())
        if(snapshot.val() == null){
            console.log("score create")
            database.ref("users/" + user + "/score").set(0);
        }
    })*/
    
    database.ref("users/" + user + "/classe").once("value", function(snapshot) {
        console.log("classe database : " + snapshot.val())
        if(snapshot.val() == null){
            console.log("classe create")
            database.ref("users/" + user + "/classe").set(classe);
        }else{
            console.log("classe err")
            classe = snapshot.val()
            writeCookie("classe",classe)
        }
    })

    setTimeout(function() {
        window.location.href = "menu/menu.html";
    },2000);
}




